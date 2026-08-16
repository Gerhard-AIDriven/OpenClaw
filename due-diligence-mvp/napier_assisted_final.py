#!/usr/bin/env python3
"""
Napier Council Rates Scraper - ASSISTED FINAL
Opens browser → You search manually → Script auto-detects property page → Extracts
"""

import json
import re
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright
import time

sys.stdout.reconfigure(encoding='utf-8')

def scrape_assisted():
    print("="*80)
    print("NAPIER COUNCIL RATES SCRAPER - ASSISTED MODE")
    print("="*80)
    print("\nINSTRUCTIONS:")
    print("1. Browser will open to Napier Council property search")
    print("2. Search for your property:")
    print("   - Select 'Address or Valuation'")
    print("   - Type the address")
    print("   - HOVER over autocomplete result (activates SEARCH button)")
    print("   - Click SEARCH")
    print("3. Wait for property details page to load")
    print("4. Script will auto-detect and extract data")
    print("="*80)
    
    print("\nOpening browser in 3 seconds...")
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
            print("PLEASE SEARCH FOR THE PROPERTY NOW")
            print("="*80)
            print("In the BROWSER window:")
            print("  1. Select 'Address or Valuation' from dropdown")
            print("  2. Type the street address (e.g., '18 Ferguson Avenue')")
            print("  3. HOVER over the autocomplete result")
            print("  4. Click the SEARCH button")
            print("="*80)
            print("\nI'm waiting for the property page to load...")
            print("(Checking every 5 seconds)\n")
            
            # Poll for property page detection
            rid_value = None
            max_checks = 60  # 5 minutes (60 x 5s)
            
            for i in range(max_checks):
                try:
                    url = page.url
                    
                    # Check if URL has RID
                    rid_match = re.search(r'rid=([^&]+)', url)
                    if rid_match:
                        rid_value = rid_match.group(1)
                        print(f"\n✅ Property detected! RID: {rid_value}")
                        print(f"   URL: {url}")
                        break
                    
                    # Also check page content for actual property data (not help text)
                    if i >= 12:  # Only check content after 1 minute
                        html = page.content()
                        # Look for actual values, not just keywords
                        if re.search(r'\$[\d,]+', html) and ('Legal Description' in html or 'LOT' in html):
                            print(f"\n✅ Property data detected on page!")
                            rid_value = "manual-search"
                            break
                    
                    # Progress indicator
                    if i % 12 == 0 and i > 0:
                        mins = (i * 5) // 60
                        print(f"   ... still waiting ({mins} min elapsed)")
                    
                    time.sleep(5)
                    
                except Exception as e:
                    # Page might be transitioning
                    continue
            
            if not rid_value:
                print(f"\n⚠️  Timeout after {max_checks*5//60} minutes")
                print("Keeping browser open for manual inspection...")
                time.sleep(30)
                return None
            
            # Wait for page to stabilize
            print("\n[2/3] Waiting for page to load completely...")
            page.wait_for_timeout(3000)
            try:
                page.wait_for_load_state('networkidle', timeout=10000)
            except:
                pass
            page.wait_for_timeout(2000)
            
            # Extract data
            print("\n[3/3] Extracting rates data...")
            html = page.content()
            
            # Save debug HTML
            safe_name = f"napier_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            debug_path = f'due-diligence-mvp/{safe_name}.html'
            with open(debug_path, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"[DEBUG] Saved HTML: {debug_path}")
            
            result = {
                'rid': rid_value,
                'url': page.url,
                'timestamp': datetime.now().isoformat(),
                'success': False,
                'data': {}
            }
            
            # Capital Value
            patterns = [
                r'<td[^>]*>Capital\s*Value[^>]*>.*?</td>\s*<td[^>]*>([^<]+)</td>',
                r'Capital\s*Value.*?<td[^>]*>([^<]+)</td>',
                r'Capital Value[\s\S]{0,300}?(\$[\d,]+)',
            ]
            for pattern in patterns:
                m = re.search(pattern, html, re.I | re.S)
                if m:
                    val_text = m.group(1).strip()
                    val = re.sub(r'[^\d.]', '', val_text.replace('$','').replace(',',''))
                    try:
                        result['data']['capital_value'] = int(float(val))
                        print(f"[OK] Capital Value: ${result['data']['capital_value']:,}")
                        break
                    except:
                        continue
            
            # Land Value
            patterns = [
                r'<td[^>]*>Land\s*Value[^>]*>.*?</td>\s*<td[^>]*>([^<]+)</td>',
                r'Land\s*Value.*?<td[^>]*>([^<]+)</td>',
                r'Land Value[\s\S]{0,300}?(\$[\d,]+)',
            ]
            for pattern in patterns:
                m = re.search(pattern, html, re.I | re.S)
                if m:
                    val_text = m.group(1).strip()
                    val = re.sub(r'[^\d.]', '', val_text.replace('$','').replace(',',''))
                    try:
                        result['data']['land_value'] = int(float(val))
                        print(f"[OK] Land Value: ${result['data']['land_value']:,}")
                        break
                    except:
                        continue
            
            # Annual Rates
            patterns = [
                r'Total Rates Levied</strong></td>\s*<td[^>]*>([\d,]+\.\d+)',
                r'Total Rates Levied.*?<td[^>]*>([\d,]+\.\d+)',
                r'Annual Rates[\s\S]{0,300}?(\$[\d,]+\.?\d*)',
                r'Total Rates[\s\S]{0,300}?(\$[\d,]+\.?\d*)',
            ]
            for pattern in patterns:
                m = re.search(pattern, html, re.I | re.S)
                if m:
                    val_text = m.group(1).strip()
                    val = re.sub(r'[^\d.]', '', val_text.replace('$','').replace(',',''))
                    try:
                        result['data']['annual_rates'] = float(val)
                        print(f"[OK] Annual Rates: ${result['data']['annual_rates']:,.2f}")
                        break
                    except:
                        continue
            
            # Legal Description
            patterns = [
                r'<td>Legal Description&nbsp;</td>\s*<td[^>]*>(LOT\s+\d+\s+DP\s+\d+)',
                r'Legal Description.*?(LOT\s+\d+\s+DP\s+\d+)',
            ]
            for pattern in patterns:
                m = re.search(pattern, html, re.I | re.S)
                if m:
                    result['data']['legal_description'] = m.group(1).strip()
                    print(f"[OK] Legal Description: {result['data']['legal_description']}")
                    break
            
            # Calculated fields
            if 'capital_value' in result['data'] and 'land_value' in result['data']:
                result['data']['improvements_value'] = result['data']['capital_value'] - result['data']['land_value']
                print(f"[OK] Improvements: ${result['data']['improvements_value']:,}")
            
            if 'annual_rates' in result['data'] and 'capital_value' in result['data']:
                pct = (result['data']['annual_rates'] / result['data']['capital_value']) * 100
                result['data']['rates_percent_cv'] = round(pct, 3)
                print(f"[OK] Rates % of CV: {result['data']['rates_percent_cv']}%")
            
            result['success'] = len(result['data']) > 0
            
            if not result['success']:
                print("\n⚠️  WARNING: Could not extract data")
                print(f"Check debug HTML: {debug_path}")
                print("Keeping browser open for 30s...")
                time.sleep(30)
                return None
            
            # Save results
            out_path = f'due-diligence-mvp/{safe_name}_rates.json'
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"\n✅ Saved JSON: {out_path}")
            
            # Screenshot
            shot_path = f'due-diligence-mvp/{safe_name}.png'
            page.screenshot(path=shot_path, full_page=True)
            print(f"✅ Screenshot: {shot_path}")
            
            print("\n" + "="*80)
            print("SUCCESS!")
            print("="*80)
            print(f"Extracted {len(result['data'])} data points")
            print("="*80)
            
            return result
            
        except KeyboardInterrupt:
            print("\n\n[CANCELLED]")
            return None
        
        except Exception as e:
            print(f"\n[ERROR] {e}")
            import traceback
            traceback.print_exc()
            return None
        
        finally:
            print("\nClosing browser in 5 seconds...")
            time.sleep(5)
            try:
                browser.close()
            except:
                pass


if __name__ == '__main__':
    result = scrape_assisted()
    
    if result and result.get('success'):
        print(f"\n✅ DONE! Ready for next property.")
    else:
        print(f"\n❌ Failed to extract data")
