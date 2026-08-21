#!/usr/bin/env python3
"""
Complete Report Generator with Rates Integration

Workflow:
1. Run Napier assisted scraper (you search manually)
2. Wait for you to complete search
3. Extract rates data from JSON
4. Generate full enhanced report with rates included

Usage:
    python generate_report_with_rates.py "18 Ferguson Avenue"
"""

import json
import sys
import time
from pathlib import Path
from datetime import datetime

# Import our modules
from napier_assisted_final import scrape_assisted
from report_generator_enhanced import generate_enhanced_report

sys.stdout.reconfigure(encoding='utf-8')


def load_latest_rates_json():
    """Find and load the most recent rates JSON file"""
    workspace = Path(__file__).parent
    
    # Look for napier_*_rates.json files
    rates_files = list(workspace.glob('napier_*_rates.json'))
    
    if not rates_files:
        print("⚠️  No rates JSON files found")
        return None
    
    # Get most recent file
    latest = max(rates_files, key=lambda p: p.stat().st_mtime)
    
    print(f"\n[OK] Found rates file: {latest.name}")
    
    with open(latest, 'r', encoding='utf-8') as f:
        return json.load(f)


def generate_complete_report(address, property_data=None, hazards_data=None, easements_data=None, rates_data=None):
    """
    Generate complete Tier 1 Enhanced report with all data including rates
    
    Args:
        address: Full address string
        property_data: Title/property info from LINZ
        hazards_data: Hazard assessment data
        easements_data: Easements data
        rates_data: Rates data from Napier Council scraper
    """
    
    print("\n" + "="*80)
    print("GENERATING TIER 1 ENHANCED REPORT")
    print("="*80)
    
    # Build result data structure
    result_data = {
        'address': {
            'full_address': address,
            'latitude': -39.5006,  # Default to Napier
            'longitude': 176.9041
        },
        'title': property_data or {},
        'buildings': {}
    }
    
    # Generate report
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    safe_address = address.replace(' ', '_').replace(',', '')[:30]
    output_path = Path(__file__).parent / 'reports' / f'report_{safe_address}_{timestamp}.html'
    
    print(f"\nGenerating report...")
    print(f"  Address: {address}")
    print(f"  Include Rates: {'Yes ✓' if rates_data else 'No'}")
    print(f"  Include Hazards: {'Yes ✓' if hazards_data else 'No'}")
    print(f"  Include Easements: {'Yes ✓' if easements_data else 'No'}")
    
    html, saved_path = generate_enhanced_report(
        result_data,
        hazards_data=hazards_data,
        easements_data=easements_data,
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
        
        return saved_path
    else:
        print(f"\n❌ Failed to generate report")
        return None


def main():
    """Main workflow"""
    print("="*80)
    print("TIER 1 ENHANCED PROPERTY REPORT GENERATOR")
    print("With Napier Council Rates Integration")
    print("="*80)
    
    # Get address from command line or prompt
    if len(sys.argv) > 1:
        address = ' '.join(sys.argv[1:])
    else:
        address = input("\nEnter property address: ").strip()
    
    if not address:
        print("❌ No address provided")
        return
    
    print(f"\n📍 Property: {address}")
    
    # Step 1: Get rates data
    print("\n" + "="*80)
    print("STEP 1: EXTRACT RATES DATA")
    print("="*80)
    print("\nThis will open a browser for you to search the property.")
    print("After you complete the search, the script will extract rates data automatically.\n")
    
    response = input("Ready to extract rates? (y/n): ").strip().lower()
    
    if response != 'y':
        print("Skipping rates extraction")
        rates_data = None
    else:
        # Run the scraper
        rates_result = scrape_assisted()
        
        if rates_result and rates_result.get('success'):
            print(f"\n✅ Rates extracted successfully!")
            print(f"   Capital Value: ${rates_result['data'].get('capital_value', 0):,}")
            print(f"   Land Value: ${rates_result['data'].get('land_value', 0):,}")
            print(f"   Annual Rates: ${rates_result['data'].get('annual_rates', 0):,.2f}")
            rates_data = rates_result
        else:
            print(f"\n⚠️  Rates extraction failed - continuing without rates")
            rates_data = None
    
    # Step 2: Generate report
    print("\n" + "="*80)
    print("STEP 2: GENERATE REPORT")
    print("="*80)
    
    # For now, generate with just rates (can add property/hazards later)
    generate_complete_report(
        address=address,
        property_data={},  # Would come from LINZ scraper
        hazards_data=None,  # Would come from hazard checker
        easements_data=None,  # Would come from easements checker
        rates_data=rates_data
    )
    
    print("\n" + "="*80)
    print("DONE!")
    print("="*80)
    print("\nTo generate another report, run the script again:")
    print("  python generate_report_with_rates.py\n")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[CANCELLED]")
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
