#!/usr/bin/env python3
"""
Napier Council Full Rates Scraper - Simplified Version
Complete automation: Address search → RID extraction → Rates data extraction
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
    """
    
    print("="*80)
    print("NAPIER COUNCIL RATES SCRAPER")
    print(f"Address: {address}")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Step 1: Navigate to property search
            print("\n[1/6] Loading Napier Council property search...")
            page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                     timeout=30000, wait_until='networkidle')
            page.wait_for_timeout(1000)
            print("[OK] Page loaded")
            
            # Step 2: Select "Address or Valuation" from dropdown
            print("\n[2/6] Setting search type to 'Address'...")
            search_type = page.query_selector('select[name="searchtype"]')
            if search_type:
                search_type.select_option('address', timeout=5000)
                print("[OK] Selected 'Address or Valuation'")
            else:
                print("[WARN] Could not find search type dropdown")
            
            # Step 3: Enter address
            print(f"\n[3/6] Entering address: {address}...")
            
            # Find input by placeholder text
            address_field = page.query_selector('input[placeholder*="Enter Address"]')
            
            if not address_field:
                # Try to find any visible text input with address in placeholder
                all_inputs = page.query_selector_all('input[type="text"]')
                for inp in all_inputs:
                    placeholder = inp.get_attribute('placeholder') or ''
                    if 'address' in placeholder.lower() and inp.is_visible():
                        address_field = inp
                        break
            
            if not address_field:
                print("[ERROR] Could not find address input field")
                print("[INFO] Please manually enter the address in the browser")
                print("Keeping browser open for 60 seconds...")
                page.wait_for_timeout(60000)
                return None
            
            address_field.fill(address)
            print(f"[OK] Entered: {address}")
            
            # Step 4: Wait for autocomplete and hover over result
            print("\n[4/6] Waiting for autocomplete...")
            page.wait_for_timeout(2000)
            
            # Look for dropdown results
            dropdown = page.query_selector('[class*="autocomplete"], ul[role="listbox"], .ui-autocomplete')
            
            if dropdown:
                print("[OK] Found autocomplete dropdown")
                
                # Try various selectors for result items
                result_item = None
                for selector in ['li', 'tr', 'a', '[role="option"]']:
                    result_item = dropdown.query_selector(selector)
                    if result_item:
                        print(f"   Found result item: <{selector}>")
                        break
                
                if result_item:
                    print("   Hovering over result to activate search button...")
                    result_item.hover()
                    page.wait_for_timeout(800)
                    print("[OK] Hovered")
                else:
                    print("[WARN] Could not find result item")
            else:
                print("[WARN] No autocomplete dropdown detected")
            
            # Step 5: Click search button
            print("\n[5/6] Submitting search...")
            page.wait_for_timeout(500)
            
            search_button = page.query_selector('button:has-text("SEARCH"), button:has-text("Search")')
            
            if search_button:
                is_disabled = search_button.is_disabled()
                if is_disabled:
                    print("[WARN] Search button is disabled")
                    print("[INFO] Please manually click search in the browser")
                    page.wait_for_timeout(30000)
                    
                    # Check URL again after manual action
                    current_url = page.url
                    if 'rid=' not in current_url:
                        return None
                else:
                    search_button.click()
                    print("[OK] Search submitted")
            else:
                print("[WARN] Search button not found, trying Enter key...")
                address_field.press('Enter')
                page.wait_for_timeout(1000)
            
            # Wait for navigation
            print("\n[6/6] Waiting for property page...")
            try:
                page.wait_for_load_state('networkidle', timeout=15000)
                page.wait_for_timeout(2000)
            except:
                print("[WARN] Page load timeout")
            
            current_url = page.url
            print(f"   URL: {current_url}")
            
            if 'rid=' not in current_url:
                print("[ERROR] URL doesn't contain RID parameter")
                print("[INFO] May need manual intervention")
                page.wait_for_timeout(15000)
                return None
            
            # Extract RID
            rid_match = re.search(r'rid=([^&]+)', current_url)
            rid = rid_match.group(1) if rid_match else None
            print(f"[OK] RID: {rid}")
            
            # Extract rates data
            print("\nExtracting rates data...")
            html = page.content()
            
            result = {
                'rid': rid,
                'url': current_url,
                'address': address,
                'timestamp': datetime.now().isoformat(),
                'success': False,
                'data': {}
            }
            
            # Capital Value
            m = re.search(r'<td>Capital\s*Value[^>]*>.*?</td>\s*<td>([^<]+)</td>', html, re.I | re.S)
            if m:
                val = re.sub(r'[^\d.]', '', m.group(1).replace('$','').replace(',',''))
                try:
                    result['data']['capital_value'] = int(float(val))
                    print(f"[OK] Capital Value: ${result['data']['capital_value']:,}")
                except: pass
            
            # Land Value
            m = re.search(r'<td>Land\s*Value[^>]*>.*?</td>\s*<td>([^<]+)</td>', html, re.I | re.S)
            if m:
                val = re.sub(r'[^\d.]', '', m.group(1).replace('$','').replace(',',''))
                try:
                    result['data']['land_value'] = int(float(val))
                    print(f"[OK] Land Value: ${result['data']['land_value']:,}")
                except: pass
            
            # Annual Rates
            m = re.search(r'Total Rates Levied</strong></td>\s*<td[^>]*>([\d,]+\.\d+)', html, re.I)
            if m:
                val = m.group(1).replace(',','')
                try:
                    result['data']['annual_rates'] = float(val)
                    print(f"[OK] Annual Rates: ${result['data']['annual_rates']:,.2f}")
                except: pass
            
            # Legal Description
            m = re.search(r'<td>Legal Description&nbsp;</td>\s*<td[^>]*>(LOT\s+\d+\s+DP\s+\d+)', html, re.I)
            if m:
                result['data']['legal_description'] = m.group(1).strip()
                print(f"[OK] Legal: {result['data']['legal_description']}")
            
            # Calculated fields
            if 'capital_value' in result['data'] and 'land_value' in result['data']:
                result['data']['improvements_value'] = result['data']['capital_value'] - result['data']['land_value']
                print(f"[OK] Improvements: ${result['data']['improvements_value']:,}")
            
            if 'annual_rates' in result['data'] and 'capital_value' in result['data']:
                pct = (result['data']['annual_rates'] / result['data']['capital_value']) * 100
                result['data']['rates_percent_cv'] = round(pct, 3)
                print(f"[OK] Rates % of CV: {result['data']['rates_percent_cv']}%")
            
            result['success'] = len(result['data']) > 0
            
            # Save results
            safe_addr = re.sub(r'[^a-zA-Z0-9]+', '_', address)[:30]
            out_path = f'due-diligence-mvp/napier_{safe_addr}_rates.json'
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)
            print(f"\n[OK] Saved: {out_path}")
            
            # Screenshot
            shot_path = f'due-diligence-mvp/napier_{safe_addr}.png'
            page.screenshot(path=shot_path, full_page=True)
            print(f"[OK] Screenshot: {shot_path}")
            
            return result
            
        except Exception as e:
            print(f"\n[ERROR] {e}")
            import traceback
            traceback.print_exc()
            return None
        
        finally:
            print("\nClosing browser in 5 seconds...")
            page.wait_for_timeout(5000)
            browser.close()


if __name__ == '__main__':
    test_addrs = ["18 Ferguson Avenue", "16 Ferguson Avenue"]
    
    for addr in test_addrs:
        print(f"\n{'='*80}\nTesting: {addr}\n{'='*80}\n")
        result = scrape_napier_rates_by_address(addr)
        
        if result and result.get('success'):
            print(f"\n[SUCCESS] {len(result['data'])} data points extracted")
        else:
            print(f"\n[FAILED]")
        
        print("\n\n")
