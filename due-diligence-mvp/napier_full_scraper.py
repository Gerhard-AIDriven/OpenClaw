#!/usr/bin/env python3
"""
Napier Council Full Rates Scraper
Complete automation: Address search → RID extraction → Rates data extraction

Workflow:
1. Go to Napier Council property search page
2. Enter address
3. Wait for autocomplete dropdown
4. Hover over first result to activate search button
5. Click search
6. Extract RID from URL
7. Scrape all rates data from property page
"""

import json
import re
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError

sys.stdout.reconfigure(encoding='utf-8')

def scrape_napier_rates_by_address(address: str):
    """
    Complete workflow: Search by address and extract all rates data
    
    Args:
        address: Street address (e.g., "16 Ferguson Avenue")
    
    Returns:
        Dictionary with all rates data
    """
    
    print("="*80)
    print("NAPIER COUNCIL RATES SCRAPER - FULL AUTOMATION")
    print(f"Address: {address}")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible for debugging
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Step 1: Navigate to property search
            print("\n[1/7] Navigating to Napier Council property search...")
            page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                     timeout=30000, wait_until='networkidle')
            print("[OK] Page loaded")
            
            # Step 2: Select "Search by Address" from dropdown
            print("\n[2/7] Selecting 'Search by Address'...")
            try:
                # Wait for the page to fully load
                page.wait_for_timeout(1000)
                
                # Make sure we're interacting with the property search form, not header search
                # The property search dropdown should be within the main content area
                property_search_form = page.query_selector('form[method="get"], .property-search, [class*="property"] form')
                
                if not property_search_form:
                    print("[INFO] Looking for search type dropdown in main content...")
                    # Try to find the search type selector specifically
                    search_type_selectors = [
                        'select[name*="search"]',
                        '#searchType',
                        '[class*="search-type"]',
                    ]
                    
                    search_type = None
                    for selector in search_type_selectors:
                        search_type = page.query_selector(selector)
                        if search_type:
                            # Verify it's visible and in the main content
                            if search_type.is_visible():
                                print(f"[OK] Found search type dropdown: {selector}")
                                break
                    
                    if search_type:
                        search_type.select_option('address', timeout=5000)
                        print("[OK] Selected 'Search by Address'")
                    else:
                        print("[WARN] Could not find search type dropdown")
                else:
                    print("[OK] Found property search form")
                    # Look for the search type within the form
                    search_type = property_search_form.query_selector('select')
                    if search_type:
                        search_type.select_option('address', timeout=5000)
                        print("[OK] Selected 'Search by Address'")
                    
            except Exception as e:
                print(f"[WARN] Dropdown selection failed: {e}")
                print("   Continuing anyway...")
            
            # Step 3: Enter address
            print(f"\n[3/7] Entering address: {address}...")
            
            # Find the search term input field
            # Based on screenshot: placeholder="Enter Address or Valuation..."
            address_selectors = [
                'input[placeholder*="Enter Address"]',
                'input[placeholder*="Address or Valuation"]',
                'input[placeholder="Enter Address or Valuation..."]',
                'input[name*="search"]',
                'input[type="text"]',
            ]
            
            address_field = None
            for selector in address_selectors:
                address_field = page.query_selector(selector)
                if address_field and address_field.is_visible():
                    # Verify it's not in the header by checking if it's after the "Search by" dropdown
                    parent_text = address_field.evaluate('''el => {
                        let parent = el.parentElement;
                        while (parent && parent.tagName !== 'BODY') {
                            const text = parent.textContent || '';
                            if (text.includes('Search by') || text.includes('Search term')) {
                                return 'property-search';
                            }
                            if (parent.tagName === 'HEADER' || parent.tagName === 'NAV') {
                                return 'header';
                            }
                            parent = parent.parentElement;
                        }
                        return 'unknown';
                    }''')
                    
                    if parent_text == 'property-search':
                        print(f"[OK] Found property search field: {selector}")
                        break
                    else:
                        address_field = None  # Keep looking
            
            if not address_field:
                # Last resort: find any visible text input that's not in header
                print("[INFO] Trying alternative search...")
                all_inputs = page.query_selector_all('input[type="text"]')
                for inp in all_inputs:
                    placeholder = inp.get_attribute('placeholder') or ''
                    if 'address' in placeholder.lower() and inp.is_visible():
                        # Double-check it's not in header
                        bounding_box = inp.bounding_box()
                        if bounding_box and bounding_box['y'] > 200:  # Below header
                            address_field = inp
                            print(f"[OK] Found address field by position and placeholder")
                            break
            
            if not address_field:
                print("[ERROR] Could not find address input field")
                print("[INFO] Taking screenshot for debugging...")
                page.screenshot(path='due-diligence-mvp/debug_no_address_field.png')
                print("[INFO] Please check the screenshot and manual page inspection")
                page.wait_for_timeout(30000)  # Keep open for inspection
                return None
            
            # Clear and enter the address
            address_field.fill('')
            address_field.fill(address)
            print(f"[OK] Entered: {address}")
            
            # Step 4: Wait for autocomplete and hover over first result
            print("\n[4/7] Waiting for autocomplete results...")
            page.wait_for_timeout(2500)  # Wait a bit longer
            
            # Look for dropdown with results - try many selectors
            dropdown_selectors = [
                'ul[role="listbox"]',
                '[class*="autocomplete"]',
                '[class*="suggestion"]',
                'ul.ui-autocomplete',
                '.typeahead-results',
                'div.dropdown-menu',
                'ul.dropdown',
                '[class*="search-result"]',
                'table',  # Some sites use tables for autocomplete
            ]
            
            dropdown = None
            used_selector = None
            for selector in dropdown_selectors:
                dropdown = page.query_selector(selector)
                if dropdown:
                    used_selector = selector
                    print(f"[OK] Found dropdown: {selector}")
                    break
            
            if dropdown:
                # Try many different selectors for result items
                result_selectors = [
                    'li',
                    'tr',
                    'div',
                    'a',
                    'td',
                    '[role="option"]',
                    'li.ui-menu-item',
                    '[class*="item"]',
                    'a.typeahead-result',
                    '.result',
                    '.option',
                    'tbody tr',
                ]
                
                result_item = None
                for selector in result_selectors:
                    result_item = dropdown.query_selector(selector)
                    if result_item:
                        print(f"[OK] Found result item: {selector}")
                        break
                
                if result_item:
                    print("   Hovering over first result to activate search button...")
                    try:
                        result_item.hover()
                        page.wait_for_timeout(800)  # Wait a bit longer for hover to activate
                        print("[OK] Hovered over result")
                        
                        # Verify search button is now enabled
                        search_button = page.query_selector('button:has-text("Search")')
                        if search_button and not search_button.is_disabled():
                            print("[OK] Search button is now enabled!")
                        else:
                            print("[WARN] Search button still appears disabled, will try clicking anyway...")
                    except Exception as e:
                        print(f"[WARN] Hover failed: {e}")
                        print("   Trying to click the result item instead...")
                        try:
                            result_item.click()
                            page.wait_for_timeout(500)
                            print("[OK] Clicked result item")
                        except:
                            print("[WARN] Click also failed")
                else:
                    print("[WARN] Could not find result item in dropdown")
                    print("   Will try to submit anyway...")
                    
                    # Try pressing Enter which sometimes works
                    print("   Trying Enter key...")
                    address_field.press('Enter')
                    page.wait_for_timeout(1000)
            else:
                print("[WARN] No dropdown found - may need to adjust selectors")
                print("   Trying Enter key...")
                address_field.press('Enter')
                page.wait_for_timeout(1000)
            
            # Step 5: Click search button
            print("\n[5/7] Submitting search...")
            page.wait_for_timeout(1000)
            
            search_button = page.query_selector('button:has-text("Search")')
            if not search_button:
                search_button = page.query_selector('input[type="submit"]')
            if not search_button:
                search_button = page.query_selector('button[type="submit"]')
            
            if search_button:
                is_disabled = search_button.is_disabled()
                if is_disabled:
                    print("[WARN] Search button is disabled")
                    print("[INFO] This might mean:")
                    print("   - No results matched the address")
                    print("   - Need to manually select from dropdown")
                    print("   Keeping browser open for manual intervention...")
                    page.wait_for_timeout(10000)
                    return None
                else:
                    search_button.click()
                    print("[OK] Search submitted")
            else:
                print("[WARN] No search button found, trying Enter key...")
                address_field.press('Enter')
                print("[OK] Pressed Enter")
            
            # Wait for navigation
            print("\n[6/7] Waiting for property page to load...")
            try:
                page.wait_for_load_state('networkidle', timeout=15000)
                page.wait_for_timeout(2000)
            except TimeoutError:
                print("[WARN] Page load timeout, but continuing...")
            
            # Check if we got to the property page
            current_url = page.url
            print(f"   Result URL: {current_url}")
            
            if 'rid=' not in current_url:
                print("[ERROR] URL doesn't contain 'rid=' parameter")
                print("[INFO] May need to handle multiple results or manual selection")
                page.wait_for_timeout(10000)
                return None
            
            # Extract RID
            rid_match = re.search(r'rid=([^&]+)', current_url)
            if rid_match:
                rid = rid_match.group(1)
                print(f"[OK] Extracted RID: {rid}")
            else:
                print("[ERROR] Could not extract RID from URL")
                return None
            
            # Step 7: Extract rates data
            print("\n[7/7] Extracting rates data...")
            html_content = page.content()
            
            result = {
                'rid': rid,
                'url': current_url,
                'search_address': address,
                'scrape_timestamp': datetime.now().isoformat(),
                'success': False,
                'data': {}
            }
            
            # Extract Capital Value
            cv_match = re.search(
                r'<td>Capital\s*Value[^>]*>.*?</td>\s*<td>([^<]+)</td>',
                html_content,
                re.IGNORECASE | re.DOTALL
            )
            if cv_match:
                cv_str = re.sub(r'[^\d.]', '', cv_match.group(1).replace('$', '').replace(',', ''))
                try:
                    result['data']['capital_value'] = int(float(cv_str))
                    print(f"[OK] Capital Value: ${result['data']['capital_value']:,}")
                except:
                    pass
            
            # Extract Land Value
            lv_match = re.search(
                r'<td>Land\s*Value[^>]*>.*?</td>\s*<td>([^<]+)</td>',
                html_content,
                re.IGNORECASE | re.DOTALL
            )
            if lv_match:
                lv_str = re.sub(r'[^\d.]', '', lv_match.group(1).replace('$', '').replace(',', ''))
                try:
                    result['data']['land_value'] = int(float(lv_str))
                    print(f"[OK] Land Value: ${result['data']['land_value']:,}")
                except:
                    pass
            
            # Extract Annual Rates (Total Rates Levied)
            rates_match = re.search(
                r'<td[^>]*colspan[^>]*>Total Rates Levied</td>\s*<td[^>]*>([\d,]+\.\d+)',
                html_content,
                re.IGNORECASE
            )
            if not rates_match:
                rates_match = re.search(
                    r'Total Rates Levied</strong></td>\s*<td[^>]*>([\d,]+\.\d+)',
                    html_content,
                    re.IGNORECASE
                )
            
            if rates_match:
                rates_str = rates_match.group(1).replace(',', '')
                try:
                    result['data']['annual_rates'] = float(rates_str)
                    print(f"[OK] Annual Rates: ${result['data']['annual_rates']:,.2f}")
                except:
                    pass
            
            # Extract Legal Description
            legal_match = re.search(
                r'<td>Legal Description&nbsp;</td>\s*<td[^>]*>(LOT\s+\d+\s+DP\s+\d+)',
                html_content,
                re.IGNORECASE
            )
            if legal_match:
                result['data']['legal_description'] = legal_match.group(1).strip()
                print(f"[OK] Legal Description: {result['data']['legal_description']}")
            
            # Calculate derived values
            if 'capital_value' in result['data'] and 'land_value' in result['data']:
                result['data']['improvements_value'] = (
                    result['data']['capital_value'] - result['data']['land_value']
                )
                print(f"[OK] Improvements Value: ${result['data']['improvements_value']:,} (calculated)")
            
            if 'annual_rates' in result['data'] and 'capital_value' in result['data']:
                rates_pct = (result['data']['annual_rates'] / result['data']['capital_value']) * 100
                result['data']['rates_as_percent_cv'] = round(rates_pct, 3)
                print(f"[OK] Rates as % of CV: {result['data']['rates_as_percent_cv']}%")
            
            result['success'] = len(result['data']) > 0
            
            # Save results
            safe_address = re.sub(r'[^a-zA-Z0-9]+', '_', address)[:30]
            output_path = f'due-diligence-mvp/napier_{safe_address}_rates.json'
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)
            print(f"\n[OK] Data saved: {output_path}")
            
            # Take screenshot
            screenshot_path = f'due-diligence-mvp/napier_{safe_address}_screenshot.png'
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[OK] Screenshot saved: {screenshot_path}")
            
            return result
            
        except Exception as e:
            print(f"\n[ERROR] {e}")
            import traceback
            traceback.print_exc()
            return None
        
        finally:
            print("\n[INFO] Browser will close in 5 seconds...")
            page.wait_for_timeout(5000)
            browser.close()


if __name__ == '__main__':
    # Test with known addresses
    test_addresses = [
        "18 Ferguson Avenue",
        "16 Ferguson Avenue",
    ]
    
    for addr in test_addresses:
        print(f"\n{'='*80}")
        print(f"Testing: {addr}")
        print(f"{'='*80}\n")
        
        result = scrape_napier_rates_by_address(addr)
        
        if result and result.get('success'):
            print(f"\n[SUCCESS] Extraction complete for {addr}")
            print(f"Data points: {len(result['data'])}")
        else:
            print(f"\n[FAILED] Could not extract data for {addr}")
        
        print("\n\n")
