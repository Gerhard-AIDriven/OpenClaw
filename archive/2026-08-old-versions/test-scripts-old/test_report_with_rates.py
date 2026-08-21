#!/usr/bin/env python3
"""
Test: Generate report with extracted rates data
"""

import json
from pathlib import Path
from report_generator_enhanced import generate_enhanced_report

# Load the rates data we extracted earlier
rates_file = Path('due-diligence-mvp/napier_20260808_192609_rates.json')

if not rates_file.exists():
    print(f"❌ Rates file not found: {rates_file}")
    exit(1)

with open(rates_file, 'r', encoding='utf-8') as f:
    rates_data = json.load(f)

print("Loaded rates data:")
print(f"  Capital Value: ${rates_data['data']['capital_value']:,}")
print(f"  Land Value: ${rates_data['data']['land_value']:,}")
print(f"  Annual Rates: ${rates_data['data']['annual_rates']:,.2f}")

# Test property data
test_property = {
    'address': {
        'full_address': '18 Ferguson Avenue, Napier',
        'latitude': -39.5006,
        'longitude': 176.9041
    },
    'title': {
        'title_no': 'HBE2/123',
        'status': 'Live',
        'type': 'Freehold'
    },
    'buildings': {}
}

# Generate report
output_path = 'reports/test_report_with_rates.html'

html, saved_path = generate_enhanced_report(
    test_property,
    hazards_data=None,
    easements_data=None,
    rates_data=rates_data,
    output_path=output_path
)

if saved_path:
    print(f"\n✅ Report generated: {saved_path}")
    print("\nOpening in browser...")
    import subprocess
    subprocess.run(['start', saved_path], shell=True)
else:
    print("\n❌ Failed to generate report")
