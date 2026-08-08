#!/usr/bin/env python3
"""
Napier Council Rates Scraper - Automated Version
Searches by address and extracts property rates data
"""

import json
import re
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError

def scrape_napier_rates(address: str):
    """
    Scrape Napier Council property page for rates information
    
    Args:
        address: Street address (e.g., "16 Ferguson Avenue")
    
    Returns:
        Dictionary with property rates data
    """
    
    print("="*80)
    print(f"NAPIER COUNCIL RATES SCRAPER")
    print(f"Address: {address}")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible for debugging
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Step 1: Go to property search page
            print("\n[1/5] Navigating to Napier Council property search...")
            page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                     timeout=30000)
            page.wait_for_load_state('networkidle')
            print("✅ Page loaded")
            
            # Save search page screenshot
            page.screenshot(path='due-diligence-mvp/napier_search_before.png')
            
            # Step 2: Select "Search by Address" from dropdown
            print("\n[2/5] Selecting 'Search by Address'...")
            try:
                # Wait for and select the dropdown
                page.select_option('select[name*="search"]', 'address', timeout=5000)
                print("✅ Selected 'Search by Address'")
            except Exception as e:
                print(f"⚠️  Dropdown selection failed: {e}")
                print("👉 Trying to proceed anyway...")
            
            # Step 3: Enter address in search field
            print(f"\n[3/5] Entering address: {address}...")
            try:
                # Find the address input field
                address_field = page.query_selector('input[placeholder*="Address"]')
                if not address_field:
                    address_field = page.query_selector('input[type="text"]')
                
                if address_field:
                    address_field.fill(address)
                    print(f"✅ Entered: {address}")
                else:
                    print("❌ Could not find address input field")
                    return None
            except Exception as e:
                print(f"❌ Error entering address: {e}")
                return None
            
            # Small delay to let autocomplete/dropdown populate
            print("   Waiting for autocomplete results...")
            page.wait_for_timeout(2000)
            
            # Check if there's a dropdown with results
            dropdown_selector = '[class*="autocomplete"], [class*="suggestion"], [class*="dropdown"], ul[role="listbox"]'
            dropdown = page.query_selector(dropdown_selector)
            
            if dropdown:
                print("✅ Found autocomplete dropdown")
                
                # Find the first result item and hover over it
                result_item = dropdown.query_selector('li, [role="option"], [class*="item"]')
                if result_item:
                    print("   Hovering over first result to activate search button...")
                    result_item.hover()
                    page.wait_for_timeout(500)  # Wait for hover to activate button
                    print("✅ Hovered over result")
                else:
                    print("⚠️  Could not find result item in dropdown")
            else:
                print("⚠️  No dropdown found - may need to adjust selector")
            
            # Step 4: Click search button (after hovering over result)
            print("\n[4/5] Submitting search...")
            try:
                # Wait a bit for the hover to activate the button
                page.wait_for_timeout(1000)
                
                # Try to click search button
                search_button = page.query_selector('button:has-text("Search")')
                if not search_button:
                    search_button = page.query_selector('input[type="submit"]')
                if not search_button:
                    search_button = page.query_selector('button[type="submit"]')
                
                if search_button:
                    # Check if button is enabled
                    is_disabled = search_button.is_disabled()
                    if is_disabled:
                        print("⚠️  Search button is still disabled - need to select from dropdown")
                        print("👉 Please manually click the first result in the dropdown, then click Search")
                        input("Press Enter after you've clicked Search...")
                    else:
                        search_button.click()
                        print("✅ Search submitted")
                else:
                    # Try pressing Enter in the address field
                    print("   No search button found, trying Enter key...")
                    address_field.press('Enter')
                    print("✅ Pressed Enter to submit")
            except Exception as e:
                print(f"⚠️  Submit failed: {e}")
                print("👉 Please manually click Search in the browser")
                input("Press Enter after you've clicked Search...")
            
            # Wait for navigation/results
            try:
                page.wait_for_load_state('networkidle', timeout=10000)
                page.wait_for_timeout(2000)  # Extra time for dynamic content
            except TimeoutError:
                print("⚠️  Page load timeout, but continuing...")
            
            # Step 5: Check if we got to the property page
            current_url = page.url
            print(f"\n[5/5] Result URL: {current_url}")
            
            if 'rid=' not in current_url:
                print("❌ URL doesn't contain 'rid=' - may need to handle multiple results")
                # Check if there's a results list
                if page.query_selector('[class*="result"], [class*="match"]'):
                    print("👉 Multiple results found - need to implement result selection")
                return None
            
            # Extract RID from URL
            rid_match = re.search(r'rid=([^&]+)', current_url)
            if rid_match:
                rid = rid_match.group(1)
                print(f"✅ Extracted RID: {rid}")
            
            # Save screenshot of results page
            page.screenshot(path='due-diligence-mvp/napier_property_result.png')
            print("📸 Screenshot saved: napier_property_result.png")
            
            # Save full HTML for analysis
            html_content = page.content()
            html_path = 'due-diligence-mvp/napier_property_raw.html'
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"📄 Full HTML saved: {html_path}")
            
            # Now extract the data
            print("\n" + "="*80)
            print("EXTRACTING PROPERTY DATA")
            print("="*80)
            
            extracted_data = {
                'address': address,
                'rid': rid,
                'url': current_url,
                'scrape_timestamp': datetime.now().isoformat(),
                'raw_data': {}
            }
            
            # Strategy 1: Look for data in common patterns
            data_fields = {
                'capital_value': ['Capital Value', 'CV', 'Capital value'],
                'land_value': ['Land Value', 'Land value'],
                'improvements_value': ['Improvements Value', 'Improvements', 'Building Value'],
                'annual_rates': ['Annual Rates', 'Total Rates', 'Rates payable', 'Rates Payable'],
                'valuation_date': ['Valuation Date', 'Valuation date', 'As at', 'Date'],
                'property_id': ['Property ID', 'PropertyId', 'Parcel'],
                'legal_description': ['Legal Description', 'LegalDesc'],
            }
            
            for field_name, keywords in data_fields.items():
                for keyword in keywords:
                    # Try to find the keyword and extract nearby value
                    pattern = rf'{re.escape(keyword)}[^0-9$]*([$]?[\d,]+(?:\.\d+)?)'
                    match = re.search(pattern, html_content, re.IGNORECASE)
                    
                    if match:
                        value_str = match.group(1).replace(',', '').replace('$', '')
                        try:
                            if '$' in match.group(0) or any(c.isdigit() for c in value_str):
                                value = float(value_str) if '.' in value_str else int(value_str)
                                extracted_data['raw_data'][field_name] = value
                                print(f"✅ {field_name}: ${value:,}" if 'value' in field_name or 'rates' in field_name else f"✅ {field_name}: {value}")
                                break
                        except:
                            pass
            
            # Strategy 2: Look for table structures (council sites often use tables)
            print("\n📊 Checking for table structures...")
            table_pattern = r'<table[^>]*>(.*?)</table>'
            tables = re.findall(table_pattern, html_content, re.DOTALL | re.IGNORECASE)
            
            if tables:
                print(f"✅ Found {len(tables)} table(s)")
                for i, table in enumerate(tables[:3]):  # Check first 3 tables
                    # Look for rows with labels and values
                    row_pattern = r'<tr[^>]*>(.*?)</tr>'
                    rows = re.findall(row_pattern, table, re.DOTALL | re.IGNORECASE)
                    
                    for row in rows:
                        cell_pattern = r'<t[dh][^>]*>(.*?)</t[dh]>'
                        cells = re.findall(cell_pattern, row, re.DOTALL | re.IGNORECASE)
                        
                        if len(cells) >= 2:
                            # Clean HTML tags from cells
                            clean_cells = [re.sub(r'<[^>]+>', '', c).strip() for c in cells]
                            
                            # Check if this row contains rates info
                            row_text = ' '.join(clean_cells).lower()
                            
                            if any(kw.lower() in row_text for kw in ['capital', 'land value', 'rates', 'valuation']):
                                print(f"   📋 Table row: {clean_cells}")
            
            # Strategy 3: Look for common CSS classes used in NZ council sites
            print("\n🔍 Checking for common CSS class patterns...")
            class_patterns = [
                (r'class="[^"]*capital[^"]*"[^>]*>([^<]+)', 'capital class'),
                (r'class="[^"]*rates[^"]*"[^>]*>([^<]+)', 'rates class'),
                (r'class="[^"]*value[^"]*"[^>]*>([^<]+)', 'value class'),
                (r'class="[^"]*amount[^"]*"[^>]*>([^<]+)', 'amount class'),
            ]
            
            for pattern, desc in class_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                if matches:
                    print(f"✅ Found {len(matches)} match(es) for {desc}:")
                    for m in matches[:3]:  # Show first 3
                        clean = re.sub(r'<[^>]+>', '', m).strip()
                        if clean and len(clean) < 50:
                            print(f"   → {clean}")
            
            # Save extracted data to JSON
            output_path = 'due-diligence-mvp/napier_extracted_data.json'
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(extracted_data, f, indent=2)
            print(f"\n💾 Extracted data saved: {output_path}")
            
            print("\n" + "="*80)
            print("SCRAPING COMPLETE")
            print("="*80)
            print("\nNext steps:")
            print("1. Review the screenshots in due-diligence-mvp/")
            print("2. Open napier_property_raw.html to inspect HTML structure")
            print("3. Identify exact CSS selectors for reliable extraction")
            print("4. Update rates_scraper_real.py with production selectors")
            
            return extracted_data
            
        except Exception as e:
            print(f"\n❌ Fatal error: {e}")
            import traceback
            traceback.print_exc()
            return None
        
        finally:
            print("\n🕒 Keeping browser open for 10 seconds for manual inspection...")
            page.wait_for_timeout(10000)
            browser.close()


if __name__ == '__main__':
    # Test with known properties
    test_addresses = [
        "16 Ferguson Avenue",
        "18 Ferguson Avenue",
    ]
    
    for addr in test_addresses:
        print(f"\n{'='*80}")
        print(f"Testing: {addr}")
        print(f"{'='*80}\n")
        
        result = scrape_napier_rates(addr)
        
        if result:
            print(f"\n✅ Success for {addr}")
            if result.get('raw_data'):
                print("Extracted fields:", list(result['raw_data'].keys()))
        else:
            print(f"\n❌ Failed for {addr}")
        
        print("\n\n")
