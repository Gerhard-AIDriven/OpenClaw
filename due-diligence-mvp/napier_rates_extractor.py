#!/usr/bin/env python3
"""
Napier Council Rates Data Extractor - Windows Compatible
Production-ready extractor for property rates information
"""

import json
import re
import sys
from datetime import datetime
from playwright.sync_api import sync_playwright

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

def extract_napier_rates(rid: str):
    """
    Extract complete rates data from Napier Council property page
    
    Args:
        rid: Property RID (e.g., "138159-107977")
    
    Returns:
        Dictionary with all rates data
    """
    
    url = f'https://www.napier.govt.nz/services/properties-and-rates/my-property/?rid={rid}'
    
    print("="*80)
    print("NAPIER COUNCIL RATES EXTRACTOR")
    print(f"RID: {rid}")
    print("="*80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # Load page
            print("\nLoading property page...")
            page.goto(url, timeout=30000, wait_until='networkidle')
            page.wait_for_timeout(2000)  # Wait for dynamic content
            
            html_content = page.content()
            
            # Initialize result
            result = {
                'rid': rid,
                'url': url,
                'scrape_timestamp': datetime.now().isoformat(),
                'success': False,
                'data': {}
            }
            
            # Extract using table row patterns
            print("Extracting data from tables...")
            
            # Pattern 1: Capital Value - <td>Capital Value&nbsp;</td><td>$1,400,000&nbsp;</td>
            cv_match = re.search(
                r'<td>Capital\s*Value[^>]*>.*?</td>\s*<td>([^<]+)</td>',
                html_content,
                re.IGNORECASE | re.DOTALL
            )
            if cv_match:
                cv_text = cv_match.group(1).strip()
                cv_str = re.sub(r'[^\d.]', '', cv_text.replace('$', '').replace(',', ''))
                try:
                    result['data']['capital_value'] = int(float(cv_str))
                    print(f"[OK] Capital Value: ${result['data']['capital_value']:,}")
                except:
                    pass
            
            # Pattern 2: Land Value - <td>Land Value&nbsp;</td><td>$920,000&nbsp;</td>
            lv_match = re.search(
                r'<td>Land\s*Value[^>]*>.*?</td>\s*<td>([^<]+)</td>',
                html_content,
                re.IGNORECASE | re.DOTALL
            )
            if lv_match:
                lv_text = lv_match.group(1).strip()
                lv_str = re.sub(r'[^\d.]', '', lv_text.replace('$', '').replace(',', ''))
                try:
                    result['data']['land_value'] = int(float(lv_str))
                    print(f"[OK] Land Value: ${result['data']['land_value']:,}")
                except:
                    pass
            
            # Pattern 3: Annual Rates - look for Total Rates Levied (first occurrence is annual)
            rates_match = re.search(
                r'<td[^>]*colspan[^>]*>Total Rates Levied</td>\s*<td[^>]*>([\d,]+\.\d+)',
                html_content,
                re.IGNORECASE
            )
            if not rates_match:
                # Alternative: Total Rates Levied in strong tags
                rates_match = re.search(
                    r'Total Rates Levied</strong></td>\s*<td[^>]*>([\d,]+\.\d+)',
                    html_content,
                    re.IGNORECASE
                )
            
            if rates_match:
                rates_str = rates_match.group(1).replace(',', '')
                try:
                    result['data']['annual_rates'] = float(rates_str)
                    print(f"[OK] Annual Rates: ${result['data']['annual_rates']:,.2f}")
                except:
                    pass
            
            # Pattern 4: Legal Description - exact match
            legal_match = re.search(
                r'<td>Legal Description&nbsp;</td>\s*<td[^>]*>(LOT\s+\d+\s+DP\s+\d+)',
                html_content,
                re.IGNORECASE
            )
            if legal_match:
                result['data']['legal_description'] = legal_match.group(1).strip()
                print(f"[OK] Legal Description: {result['data']['legal_description']}")
            
            # Pattern 5: Property ID from Parcel section
            parcel_match = re.search(
                r'Parcel\s*\d+.*?<td>Property\s*ID[^>]*>.*?</td>\s*<td>(\d+)</td>',
                html_content,
                re.IGNORECASE | re.DOTALL
            )
            if parcel_match:
                result['data']['property_id'] = parcel_match.group(1).strip()
                print(f"[OK] Property ID: {result['data']['property_id']}")
            
            # Calculate improvements value
            if 'capital_value' in result['data'] and 'land_value' in result['data']:
                result['data']['improvements_value'] = (
                    result['data']['capital_value'] - result['data']['land_value']
                )
                print(f"[OK] Improvements Value: ${result['data']['improvements_value']:,} (calculated)")
            
            # Calculate rates as % of CV
            if 'annual_rates' in result['data'] and 'capital_value' in result['data']:
                rates_pct = (result['data']['annual_rates'] / result['data']['capital_value']) * 100
                result['data']['rates_as_percent_cv'] = round(rates_pct, 3)
                print(f"[OK] Rates as % of CV: {result['data']['rates_as_percent_cv']}%")
            
            result['success'] = len(result['data']) > 0
            
            # Save to JSON
            output_path = f'due-diligence-mvp/napier_{rid}_rates.json'
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)
            print(f"\n[OK] Data saved: {output_path}")
            
            return result
            
        except Exception as e:
            print(f"\n[ERROR] {e}")
            import traceback
            traceback.print_exc()
            return None
        
        finally:
            browser.close()


def format_for_report(rates_data: dict) -> str:
    """Format extracted rates data as HTML table for Tier 1 report"""
    
    if not rates_data or not rates_data.get('success'):
        return '''
        <div style="margin-top: 20px; padding: 20px; background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); border-radius: 8px;">
            <p style="color: #ffc107; font-weight: 600; margin-bottom: 10px;">Rates Information</p>
            <p style="color: #e0e0e0; font-size: 0.9rem;">
                Capital value and rates data requires manual verification from Napier City Council records.
            </p>
        </div>
        '''
    
    data = rates_data['data']
    html = '''
    <div style="margin-top: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
                <tr style="background: rgba(247,147,30,0.1); border-bottom: 2px solid var(--orange);">
                    <th style="padding: 12px; text-align: left; color: var(--orange); font-family: 'Rajdhani', sans-serif; font-weight: 600;">Property Value</th>
                    <th style="padding: 12px; text-align: right; color: var(--orange); font-family: 'Rajdhani', sans-serif; font-weight: 600;">Amount (NZD)</th>
                </tr>
            </thead>
            <tbody>
    '''
    
    rows = []
    if data.get('capital_value'):
        rows.append(('Capital Value (CV)', data['capital_value']))
    if data.get('land_value'):
        rows.append(('Land Value', data['land_value']))
    if data.get('improvements_value'):
        rows.append(('Improvements Value', data['improvements_value']))
    if data.get('annual_rates'):
        rows.append(('Annual Rates', data['annual_rates']))
    
    if not rows:
        html += '<tr><td colspan="2" style="padding: 20px; text-align: center; color: #a0a0a0;">No valuation data available</td></tr>'
    else:
        for i, (label, amount) in enumerate(rows):
            bg_color = 'rgba(255,255,255,0.03)' if i % 2 == 0 else 'rgba(255,255,255,0.05)'
            formatted = f"${amount:,.2f}" if isinstance(amount, float) else f"${amount:,}"
            html += f'''
                <tr style="background: {bg_color}; border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px; color: #e0e0e0;">{label}</td>
                    <td style="padding: 12px; text-align: right; color: #f0f0f0; font-weight: 600;">{formatted}</td>
                </tr>
            '''
    
    if data.get('rates_as_percent_cv'):
        html += f'''
            <tr style="background: rgba(247,147,30,0.05); border-top: 2px solid var(--orange);">
                <td colspan="2" style="padding: 12px; text-align: right; color: var(--orange); font-size: 0.85rem; font-style: italic;">
                    Rates represent {data['rates_as_percent_cv']}% of capital value
                </td>
            </tr>
        '''
    
    html += f'''
            </tbody>
        </table>
        <p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 15px; font-style: italic;">
            Source: Napier City Council | RID: {rates_data['rid']} | Retrieved: {rates_data['scrape_timestamp'][:10]}
        </p>
    </div>
    '''
    
    return html


if __name__ == '__main__':
    test_rid = "138159-107977"  # 18 Ferguson Avenue
    result = extract_napier_rates(test_rid)
    
    if result and result.get('success'):
        print("\n" + "="*80)
        print("EXTRACTION SUCCESSFUL")
        print("="*80)
        print(f"Data points extracted: {len(result['data'])}")
    else:
        print("\n[ERROR] Extraction failed")
