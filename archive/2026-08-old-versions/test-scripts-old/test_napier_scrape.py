#!/usr/bin/env python3
"""
Test script to inspect Napier Council property page structure
"""

import json
from playwright.sync_api import sync_playwright

def inspect_napier_property():
    """Inspect the Napier Council property page to find selectors"""
    
    test_address = "16 Ferguson Avenue, Westshore, Napier"
    # We know this property's RID from your manual search
    known_rid = "138159-107977"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible so we can see what happens
        page = browser.new_page()
        
        print("="*80)
        print("NAPIER COUNCIL PROPERTY SEARCH - INSPECTION MODE")
        print("="*80)
        
        # Step 1: Go to the property search page
        print("\n[Step 1] Navigating to Napier Council property search...")
        page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', timeout=30000)
        page.wait_for_load_state('networkidle')
        
        print("✅ Page loaded")
        
        # Step 2: Find and fill the address field
        print("\n[Step 2] Looking for search form...")
        
        # Take a screenshot to see what we're working with
        page.screenshot(path='due-diligence-mvp/napier_search_page.png')
        print("📸 Screenshot saved: napier_search_page.png")
        
        # Try to find the address input field
        # Common patterns for dropdown/search inputs
        selectors_to_try = [
            'input[placeholder*="address"]',
            'input[placeholder*="Address"]',
            'input[name*="address"]',
            'input[id*="address"]',
            '#address',
            '.address-input',
            'input[class*="address"]',
            'input[aria-label*="address"]',
            'input[type="text"]',  # Fallback
        ]
        
        address_field = None
        for selector in selectors_to_try:
            try:
                address_field = page.query_selector(selector)
                if address_field:
                    print(f"✅ Found address field with selector: {selector}")
                    break
            except:
                pass
        
        if not address_field:
            print("❌ Could not find address input field automatically")
            print("👉 Please manually inspect the page and identify the correct selector")
            input("Press Enter after you've noted the selector...")
        
        # Step 3: Select "Search by Address" from dropdown if needed
        print("\n[Step 3] Checking for search type dropdown...")
        
        dropdown_selectors = [
            'select[name*="search"]',
            'select[id*="search"]',
            '.search-type',
            '#searchType',
        ]
        
        search_type_dropdown = None
        for selector in dropdown_selectors:
            try:
                search_type_dropdown = page.query_selector(selector)
                if search_type_dropdown:
                    print(f"✅ Found dropdown: {selector}")
                    break
            except:
                pass
        
        if search_type_dropdown:
            print("👉 Please manually select 'Search by Address' from the dropdown")
            input("Press Enter after selecting...")
        
        # Step 4: Enter the street number and name only
        print(f"\n[Step 4] Entering address: {test_address}")
        print("👉 Please manually type '16 Ferguson Avenue' in the search box")
        input("Press Enter after typing the address...")
        
        # Step 5: Click search button
        print("\n[Step 5] Looking for search button...")
        
        button_selectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Search")',
            '.search-button',
            '#searchBtn',
            'button[class*="search"]',
        ]
        
        search_button = None
        for selector in button_selectors:
            try:
                search_button = page.query_selector(selector)
                if search_button:
                    print(f"✅ Found search button: {selector}")
                    break
            except:
                pass
        
        if search_button:
            print("👉 I found a search button. Should I click it? (y/n)")
            response = input("> ").lower()
            if response == 'y':
                search_button.click()
                page.wait_for_load_state('networkidle')
                print("✅ Search submitted")
        else:
            print("❌ Could not find search button automatically")
            print("👉 Please manually click the Search button")
            input("Press Enter after clicking...")
        
        # Step 6: Check if we were redirected to the property page
        current_url = page.url
        print(f"\n[Step 6] Current URL: {current_url}")
        
        if 'rid=' in current_url:
            rid = current_url.split('rid=')[1].split('&')[0]
            print(f"✅ Extracted RID: {rid}")
            
            # Step 7: Inspect the property details page
            print("\n[Step 7] Inspecting property details page...")
            page.screenshot(path='due-diligence-mvp/napier_property_page.png')
            print("📸 Screenshot saved: napier_property_page.png")
            
            # Get the full HTML content for analysis
            html_content = page.content()
            with open('due-diligence-mvp/napier_property_page.html', 'w', encoding='utf-8') as f:
                f.write(html_content)
            print("📄 Full HTML saved: napier_property_page.html")
            
            # Try to extract key information
            print("\n[Step 8] Attempting to extract property data...")
            
            # Look for common patterns in the HTML
            data_patterns = {
                'capital_value': ['Capital Value', 'CV:', 'Capital value'],
                'land_value': ['Land Value', 'Land value'],
                'improvements': ['Improvements', 'Building Value'],
                'annual_rates': ['Annual Rates', 'Rates payable', 'Total rates'],
                'valuation_date': ['Valuation date', 'As at', 'Date'],
            }
            
            extracted_data = {}
            for key, patterns in data_patterns.items():
                for pattern in patterns:
                    if pattern.lower() in html_content.lower():
                        print(f"✅ Found '{pattern}' in page - {key} likely present")
                        # Extract a snippet around this text
                        idx = html_content.lower().find(pattern.lower())
                        if idx > -1:
                            snippet = html_content[max(0, idx-200):min(len(html_content), idx+400)]
                            extracted_data[key] = snippet
                        break
            
            if extracted_data:
                print("\n" + "="*80)
                print("EXTRACTED DATA SNIPPETS:")
                print("="*80)
                for key, snippet in extracted_data.items():
                    print(f"\n{key.upper()}:")
                    print(snippet[:300])  # Show first 300 chars
                    print("...")
            
            print("\n" + "="*80)
            print("INSPECTION COMPLETE")
            print("="*80)
            print("\nNext steps:")
            print("1. Open 'napier_property_page.html' in a browser")
            print("2. Right-click on the CV/rates values → Inspect")
            print("3. Note the CSS selectors (class, id, data attributes)")
            print("4. Update rates_scraper_real.py with the correct selectors")
            
        else:
            print("❌ URL does not contain 'rid=' parameter")
            print("👉 Did multiple results appear? If so, we need to handle result selection")
        
        print("\nKeeping browser open for manual inspection...")
        input("Press Enter to close browser...")
        
        browser.close()

if __name__ == '__main__':
    inspect_napier_property()
