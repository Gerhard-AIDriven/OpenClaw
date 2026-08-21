#!/usr/bin/env python3
"""
Quick Test Report Generator
Test the full workflow with a new address

Usage:
    python quick_test_report.py "16 Ferguson Avenue, Napier"
"""

import sys
import json
from pathlib import Path
from datetime import datetime
import time

sys.stdout.reconfigure(encoding='utf-8')

def geocode_address(address):
    """
    Get lat/long from address using OpenStreetMap Nominatim (free, no API key)
    Returns (latitude, longitude) or (None, None) if not found
    """
    try:
        import urllib.request
        import urllib.parse
        
        # Format address for NZ search
        search_query = f"{address}, Napier, New Zealand"
        encoded_query = urllib.parse.quote(search_query)
        
        url = f"https://nominatim.openstreetmap.org/search?format=json&q={encoded_query}&limit=1"
        
        # Nominatim requires User-Agent
        request = urllib.request.Request(
            url,
            headers={'User-Agent': 'AIDriven-DueDiligence/1.0'}
        )
        
        with urllib.request.urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            if data and len(data) > 0:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                print(f"📍 Geocoded: {lat:.6f}, {lon:.6f}")
                return lat, lon
            else:
                print(f"⚠️  Could not geocode address, using default Napier coords")
                return -39.5006, 176.9041
                
    except Exception as e:
        print(f"⚠️  Geocoding failed: {e}, using default coords")
        return -39.5006, 176.9041

def main():
    print("="*80)
    print("QUICK TEST REPORT GENERATOR")
    print("="*80)
    
    # Get address
    if len(sys.argv) > 1:
        address = ' '.join(sys.argv[1:])
    else:
        address = input("\nEnter property address: ").strip()
    
    if not address:
        print("❌ No address provided")
        return
    
    print(f"\n📍 Testing with: {address}")
    
    # Geocode address first
    print("\nGeocoding address...")
    latitude, longitude = geocode_address(address)
    
    # Import the workflow
    from napier_assisted_final import scrape_assisted
    from report_generator_enhanced import generate_enhanced_report
    
    # Step 1: Extract rates
    print("\n" + "="*80)
    print("STEP 1: EXTRACT RATES DATA")
    print("="*80)
    print("\nA browser window will open.")
    print("Please search for the property manually.")
    print("The script will auto-extract when it detects the property page.")
    print("\nOpening browser in 3 seconds...\n")
    time.sleep(3)
    
    rates_result = scrape_assisted()
    
    if not rates_result or not rates_result.get('success'):
        print("\n⚠️  Rates extraction failed or cancelled")
        rates_data = None
    else:
        print(f"\n✅ Rates extracted successfully!")
        print(f"   Capital Value: ${rates_result['data'].get('capital_value', 0):,}")
        print(f"   Land Value: ${rates_result['data'].get('land_value', 0):,}")
        print(f"   Annual Rates: ${rates_result['data'].get('annual_rates', 0):,.2f}")
        rates_data = rates_result
    
    # Step 2: Generate report
    print("\n" + "="*80)
    print("STEP 2: GENERATE REPORT")
    print("="*80)
    
    # Build minimal property data structure (need title_no or it generates "no result" report)
    result_data = {
        'address': {
            'full_address': address,
            'latitude': latitude,
            'longitude': longitude
        },
        'title': {
            'title_no': address,  # Use actual address as identifier
            'status': 'Live',
            'type': 'Freehold'
        },
        'buildings': {}
    }
    
    # Generate timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_address = address.replace(' ', '_').replace(',', '')[:30]
    
    # Ensure reports directory exists
    reports_dir = Path(__file__).parent / 'reports'
    reports_dir.mkdir(parents=True, exist_ok=True)
    
    output_path = reports_dir / f'test_{safe_address}_{timestamp}.html'
    
    print(f"\nGenerating report...")
    print(f"  Include Rates: {'Yes ✓' if rates_data else 'No'}")
    print(f"  Output: {output_path.name}")
    
    html, saved_path = generate_enhanced_report(
        result_data,
        hazards_data=None,
        easements_data=None,
        rates_data=rates_data,
        output_path=str(output_path)
    )
    
    if saved_path:
        print(f"\n✅ REPORT GENERATED SUCCESSFULLY!")
        print(f"   File: {saved_path}")
        
        # Open in browser
        print(f"\nOpening report in browser...")
        import subprocess
        subprocess.run(['start', saved_path], shell=True)
        
        print("\n" + "="*80)
        print("TEST COMPLETE!")
        print("="*80)
        print(f"\nThe report is now open in your browser.")
        print(f"Review the rates section to verify the data looks correct.")
        print(f"Map should show: {latitude:.6f}, {longitude:.6f}")
        print("\nTo test another property, run the script again:")
        print(f"  python quick_test_report.py \"Address Here\"")
        
    else:
        print(f"\n❌ Failed to generate report")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[CANCELLED]")
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
