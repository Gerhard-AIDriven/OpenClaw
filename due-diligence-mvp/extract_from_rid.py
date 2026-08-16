#!/usr/bin/env python3
"""
Extract rates data from Napier Council property page using known RID
"""

import json
import re
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright

def extract_property_data(rid: str):
    """
    Go directly to property page using RID and extract all data
    
    Args:
        rid: Property RID (e.g., "138159-107977")
    
    Returns:
        Dictionary with all extracted property data
    """
    
    url = f'https://www.napier.govt.nz/services/properties-and-rates/my-property/?rid={rid}'
    
    print("="*80)
    print(f"NAPIER COUNCIL - EXTRACT FROM RID")
    print(f"RID: {rid}")
    print(f"URL: {url}")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Navigate to property page
            print(f"\n[1/4] Loading property page...")
            page.goto(url, timeout=30000, wait_until='networkidle')
            print("✅ Page loaded")
            
            # Wait for dynamic content
            page.wait_for_timeout(3000)
            
            # Save screenshot
            screenshot_path = f'due-diligence-mvp/napier_rid_{rid}_screenshot.png'
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"📸 Screenshot saved: {screenshot_path}")
            
            # Save full HTML
            html_content = page.content()
            html_path = f'due-diligence-mvp/napier_rid_{rid}_source.html'
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"📄 HTML saved: {html_path}")
            
            # Get page title/text content
            print(f"\n[2/4] Analyzing page content...")
            text_content = page.content().lower()
            
            # Extract data using multiple strategies
            extracted = {
                'rid': rid,
                'url': url,
                'scrape_timestamp': datetime.now().isoformat(),
                'data': {}
            }
            
            # Strategy 1: Look for labeled values (Label: Value pattern)
            print("\n[3/4] Extracting labeled data...")
            
            patterns = {
                'capital_value': [
                    r'capital\s*value[^:]*:\s*([$]?[\d,]+)',
                    r'cv[^:]*:\s*([$]?[\d,]+)',
                    r'capital\s*value[^$]*\$([\d,]+)',
                ],
                'land_value': [
                    r'land\s*value[^:]*:\s*([$]?[\d,]+)',
                    r'land\s*value[^$]*\$([\d,]+)',
                ],
                'improvements_value': [
                    r'improvements?\s*(?:value)?[^:]*:\s*([$]?[\d,]+)',
                    r'building\s*value[^:]*:\s*([$]?[\d,]+)',
                ],
                'annual_rates': [
                    r'annual\s*rates[^:]*:\s*([$]?[\d,]+)',
                    r'total\s*rates[^:]*:\s*([$]?[\d,]+)',
                    r'rates\s*payable[^:]*:\s*([$]?[\d,]+)',
                ],
                'valuation_date': [
                    r'valuation\s*date[^:]*:\s*([^\n<]+)',
                    r'as\s*at[^:]*:\s*([^\n<]+)',
                    r'date[^:]*:\s*(\d{1,2}/\d{1,2}/\d{2,4})',
                ],
                'property_id': [
                    r'property\s*id[^:]*:\s*(\d+)',
                    r'parcel[^:]*:\s*(\d+)',
                ],
                'legal_description': [
                    r'legal\s*description[^:]*:\s*([A-Z0-9\s]+)',
                ],
                'street_address': [
                    r'(?:address|street)[^:]*:\s*([^\n<]+)',
                ],
                'suburb': [
                    r'suburb[^:]*:\s*([^\n<]+)',
                ],
            }
            
            for field, regex_list in patterns.items():
                for regex in regex_list:
                    match = re.search(regex, html_content, re.IGNORECASE)
                    if match:
                        value = match.group(1).strip()
                        # Clean up the value
                        value = re.sub(r'<[^>]+>', '', value)  # Remove HTML tags
                        value = value.strip()
                        
                        # Try to convert numeric values
                        if 'value' in field or 'rates' in field:
                            numeric_match = re.search(r'[\d,]+(?:\.\d+)?', value.replace('$', ''))
                            if numeric_match:
                                num_str = numeric_match.group().replace(',', '')
                                try:
                                    value = int(float(num_str))
                                except:
                                    pass
                        
                        extracted['data'][field] = value
                        print(f"✅ {field}: {value}")
                        break
            
            # Strategy 2: Look for table rows
            print(f"\n[4/4] Scanning tables...")
            
            # Find all table rows
            row_pattern = r'<tr[^>]*>(.*?)</tr>'
            rows = re.findall(row_pattern, html_content, re.DOTALL | re.IGNORECASE)
            
            print(f"   Found {len(rows)} table rows")
            
            for i, row in enumerate(rows[:20]):  # Check first 20 rows
                cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.DOTALL | re.IGNORECASE)
                if len(cells) >= 2:
                    # Clean cell content
                    clean_cells = []
                    for cell in cells:
                        clean = re.sub(r'<[^>]+>', '', cell).strip()
                        if clean:
                            clean_cells.append(clean)
                    
                    # Check if this looks like a data row
                    row_text = ' '.join(clean_cells).lower()
                    
                    # Look for key-value pairs
                    if any(kw in row_text for kw in ['capital', 'land', 'rates', 'value', 'property', 'legal']):
                        print(f"   📋 Row {i}: {clean_cells[:4]}")  # Show first 4 cells
            
            # Strategy 3: Look for common data attributes
            print(f"\n🔍 Checking data attributes...")
            data_attr_pattern = r'data-(?:value|amount|price|rate)[^>]*=[\'"]([^\'"]+)[\'"]'
            data_attrs = re.findall(data_attr_pattern, html_content, re.IGNORECASE)
            if data_attrs:
                print(f"   Found {len(data_attrs)} data attributes:")
                for attr in data_attrs[:10]:
                    print(f"   → {attr}")
            
            # Strategy 4: Look for JSON-LD or embedded data
            print(f"\n🔍 Checking for embedded JSON...")
            json_pattern = r'type=[\'"]application/ld\+json[\'"][^>]*>(.*?)</script>'
            json_matches = re.findall(json_pattern, html_content, re.DOTALL | re.IGNORECASE)
            if json_matches:
                print(f"   Found {len(json_matches)} JSON-LD blocks")
                for j, json_str in enumerate(json_matches[:2]):
                    try:
                        json_data = json.loads(json_str)
                        print(f"   📦 JSON-LD {j}: {json.dumps(json_data, indent=2)[:500]}...")
                    except:
                        pass
            
            # Save extracted data
            output_path = f'due-diligence-mvp/napier_rid_{rid}_extracted.json'
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(extracted, f, indent=2, default=str)
            print(f"\n💾 Extracted data saved: {output_path}")
            
            # Summary
            print("\n" + "="*80)
            print("EXTRACTION SUMMARY")
            print("="*80)
            if extracted['data']:
                print("Successfully extracted:")
                for key, value in extracted['data'].items():
                    print(f"  • {key}: {value}")
            else:
                print("⚠️  No structured data found yet")
                print("👉 Please inspect the HTML file manually:")
                print(f"   {html_path}")
            
            print("\n" + "="*80)
            
            return extracted
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return None
        
        finally:
            print("\n🕒 Browser will close in 15 seconds...")
            page.wait_for_timeout(15000)
            browser.close()


if __name__ == '__main__':
    # Test with known RIDs
    test_rids = [
        "138159-107977",  # 18 Ferguson Avenue
    ]
    
    for rid in test_rids:
        result = extract_property_data(rid)
        
        if result and result.get('data'):
            print(f"\n✅ Extraction successful for RID {rid}")
        else:
            print(f"\n❌ Extraction failed for RID {rid}")
        
        print("\n\n")
