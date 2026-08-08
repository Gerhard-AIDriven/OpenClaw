#!/usr/bin/env python3
"""
Inspect the autocomplete dropdown structure on Napier Council site
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def inspect_dropdown():
    print("="*80)
    print("NAPIER COUNCIL - DROPDOWN INSPECTOR")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("\n[1/4] Navigating to property search...")
        page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                 timeout=30000, wait_until='networkidle')
        print("[OK] Page loaded")
        
        print("\n[2/4] Selecting 'Search by Address'...")
        try:
            page.select_option('select[name*="search"]', 'address', timeout=5000)
            print("[OK] Selected")
        except:
            print("[WARN] Could not select dropdown")
        
        test_address = "18 Ferguson Avenue"
        print(f"\n[3/4] Entering: {test_address}...")
        address_field = page.query_selector('input[placeholder*="Address"]')
        if address_field:
            address_field.fill(test_address)
            print("[OK] Entered")
            
            print("\n[4/4] Waiting for autocomplete... (keeping browser open for inspection)")
            print("\n" + "="*80)
            print("MANUAL INSPECTION REQUIRED")
            print("="*80)
            print("\nThe browser should show the autocomplete dropdown now.")
            print("\nPlease do the following:")
            print("1. Look at the dropdown that appeared")
            print("2. Right-click on the dropdown item → Inspect")
            print("3. Tell me:")
            print("   - What HTML tag is it? (li, div, a, etc.)")
            print("   - What class names does it have?")
            print("   - Does it have any special attributes?")
            print("\nKeeping browser open for 60 seconds...")
            
            # Wait longer for manual inspection
            page.wait_for_timeout(60000)
        else:
            print("[ERROR] Could not find address field")
        
        browser.close()

if __name__ == '__main__':
    inspect_dropdown()
