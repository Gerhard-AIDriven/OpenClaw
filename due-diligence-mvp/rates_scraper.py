"""
Due Diligence MVP - Council Rates Scraper

Scrapes property rate information from NZ council portals:
- Napier City Council
- Hastings District Council
- Central Hawke's Bay District Council

Extracts:
- Capital Value (CV)
- Land Value
- Improvements Value
- Annual Rates
- Valuation Date

Usage: python rates_scraper.py "16 Ferguson Avenue, Westshore, Napier"
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

# Configuration
COUNCIL_PORTALS = {
    'napier': {
        'name': 'Napier City Council',
        'search_url': 'https://www.napier.govt.nz/your-council/have-your-say/property-search/',
        'api_endpoint': None,  # Will need browser automation
        'notes': 'Requires Puppeteer - no public API'
    },
    'hastings': {
        'name': 'Hastings District Council',
        'search_url': 'https://www.hdc.govt.nz/your-council-online/maps-and-property-information/',
        'api_endpoint': None,
        'notes': 'Requires Puppeteer - no public API'
    },
    'chb': {
        'name': 'Central Hawke\'s Bay District Council',
        'search_url': 'https://www.chbdc.govt.nz/',
        'api_endpoint': None,
        'notes': 'Requires manual lookup'
    }
}

def determine_council(address: str) -> str:
    """Determine which council area an address is in"""
    address_lower = address.lower()
    
    if 'napier' in address_lower:
        return 'napier'
    elif 'hastings' in address_lower or 'havelock north' in address_lower:
        return 'hastings'
    elif 'waipawa' in address_lower or 'waipukurau' in address_lower:
        return 'chb'
    else:
        # Default to Napier for Hawke's Bay
        return 'napier'

def scrape_rates_manual(address: str, council: str) -> Optional[Dict[str, Any]]:
    """
    Manual rates lookup - returns structured data for manual entry
    
    In production, this would be replaced with Puppeteer automation.
    For now, provides a structured template for staff to fill in.
    """
    print(f"\n[RATES] Manual lookup required for {council.upper()} council")
    print(f"Address: {address}")
    print(f"\nPlease visit:")
    print(f"  {COUNCIL_PORTALS[council]['search_url']}")
    print(f"\nAnd extract:")
    print(f"  • Capital Value (CV)")
    print(f"  • Land Value")
    print(f"  • Improvements Value")
    print(f"  • Annual Rates")
    print(f"  • Valuation Date")
    
    # Return template for manual entry
    return {
        'status': 'manual_entry_required',
        'council': COUNCIL_PORTALS[council]['name'],
        'search_url': COUNCIL_PORTALS[council]['search_url'],
        'address': address,
        'data': None,
        'message': 'Staff to manually enter rates data from council portal'
    }

def scrape_rates_mock(address: str, council: str) -> Optional[Dict[str, Any]]:
    """
    Mock rates scraper for testing - simulates real data
    
    Replace with actual Puppeteer implementation in Phase 4.
    """
    print(f"\n[RATES] Scraping {council.upper()} council portal (MOCK MODE)...")
    
    # Simulate successful scrape with realistic HB data
    mock_data = {
        'capital_value': 850000,
        'land_value': 420000,
        'improvements_value': 430000,
        'annual_rates': 3200,
        'valuation_date': '2023-10-01',
        'property_type': 'Residential',
        'area_sqm': 803
    }
    
    print(f"✅ Mock scrape successful")
    print(f"   CV: ${mock_data['capital_value']:,}")
    print(f"   Land: ${mock_data['land_value']:,}")
    print(f"   Annual Rates: ${mock_data['annual_rates']:,}")
    
    return {
        'status': 'success',
        'council': COUNCIL_PORTALS[council]['name'],
        'address': address,
        'data': mock_data,
        'scrape_timestamp': datetime.now().isoformat(),
        'source': 'mock_data_for_testing'
    }

def format_rates_html(rates_data: Dict[str, Any]) -> str:
    """Format rates data as HTML table for report"""
    
    if not rates_data or rates_data.get('status') == 'manual_entry_required':
        return '''
        <div style="margin-top: 20px; padding: 20px; background: rgba(255,193,7,0.1); border: 1px solid var(--gold); border-radius: 8px;">
            <p style="color: #ffc107; font-weight: 600; margin-bottom: 10px;">⚠️ Rates Information</p>
            <p style="color: #e0e0e0; font-size: 0.9rem;">
                Rates data is being manually verified. Please contact us for the most up-to-date 
                capital value and annual rates information.
            </p>
            <p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 10px;">
                Alternatively, you can view this property on 
                <a href="{url}" target="_blank" style="color: var(--gold);">OneRoof.co.nz</a> 
                or the council website.
            </p>
        </div>
        '''.format(url='https://www.oneroof.co.nz/')
    
    data = rates_data.get('data', {})
    
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
    
    # Add rows
    rows = [
        ('Capital Value (CV)', data.get('capital_value', 0)),
        ('Land Value', data.get('land_value', 0)),
        ('Improvements Value', data.get('improvements_value', 0)),
        ('Annual Rates', data.get('annual_rates', 0)),
    ]
    
    for i, (label, amount) in enumerate(rows):
        bg_color = 'rgba(255,255,255,0.03)' if i % 2 == 0 else 'rgba(255,255,255,0.05)'
        html += f'''
                <tr style="background: {bg_color}; border-bottom: 1px solid var(--border);">
                    <td style="padding: 12px; color: #e0e0e0;">{label}</td>
                    <td style="padding: 12px; text-align: right; color: #f0f0f0; font-weight: 600;">${amount:,}</td>
                </tr>
        '''
    
    # Add valuation date
    val_date = data.get('valuation_date', 'Unknown')
    html += f'''
            </tbody>
        </table>
        <p style="color: #a0a0a0; font-size: 0.85rem; margin-top: 15px; font-style: italic;">
            ℹ️ Valuation date: {val_date}. Rates are approximate and subject to council reassessment.
            Verify with council for exact figures.
        </p>
    </div>
    '''
    
    return html

def extract_rates_summary(rates_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create summary statistics from rates data"""
    
    if not rates_data or rates_data.get('status') != 'success':
        return {
            'available': False,
            'summary_text': 'Rates data not automatically available - manual verification required',
            'cv': None,
            'annual_rates': None
        }
    
    data = rates_data.get('data', {})
    cv = data.get('capital_value', 0)
    annual_rates = data.get('annual_rates', 0)
    
    # Calculate rates as % of CV
    rates_pct = (annual_rates / cv * 100) if cv > 0 else 0
    
    return {
        'available': True,
        'summary_text': f'CV ${cv:,} | Annual Rates ${annual_rates:,} ({rates_pct:.2f}% of CV)',
        'cv': cv,
        'land_value': data.get('land_value'),
        'improvements_value': data.get('improvements_value'),
        'annual_rates': annual_rates,
        'rates_as_percent_cv': round(rates_pct, 2),
        'valuation_date': data.get('valuation_date')
    }

def get_rates_for_report(address: str, use_mock: bool = True) -> Dict[str, Any]:
    """
    Complete workflow: Fetch rates data and prepare for report
    
    Args:
        address: Full property address
        use_mock: If True, use mock data (until Puppeteer implemented)
    
    Returns:
        Dictionary with rates data for report generation
    """
    print(f"\n[RATES] Fetching for: {address}")
    
    # Determine council
    council = determine_council(address)
    print(f"Council area: {COUNCIL_PORTALS[council]['name']}")
    
    # Get rates data
    if use_mock:
        rates_data = scrape_rates_mock(address, council)
    else:
        rates_data = scrape_rates_manual(address, council)
    
    # Format for report
    result = {
        'address': address,
        'council': COUNCIL_PORTALS[council]['name'],
        'rates_data': rates_data,
        'html_table': format_rates_html(rates_data),
        'summary': extract_rates_summary(rates_data),
        'fetch_timestamp': datetime.now().isoformat()
    }
    
    return result


if __name__ == '__main__':
    # Test with known addresses
    test_addresses = [
        "16 Ferguson Avenue, Westshore, Napier",
        "31 Douglas McLean Avenue, Marewa, Napier"
    ]
    
    print("="*80)
    print("RATES SCRAPER - TEST RUN (MOCK MODE)")
    print("="*80)
    
    for addr in test_addresses:
        print(f"\n{'='*80}")
        print(f"Testing: {addr}")
        print(f"{'='*80}")
        
        result = get_rates_for_report(addr, use_mock=True)
        
        print(f"\nSummary:")
        print(f"  Council: {result['council']}")
        print(f"  Available: {result['summary']['available']}")
        if result['summary']['available']:
            print(f"  {result['summary']['summary_text']}")
        print(f"  HTML Length: {len(result['html_table'])} chars")
    
    print("\n" + "="*80)
    print("✅ RATES SCRAPER READY (MOCK MODE)")
    print("="*80)
    print("\nTo enable real scraping:")
    print("  1. Install Puppeteer: pip install playwright")
    print("  2. Install browsers: playwright install")
    print("  3. Implement scrape_rates_puppeteer() function")
    print("  4. Set use_mock=False in get_rates_for_report()")
