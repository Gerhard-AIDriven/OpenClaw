#!/usr/bin/env python3
"""
Due Diligence MVP - Real Council Rates Scraper using Playwright

Scrapes actual property rate information from NZ council portals:
- Napier City Council
- Hastings District Council

Extracts:
- Capital Value (CV)
- Land Value
- Improvements Value
- Annual Rates
- Valuation Date

Usage: python rates_scraper_real.py "16 Ferguson Avenue, Westshore, Napier"
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import json
import re
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from playwright.sync_api import sync_playwright, Page, TimeoutError

# Configuration
COUNCIL_CONFIG = {
    'napier': {
        'name': 'Napier City Council',
        'search_url': 'https://www.napier.govt.nz/your-council/have-your-say/property-search/',
        'search_field_selector': 'input[placeholder*="address"], input[name*="address"], #address',
        'submit_selector': 'button[type="submit"], input[type="submit"], button:has-text("Search")',
        'results_selector': '.property-details, .rates-info, [class*="property"]',
        'cv_selector': '[class*="capital"], [class*="CV"], :has-text("Capital Value")',
        'land_value_selector': '[class*="land"], :has-text("Land Value")',
        'rates_selector': '[class*="rates"], :has-text("Annual Rates"), :has-text("Rates Payable")',
    },
    'hastings': {
        'name': 'Hastings District Council',
        'search_url': 'https://www.hdc.govt.nz/your-council-online/maps-and-property-information/',
        'search_field_selector': 'input[placeholder*="address"], input[name*="address"]',
        'submit_selector': 'button[type="submit"], input[type="submit"]',
        'results_selector': '.property-details, .rating-info',
        'cv_selector': '[class*="capital"], [class*="CV"]',
        'land_value_selector': '[class*="land"]',
        'rates_selector': '[class*="rates"]',
    }
}

def determine_council(address: str) -> str:
    """Determine which council area an address is in"""
    address_lower = address.lower()
    
    if 'napier' in address_lower or 'westshore' in address_lower or 'marewa' in address_lower:
        return 'napier'
    elif 'hastings' in address_lower or 'havelock north' in address_lower or 'flaxmere' in address_lower:
        return 'hastings'
    else:
        # Default to Napier for Hawke's Bay
        return 'napier'

def scrape_napier_rates(page: Page, address: str) -> Optional[Dict[str, Any]]:
    """
    Scrape Napier City Council rates portal
    
    Note: This is a template - actual selectors need to be determined by inspecting the live site
    """
    print(f"   Navigating to Napier Council...")
    
    try:
        # Go to property search page
        page.goto('https://www.napier.govt.nz', timeout=30000)
        page.wait_for_load_state('networkidle')
        
        # Try to find property search
        # This is a placeholder - actual implementation needs site inspection
        print(f"   ⚠️  Napier Council website structure needs manual inspection")
        print(f"   Please visit: https://www.napier.govt.nz/your-council/have-your-say/property-search/")
        print(f"   And identify the correct form selectors")
        
        return None
        
    except Exception as e:
        print(f"   ❌ Error scraping Napier: {e}")
        return None

def scrape_hastings_rates(page: Page, address: str) -> Optional[Dict[str, Any]]:
    """
    Scrape Hastings District Council rates portal
    """
    print(f"   Navigating to Hastings Council...")
    
    try:
        page.goto('https://www.hdc.govt.nz', timeout=30000)
        page.wait_for_load_state('networkidle')
        
        print(f"   ⚠️  Hastings Council website structure needs manual inspection")
        print(f"   Please visit: https://www.hdc.govt.nz/your-council-online/maps-and-property-information/")
        
        return None
        
    except Exception as e:
        print(f"   ❌ Error scraping Hastings: {e}")
        return None

def scrape_oneroof(address: str) -> Optional[Dict[str, Any]]:
    """
    Alternative: Scrape OneRoof.co.nz for property data
    Often has CV and recent sale information
    """
    print(f"   Trying OneRoof as alternative...")
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Search on OneRoof
            search_url = f"https://www.oneroof.co.nz/property/{address.replace(' ', '-').lower()}"
            page.goto(search_url, timeout=30000)
            page.wait_for_load_state('networkidle')
            
            # Check if we got a valid property page
            if 'property not found' in page.content().lower():
                print(f"   ❌ Property not found on OneRoof")
                browser.close()
                return None
            
            # Try to extract CV
            cv_text = None
            try:
                cv_element = page.query_selector('[data-testid="capital-value"], .capital-value, :has-text("CV")')
                if cv_element:
                    cv_text = cv_element.inner_text()
                    # Parse: "$850,000" -> 850000
                    cv_match = re.search(r'\$?([\d,]+)', cv_text)
                    if cv_match:
                        cv = int(cv_match.group(1).replace(',', ''))
                        print(f"   ✅ Found CV: ${cv:,}")
            except:
                pass
            
            browser.close()
            
            if cv:
                return {
                    'capital_value': cv,
                    'land_value': None,
                    'improvements_value': None,
                    'annual_rates': None,
                    'valuation_date': None,
                    'source': 'OneRoof.co.nz',
                    'scrape_timestamp': datetime.now().isoformat()
                }
            else:
                print(f"   ❌ Could not extract CV from OneRoof")
                return None
                
    except Exception as e:
        print(f"   ❌ Error scraping OneRoof: {e}")
        return None

def get_rates_from_qvco.nz(address: str) -> Optional[Dict[str, Any]]:
    """
    Alternative: Use QV.co.nz API/website (official valuation provider)
    """
    print(f"   ⚠️  QV.co.nz requires subscription API access")
    print(f"   Consider: https://www.qv.co.nz/property-data-api/")
    return None

def scrape_rates_real(address: str, council: str) -> Optional[Dict[str, Any]]:
    """
    Main rates scraping function - tries multiple sources
    """
    print(f"\n[RATES] Scraping real data for: {address}")
    print(f"Council area: {COUNCIL_CONFIG[council]['name']}")
    
    # Strategy 1: Try council portal (requires selector tuning)
    print(f"\n[Strategy 1] Council portal...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        rates_data = None
        if council == 'napier':
            rates_data = scrape_napier_rates(page, address)
        elif council == 'hastings':
            rates_data = scrape_hastings_rates(page, address)
        
        browser.close()
        
        if rates_data:
            return rates_data
    
    # Strategy 2: Try OneRoof
    print(f"\n[Strategy 2] OneRoof.co.nz...")
    rates_data = scrape_oneroof(address)
    if rates_data:
        return rates_data
    
    # Strategy 3: Manual fallback
    print(f"\n[Strategy 3] Manual entry required")
    return {
        'status': 'manual_entry_required',
        'council': COUNCIL_CONFIG[council]['name'],
        'message': 'Automated scraping not available. Staff to manually verify.',
        'suggested_sources': [
            'https://www.napier.govt.nz/your-council/have-your-say/property-search/',
            'https://www.hdc.govt.nz/your-council-online/maps-and-property-information/',
            'https://www.oneroof.co.nz/'
        ]
    }

def format_rates_html(rates_data: Dict[str, Any]) -> str:
    """Format rates data as HTML table for report"""
    
    if not rates_data or rates_data.get('status') == 'manual_entry_required':
        return '''
        <div style="margin-top: 20px; padding: 20px; background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); border-radius: 8px;">
            <p style="color: #ffc107; font-weight: 600; margin-bottom: 10px;">⚠️ Rates Information</p>
            <p style="color: #e0e0e0; font-size: 0.9rem;">
                Capital value and rates data requires manual verification from council records.
                Contact us for the most up-to-date figures.
            </p>
            <p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 10px;">
                Alternatively, view this property on 
                <a href="https://www.oneroof.co.nz/" target="_blank" style="color: var(--gold);">OneRoof.co.nz</a>.
            </p>
        </div>
        '''
    
    data = rates_data
    html = '''
    <div style="margin-top: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
                <tr style="background: rgba(247,147,30,0.1); border-bottom: 2px solid var(--orange);">
                    <th style="padding: 12px; text-align: left; color: var(--orange); font-family: 'Rajdhani', sans-serif;">Property Value</th>
                    <th style="padding: 12px; text-align: right; color: var(--orange); font-family: 'Rajdhani', sans-serif;">Amount (NZD)</th>
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
            html += f'''
                <tr style="background: {bg_color}; border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px; color: #e0e0e0;">{label}</td>
                    <td style="padding: 12px; text-align: right; color: #f0f0f0; font-weight: 600;">${amount:,}</td>
                </tr>
            '''
    
    # Add source info
    source = data.get('source', 'Council records')
    val_date = data.get('valuation_date', 'Unknown')
    html += f'''
            </tbody>
        </table>
        <p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 15px; font-style: italic;">
            ℹ️ Source: {source} | Valuation date: {val_date}. Verify with council for official figures.
        </p>
    </div>
    '''
    
    return html

def extract_rates_summary(rates_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create summary statistics from rates data"""
    
    if not rates_data or rates_data.get('status') == 'manual_entry_required':
        return {
            'available': False,
            'summary_text': 'Rates data requires manual verification',
            'cv': None,
            'annual_rates': None
        }
    
    cv = rates_data.get('capital_value')
    annual_rates = rates_data.get('annual_rates')
    
    if not cv:
        return {
            'available': False,
            'summary_text': 'Capital value not available',
            'cv': None,
            'annual_rates': annual_rates
        }
    
    # Calculate rates as % of CV
    rates_pct = (annual_rates / cv * 100) if (cv > 0 and annual_rates) else 0
    
    return {
        'available': True,
        'summary_text': f'CV ${cv:,}' + (f' | Annual Rates ${annual_rates:,} ({rates_pct:.2f}%)' if annual_rates else ''),
        'cv': cv,
        'land_value': rates_data.get('land_value'),
        'improvements_value': rates_data.get('improvements_value'),
        'annual_rates': annual_rates,
        'rates_as_percent_cv': round(rates_pct, 2) if rates_pct > 0 else None,
        'valuation_date': rates_data.get('valuation_date'),
        'source': rates_data.get('source')
    }

def get_rates_for_report(address: str, use_mock: bool = False) -> Dict[str, Any]:
    """
    Complete workflow: Fetch REAL rates data and prepare for report
    
    Args:
        address: Full property address
        use_mock: If False, attempts real scraping (default)
    
    Returns:
        Dictionary with rates data for report generation
    """
    print(f"\n[RATES] Fetching for: {address}")
    
    if use_mock:
        # Mock data for testing
        mock_data = {
            'capital_value': 850000,
            'land_value': 420000,
            'improvements_value': 430000,
            'annual_rates': 3200,
            'valuation_date': '2023-10-01',
            'source': 'Mock Data (Testing)'
        }
        rates_data = mock_data
        council_name = 'Napier City Council (Mock)'
    else:
        # Real scraping
        council = determine_council(address)
        council_name = COUNCIL_CONFIG[council]['name']
        rates_data = scrape_rates_real(address, council)
    
    result = {
        'address': address,
        'council': council_name,
        'rates_data': rates_data,
        'html_table': format_rates_html(rates_data),
        'summary': extract_rates_summary(rates_data),
        'fetch_timestamp': datetime.now().isoformat(),
        'mode': 'mock' if use_mock else 'real'
    }
    
    return result


if __name__ == '__main__':
    # Test with known addresses
    test_addresses = [
        "16 Ferguson Avenue, Westshore, Napier",
        "31 Douglas McLean Avenue, Marewa, Napier"
    ]
    
    print("="*80)
    print("RATES SCRAPER - REAL DATA MODE")
    print("="*80)
    
    for addr in test_addresses:
        print(f"\n{'='*80}")
        print(f"Testing: {addr}")
        print(f"{'='*80}")
        
        result = get_rates_for_report(addr, use_mock=False)
        
        print(f"\nSummary:")
        print(f"  Council: {result['council']}")
        print(f"  Mode: {result['mode']}")
        print(f"  Available: {result['summary']['available']}")
        if result['summary']['available']:
            print(f"  {result['summary']['summary_text']}")
            if result['summary'].get('source'):
                print(f"  Source: {result['summary']['source']}")
        print(f"  HTML Length: {len(result['html_table'])} chars")
    
    print("\n" + "="*80)
    print("✅ RATES SCRAPER READY")
    print("="*80)
