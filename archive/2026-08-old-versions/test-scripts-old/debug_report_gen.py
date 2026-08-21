#!/usr/bin/env python3
"""Debug report generation"""

import json
from pathlib import Path
from report_generator_enhanced import generate_enhanced_report
import traceback

# Load rates
rates_file = Path('due-diligence-mvp/napier_20260808_200055_rates.json')
print(f"Loading: {rates_file}")

with open(rates_file, 'r', encoding='utf-8') as f:
    rates_data = json.load(f)

print(f"✓ Rates loaded: success={rates_data.get('success')}")
print(f"  Data keys: {list(rates_data.get('data', {}).keys())}")

# Build property data
result_data = {
    'address': {
        'full_address': '18 Ferguson Avenue, Napier',
        'latitude': -39.5006,
        'longitude': 176.9041
    },
    'title': {},
    'buildings': {}
}

# Generate report
output_path = 'reports/test_debug.html'
Path('reports').mkdir(exist_ok=True)

print(f"\nGenerating report to: {output_path}")

try:
    html, saved_path = generate_enhanced_report(
        result_data,
        hazards_data=None,
        easements_data=None,
        rates_data=rates_data,
        output_path=output_path
    )
    
    if saved_path:
        print(f"\n✅ SUCCESS! Report saved: {saved_path}")
        print(f"   HTML length: {len(html)} chars")
        
        # Open in browser
        print("\nOpening in browser...")
        import subprocess
        subprocess.run(['start', saved_path], shell=True)
    else:
        print(f"\n❌ FAILED: saved_path is None")
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    traceback.print_exc()
