#!/usr/bin/env python3
"""
Napier Council Rates Scraper - ASSISTED MODE
Opens browser → You search manually → Script auto-extracts data
No copying/pasting required!
"""

import json
import re
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def scrape_assisted():
    print("="*80)
    print("NAPIER COUNCIL RATES SCRAPER - ASSISTED MODE")
    print("="*80)
    print("\nINSTRUCTIONS:")
    print("1. Browser will open to Napier Council property search")
    print("2. Search for your property (enter address, hover result, click SEARCH)")
    print("3. Wait for property page to load")
    print("4. Script will automatically detect and extract the data")
    print("5. Press Ctrl+C to cancel at any time")
    print("="*80)
    
    print("\nOpening browser in 3 seconds...")
    import time
    time.sleep(3)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Navigate to search page
            print("\n[1/3] Opening Napier Council property search...")
            page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                     timeout=30000, wait_until='networkidle')
            page.wait_for_timeout(1000)
            print("[OK] Page loaded")
            
            print("\n" + "="*80)
            print("YOUR TURN!")
            print("="*80)
            print("Please search for the property in the browser window:")
            print("  1. Select 'Address or Valuation' from dropdown")
            print("  2. Type the address")
            print("  3. Hover over the autocomplete result")
            print("  4. Click SEARCH button")
            print("="*80)
            print("\nWaiting for you to complete the search...")
            print("(Script will auto-detect when property page loads)")
            print("="*80 + "\n")
            
            # Wait for URL to contain rid= parameter
            rid_value = None
            max_wait_minutes = 5
            check_interval_seconds = 2
            
            print(f"\n[INFO] Monitoring for property page (timeout: {max_wait_minutes} min)...")
            
            for attempt in range(int(max_wait_minutes * 60 / check_interval_seconds)):
                try:
                    current_url = page.url
                    
                    # Check if URL has RID
                    rid_match = re.search(r'rid=([^&]+)', current_url)
                    if rid_match:
                        rid_value = rid_match.group(1)
                        print(f"\n✅ Property detected! RID: {rid_value}")
                        print(f"   URL: {current_url}")
                        break
                    
                    # Also check if page content has property data (fallback)
                    try:
                        html = page.content()
                        if 'Capital Value' in html or 'Legal Description' in html:
                            print(f"\n✅ Property data detected on page!")
                            # Try to extract RID from hidden field or generate one
                            rid_field = page.query_selector('input#rid')
                            if rid_field:
                                rid_value = rid_field.evaluate('el => el.value')
                                if rid_value and '-' in rid_value:
                                    print(f"   RID from page: {rid_value}")
                                else:
                                    rid_value = "manual-search"
                            else:
                                rid_value = "manual-search"
                            break
                    except Exception as e:
                        # Page might be transitioning, ignore errors
                        pass
                    
                    # Show progress every 30 seconds
                    if attempt % 15 == 0 and attempt > 0:
                        elapsed = (attempt * check_interval_seconds) // 60
                        print(f"   ... still waiting ({elapsed} min elapsed)")
                    
                    page.wait_for_timeout(check_interval_seconds * 1000)
                    
                except Exception as e:
                    # Page navigation or other errors - just continue waiting
                    if attempt % 10 == 0:
                        print(f"   [info] waiting for search... ({attempt+1})")
                    page.wait_for_timeout(check_interval_seconds * 1000)
                    continue
            
            if not rid_value:
                print(f"\n[TIMEOUT] No property detected after {max_wait_minutes} minutes")
                print("Closing browser...")
                return None
            
            # Wait for page to fully load
            print("\n[2/3] Waiting for page to stabilize...")
            page.wait_for_timeout(2000)
            try:
                page.wait_for_load_state('networkidle', timeout=10000)
            except:
                pass
            page.wait_for_timeout(1000)
            
            # Extract data
            print("\n[3/3] Extracting rates data...")
            html = page.content()
            
            result = {
                'rid': rid_value,
                'url': page.url,
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
                try:
                    result['data']['annual_rates'] = float(m.group(1).replace(',',''))
                    print(f"[OK] Annual Rates: ${result['data']['annual_rates']:,.2f}")
                except: pass
            
            # Legal Description
            m = re.search(r'<td>Legal Description&nbsp;</td>\s*<td[^>]*>(LOT\s+\d+\s+DP\s+\d+)', html, re.I)
            if m:
                result['data']['legal_description'] = m.group(1).strip()
                print(f"[OK] Legal Description: {result['data']['legal_description']}")
            
            # Calculated fields
            if 'capital_value' in result['data'] and 'land_value' in result['data']:
                result['data']['improvements_value'] = result['data']['capital_value'] - result['data']['land_value']
                print(f"[OK] Improvements Value: ${result['data']['improvements_value']:,}")
            
            if 'annual_rates' in result['data'] and 'capital_value' in result['data']:
                pct = (result['data']['annual_rates'] / result['data']['capital_value']) * 100
                result['data']['rates_percent_cv'] = round(pct, 3)
                print(f"[OK] Rates as % of CV: {result['data']['rates_percent_cv']}%")
            
            result['success'] = len(result['data']) > 0
            
            if not result['success']:
                print("\n[ERROR] No data could be extracted")
                print("The page may not have loaded correctly")
                print("Keeping browser open for inspection...")
                page.wait_for_timeout(30000)
                return None
            
            # Save results
            safe_name = f"napier_{rid_value.replace('-', '_')}"
            out_path = f'due-diligence-mvp/{safe_name}_rates.json'
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"\n[OK] Saved: {out_path}")
            
            # Screenshot
            shot_path = f'due-diligence-mvp/{safe_name}.png'
            page.screenshot(path=shot_path, full_page=True)
            print(f"[OK] Screenshot: {shot_path}")
            
            print("\n" + "="*80)
            print("SUCCESS!")
            print("="*80)
            print(f"Extracted {len(result['data'])} data points")
            print(f"File: {out_path}")
            print("="*80)
            
            return result
            
        except KeyboardInterrupt:
            print("\n\n[CANCELLED] User interrupted")
            return None
        
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
    result = scrape_assisted()
    
    if result and result.get('success'):
        print(f"\n✅ DONE! Ready for next property.")
        print("\nTo process another property, run the script again:")
        print("  python napier_scraper_assisted.py")
    else:
        print(f"\n❌ Failed to extract data")
