#!/usr/bin/env python3
"""
Simple test: Open browser, wait for manual search, save HTML
"""

import sys
from playwright.sync_api import sync_playwright
import re

sys.stdout.reconfigure(encoding='utf-8')

print("="*80)
print("PAGE CAPTURE TEST")
print("="*80)
print("\n1. Browser will open")
print("2. Search for a property manually")
print("3. Script will save the page HTML when it detects property data")
print("="*80)

print("\nOpening in 3s...")
import time
time.sleep(3)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    try:
        page.goto('https://www.napier.govt.nz/services/properties-and-rates/my-property/', 
                 timeout=30000, wait_until='networkidle')
        print("[OK] Loaded search page")
        
        print("\nPlease search for a property...")
        
        # Wait for property detection
        for i in range(150):  # 5 minutes
            try:
                url = page.url
                if 'rid=' in url:
                    print(f"\n✅ Detected! RID in URL")
                    break
                
                html = page.content()
                if len(html) > 5000 and ('Capital' in html or 'Legal' in html):
                    print(f"\n✅ Detected! Property data on page ({len(html)} chars)")
                    break
            except:
                pass
            
            if i % 30 == 0 and i > 0:
                print(f"   ... waiting ({i//30}s)")
            
            time.sleep(2)
        
        # Save HTML
        print("\nSaving page content...")
        html = page.content()
        
        with open('due-diligence-mvp/test_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"[OK] Saved: due-diligence-mvp/test_page.html ({len(html)} bytes)")
        
        # Screenshot
        page.screenshot(path='due-diligence-mvp/test_page.png', full_page=True)
        print(f"[OK] Screenshot: due-diligence-mvp/test_page.png")
        
        # Show key sections
        print("\nSearching for data patterns...")
        
        # Look for table rows
        matches = re.findall(r'<tr[^>]*>.*?</tr>', html, re.I | re.S)
        print(f"Found {len(matches)} table rows")
        
        # Show rows with keywords
        for i, row in enumerate(matches[:10], 1):
            if any(kw in row for kw in ['Capital', 'Land', 'Rates', 'Legal', 'Value']):
                print(f"\nRow {i}:")
                print(row[:300])
        
        print("\nKeeping browser open for inspection...")
        time.sleep(30)
        
    finally:
        browser.close()
