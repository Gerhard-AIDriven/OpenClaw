#!/usr/bin/env python3
"""
Napier Council Rates Scraper - V3
Extracts RID from hidden field after hover, then goes directly to property page
"""

import json
import re
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def scrape_napier_rates(address: str):
    print("="*80)
    print("NAPIER COUNCIL RATES SCRAPER - V3")
    print(f"Address: {address}")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Step 1: Load page
            print("\n[1/7] Loading...")
            page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                     timeout=30000, wait_until='networkidle')
            page.wait_for_timeout(1000)
            print("[OK]")
            
            # Step 2: Set search type
            print("\n[2/7] Setting type...")
            page.select_option('select[name="searchtype"]', 'address', timeout=5000)
            print("[OK]")
            
            # Step 3: Enter address
            print(f"\n[3/7] Entering: {address}...")
            address_field = page.query_selector('#itemsearch')
            if not address_field:
                print("[ERROR] No #itemsearch field")
                return None
            
            address_field.fill(address)
            print("[OK]")
            
            # Step 4: Wait for autocomplete and hover
            print("\n[4/7] Waiting for autocomplete...")
            page.wait_for_timeout(2000)
            
            dropdown = page.query_selector('.ui-autocomplete, ul.ui-menu, ul[id*="ui-id"]')
            
            if dropdown:
                print("[OK] Found dropdown")
                
                # Find first result
                result_item = dropdown.query_selector('li.ui-menu-item, .ui-menu-item-wrapper, li:first-child')
                
                if not result_item:
                    result_item = dropdown.query_selector('li, a, div')
                
                if result_item:
                    print("   Hovering over result...")
                    result_item.hover()
                    page.wait_for_timeout(1500)  # Give JS time to run
                    
                    # Wait for RID field to be populated (poll for up to 8 seconds)
                    print("   Waiting for RID field...")
                    rid_value = None
                    for attempt in range(16):  # Try for 8 seconds (16 x 500ms)
                        page.wait_for_timeout(500)
                        
                        # Try multiple ways to get the RID value
                        rid_field = page.query_selector('input#rid')
                        if rid_field:
                            # Method 1: Get attribute
                            rid_value = rid_field.get_attribute('value')
                            
                            # Method 2: Evaluate JavaScript (more reliable for dynamic values)
                            if not rid_value or len(rid_value) < 5:
                                rid_value = rid_field.evaluate('el => el.value')
                            
                            # Method 3: Check title attribute as fallback
                            if not rid_value or len(rid_value) < 5:
                                rid_value = rid_field.get_attribute('title')
                            
                            if rid_value and len(rid_value) > 5 and '-' in str(rid_value):
                                print(f"[OK] RID found after {attempt+1} attempts: {rid_value}")
                                break
                            else:
                                print(f"   Attempt {attempt+1}: RID field exists but empty/invalid")
                    
                    if not rid_value or '-' not in str(rid_value):
                        print("[ERROR] RID field not populated")
                        print("[INFO] Debugging info:")
                        
                        # Check if field exists
                        rid_field = page.query_selector('input#rid')
                        if rid_field:
                            print("   - RID field exists in DOM")
                            val = rid_field.evaluate('el => el.value')
                            print(f"   - Value via JS: '{val}'")
                            attr = rid_field.get_attribute('value')
                            print(f"   - Value via attr: '{attr}'")
                        else:
                            print("   - RID field NOT found in DOM")
                        
                        print("[INFO] Taking screenshot...")
                        page.screenshot(path='due-diligence-mvp/debug_rid_field.png')
                        print("[INFO] Keeping browser open for manual inspection...")
                        page.wait_for_timeout(30000)
                        return None
                    
                    print("[OK] Hovered and RID extracted")
                    
                    # CRITICAL: Extract RID from hidden field NOW
                    print("\n[5/7] Extracting RID from hidden field...")
                    rid_field = page.query_selector('input#rid, input[name="rid"], input[title="rid"]')
                    
                    if rid_field:
                        rid_value = rid_field.get_attribute('value')
                        if rid_value and len(rid_value) > 5:
                            print(f"[OK] RID found: {rid_value}")
                            
                            # Go directly to property page using RID
                            print("\n[6/7] Navigating to property page...")
                            property_url = f'https://www.napier.govt.nz/services/properties-and-rates/my-property/?rid={rid_value}'
                            page.goto(property_url, timeout=30000, wait_until='networkidle')
                            page.wait_for_timeout(2000)
                            print("[OK] Property page loaded")
                            
                            # Step 7: Extract data
                            print("\n[7/7] Extracting rates data...")
                            html = page.content()
                            
                            result = {
                                'rid': rid_value,
                                'url': property_url,
                                'address': address,
                                'timestamp': datetime.now().isoformat(),
                                'success': False,
                                'data': {}
                            }
                            
                            # CV
                            m = re.search(r'<td>Capital\s*Value[^>]*>.*?</td>\s*<td>([^<]+)</td>', html, re.I | re.S)
                            if m:
                                val = re.sub(r'[^\d.]', '', m.group(1).replace('$','').replace(',',''))
                                try:
                                    result['data']['capital_value'] = int(float(val))
                                    print(f"[OK] CV: ${result['data']['capital_value']:,}")
                                except: pass
                            
                            # Land
                            m = re.search(r'<td>Land\s*Value[^>]*>.*?</td>\s*<td>([^<]+)</td>', html, re.I | re.S)
                            if m:
                                val = re.sub(r'[^\d.]', '', m.group(1).replace('$','').replace(',',''))
                                try:
                                    result['data']['land_value'] = int(float(val))
                                    print(f"[OK] Land: ${result['data']['land_value']:,}")
                                except: pass
                            
                            # Rates
                            m = re.search(r'Total Rates Levied</strong></td>\s*<td[^>]*>([\d,]+\.\d+)', html, re.I)
                            if m:
                                try:
                                    result['data']['annual_rates'] = float(m.group(1).replace(',',''))
                                    print(f"[OK] Rates: ${result['data']['annual_rates']:,.2f}")
                                except: pass
                            
                            # Legal
                            m = re.search(r'<td>Legal Description&nbsp;</td>\s*<td[^>]*>(LOT\s+\d+\s+DP\s+\d+)', html, re.I)
                            if m:
                                result['data']['legal_description'] = m.group(1).strip()
                                print(f"[OK] Legal: {result['data']['legal_description']}")
                            
                            # Calculated
                            if 'capital_value' in result['data'] and 'land_value' in result['data']:
                                result['data']['improvements'] = result['data']['capital_value'] - result['data']['land_value']
                                print(f"[OK] Improvements: ${result['data']['improvements']:,}")
                            
                            if 'annual_rates' in result['data'] and 'capital_value' in result['data']:
                                pct = (result['data']['annual_rates'] / result['data']['capital_value']) * 100
                                result['data']['rates_pct'] = round(pct, 3)
                                print(f"[OK] Rates %: {result['data']['rates_pct']}%")
                            
                            result['success'] = len(result['data']) > 0
                            
                            # Save
                            safe = re.sub(r'[^a-zA-Z0-9]+', '_', address)[:30]
                            out = f'due-diligence-mvp/napier_{safe}.json'
                            with open(out, 'w', encoding='utf-8') as f:
                                json.dump(result, f, indent=2)
                            print(f"\n[OK] Saved: {out}")
                            
                            shot = f'due-diligence-mvp/napier_{safe}.png'
                            page.screenshot(path=shot, full_page=True)
                            print(f"[OK] Screenshot: {shot}")
                            
                            return result
                        else:
                            print("[ERROR] RID field empty or invalid")
                    else:
                        print("[ERROR] Could not find RID hidden field")
                else:
                    print("[ERROR] No result item in dropdown")
            else:
                print("[ERROR] No autocomplete dropdown")
            
            print("\n[FAILED] Could not complete extraction")
            return None
            
        except Exception as e:
            print(f"\n[ERROR] {e}")
            import traceback
            traceback.print_exc()
            return None
        
        finally:
            print("\nClosing in 5s...")
            page.wait_for_timeout(5000)
            browser.close()


if __name__ == '__main__':
    result = scrape_napier_rates("16 Ferguson Avenue")
    
    if result and result.get('success'):
        print(f"\n[SUCCESS] Extracted {len(result['data'])} fields")
    else:
        print(f"\n[FAILED]")
