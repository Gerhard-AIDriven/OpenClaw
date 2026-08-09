#!/usr/bin/env python3
"""Generate report from latest rates JSON"""

import json
from pathlib import Path
from report_generator_enhanced import generate_enhanced_report
from datetime import datetime

# Find latest rates file
rates_files = list(Path('.').glob('**/napier_*_rates.json'))
if not rates_files:
    print("❌ No rates files found")
    exit(1)

latest_rates = max(rates_files, key=lambda p: p.stat().st_mtime)
print(f"Using: {latest_rates}")

# Load rates
with open(latest_rates, 'r', encoding='utf-8') as f:
    rates_data = json.load(f)

print(f"Success: {rates_data.get('success')}")
print(f"Capital Value: ${rates_data['data'].get('capital_value', 0):,}")

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
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
output_path = Path('reports') / f'test_manual_{timestamp}.html'

print(f"\nGenerating report: {output_path}")

html, saved_path = generate_enhanced_report(
    result_data,
    hazards_data=None,
    easements_data=None,
    rates_data=rates_data,
    output_path=str(output_path)
)

if saved_path:
    print(f"\n✅ SUCCESS! Report generated: {saved_path}")
    print("\nOpening in browser...")
    import subprocess
    subprocess.run(['start', saved_path], shell=True)
else:
    print(f"\n❌ FAILED to generate report")
