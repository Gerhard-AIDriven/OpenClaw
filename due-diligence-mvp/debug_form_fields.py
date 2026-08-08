#!/usr/bin/env python3
"""
Debug script to list all form fields on Napier Council property search page
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

def debug_fields():
    print("="*80)
    print("NAPIER COUNCIL - FORM FIELD DEBUGGER")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("\n[1/3] Navigating to property search...")
        page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                 timeout=30000, wait_until='networkidle')
        print("[OK] Page loaded")
        
        print("\n[2/3] Selecting 'Search by Address'...")
        try:
            page.select_option('select[name*="search"]', 'address', timeout=5000)
            print("[OK] Selected 'Search by Address'")
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"[WARN] Could not select: {e}")
        
        print("\n[3/3] Scanning for ALL input fields...")
        print("="*80)
        
        # Get all input fields
        all_inputs = page.query_selector_all('input, select, textarea, button')
        
        print(f"\nFound {len(all_inputs)} form elements:\n")
        
        for i, elem in enumerate(all_inputs, 1):
            tag = elem.evaluate('el => el.tagName.toLowerCase()')
            elem_type = elem.get_attribute('type') or 'N/A'
            name = elem.get_attribute('name') or 'N/A'
            id_val = elem.get_attribute('id') or 'N/A'
            placeholder = elem.get_attribute('placeholder') or 'N/A'
            value = elem.evaluate('el => el.value') or 'N/A'
            
            # Check if visible
            is_visible = elem.is_visible()
            
            # Check parent container
            parent = elem.evaluate('''el => {
                let p = el.parentElement;
                while (p && p.tagName !== 'BODY') {
                    if (p.className) return p.className;
                    p = p.parentElement;
                }
                return 'N/A';
            }''')
            
            print(f"{i}. <{tag} type=\"{elem_type}\">")
            print(f"   Name: {name}")
            print(f"   ID: {id_val}")
            print(f"   Placeholder: {placeholder}")
            print(f"   Value: {value}")
            print(f"   Visible: {is_visible}")
            print(f"   Parent Class: {parent[:100]}...")
            print()
        
        # Also get the HTML structure around the search form
        print("\n" + "="*80)
        print("SEARCH FORM STRUCTURE:")
        print("="*80)
        
        form_html = page.eval_on_selector('body', '''el => {
            // Find forms or search-related divs
            const forms = el.querySelectorAll('form, [class*="search"], [id*="search"]');
            let result = [];
            forms.forEach((f, i) => {
                if (i < 3) {  // First 3 forms only
                    result.push({
                        tag: f.tagName,
                        class: f.className,
                        id: f.id,
                        html: f.outerHTML.substring(0, 500)
                    });
                }
            });
            return JSON.stringify(result, null, 2);
        }''')
        
        print(form_html[:2000])
        
        print("\n" + "="*80)
        print("Keeping browser open for 60 seconds for manual inspection...")
        print("Please examine the page and note the correct selectors!")
        page.wait_for_timeout(60000)
        
        browser.close()

if __name__ == '__main__':
    debug_fields()
