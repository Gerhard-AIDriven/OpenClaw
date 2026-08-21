#!/usr/bin/env python3
"""
Napier Council Rates Scraper - FINAL VERSION
Uses correct selectors based on page inspection
"""

import json
import re
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def scrape_napier_rates(address: str):
    print("="*80)
    print("NAPIER COUNCIL RATES SCRAPER - FINAL")
    print(f"Address: {address}")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Step 1: Load page
            print("\n[1/6] Loading property search...")
            page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                     timeout=30000, wait_until='networkidle')
            page.wait_for_timeout(1000)
            print("[OK]")
            
            # Step 2: Set search type
            print("\n[2/6] Setting search type...")
            page.select_option('select[name="searchtype"]', 'address', timeout=5000)
            print("[OK] Address or Valuation")
            
            # Step 3: Enter address using CORRECT selector
            print(f"\n[3/6] Entering: {address}...")
            
            # Use the exact ID from inspection: id="itemsearch"
            address_field = page.query_selector('#itemsearch')
            
            if not address_field:
                print("[ERROR] Could not find #itemsearch field")
                return None
            
            address_field.fill(address)
            print(f"[OK] Entered")
            
            # Step 4: Wait for autocomplete and hover
            print("\n[4/6] Waiting for autocomplete...")
            page.wait_for_timeout(2000)
            
            # Look for the autocomplete dropdown
            # Based on inspection: it's a jQuery UI autocomplete
            dropdown = page.query_selector('.ui-autocomplete, ul.ui-menu')
            
            if dropdown:
                print("[OK] Found dropdown")
                
                # Find first result item (usually <li> or <a> in jQuery UI)
                result_item = dropdown.query_selector('li.ui-menu-item, a.ui-state-focus, .ui-menu-item-wrapper')
                
                if not result_item:
                    # Fallback: any child element
                    result_item = dropdown.query_selector('li, a, div')
                
                if result_item:
                    print("   Hovering over result...")
                    result_item.hover()
                    page.wait_for_timeout(800)
                    print("[OK] Hovered - search button should be active now")
                else:
                    print("[WARN] Could not find result item")
            else:
                print("[WARN] No dropdown found")
            
            # Step 5: Click search
            print("\n[5/6] Searching...")
            page.wait_for_timeout(500)
            
            search_btn = page.query_selector('button:has-text("SEARCH")')
            
            if search_btn:
                if search_btn.is_disabled():
                    print("[WARN] Button disabled - waiting for manual click")
                    print("Please click SEARCH in the browser...")
                    page.wait_for_timeout(30000)
                else:
                    search_btn.click()
                    print("[OK] Submitted")
            else:
                print("[WARN] No button found, trying Enter...")
                address_field.press('Enter')
            
            # Step 6: Wait and extract
            print("\n[6/6] Extracting data...")
            
            # Wait longer for navigation/redirect
            print("   Waiting for page load...")
            try:
                page.wait_for_load_state('networkidle', timeout=20000)
                page.wait_for_timeout(3000)  # Extra time for JS redirects
            except Exception as e:
                print(f"   [WARN] Wait timeout: {e}")
            
            # Check URL multiple times in case of slow redirect
            for attempt in range(3):
                url = page.url
                print(f"   URL (attempt {attempt+1}): {url}")
                
                if 'rid=' in url:
                    break
                
                # Maybe the page loaded but URL hasn't updated yet
                # Check if we're on a property page by looking for property data
                html_check = page.content()
                if 'Capital Value' in html_check or 'Legal Description' in html_check:
                    print("   [OK] Found property data on page (URL may not have RID)")
                    # Try to extract RID from page content or use a default
                    rid_from_page = re.search(r'Property ID[^>]*>.*?(\d+)', html_check, re.I)
                    if rid_from_page:
                        rid = rid_from_page.group(1)
                        print(f"   [OK] Got RID from page: {rid}")
                        break
                
                if attempt < 2:
                    print("   Waiting 2s for redirect...")
                    page.wait_for_timeout(2000)
            
            url = page.url
            print(f"   Final URL: {url}")
            
            # Extract RID from URL or generate from address
            rid_match = re.search(r'rid=([^&]+)', url)
            if rid_match:
                rid = rid_match.group(1)
                print(f"[OK] RID from URL: {rid}")
            else:
                # Generate a pseudo-RID from address for file naming
                rid = re.sub(r'[^a-zA-Z0-9]+', '_', address)[:20]
                print(f"[INFO] No RID in URL, using: {rid}")
            
            # Extract data
            html = page.content()
            result = {
                'rid': rid,
                'url': url,
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
            
            if not result['success']:
                print("\n[WARN] No data extracted - keeping browser open for inspection")
                print("Please check if the property page loaded correctly...")
                page.wait_for_timeout(30000)
                return None
            
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
            
        except Exception as e:
            print(f"\n[ERROR] {e}")
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
