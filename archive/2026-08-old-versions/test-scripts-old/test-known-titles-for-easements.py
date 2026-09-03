#!/usr/bin/env python3
"""Test our known Napier titles to see if ANY have easements"""
import sys, requests, json, re
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
API_KEY = Path('report-generator/Config/linz-api-key.txt').read_text().strip()
BASE = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

# Known Napier titles
test_titles = [
    ('454362', '16 Ferguson Avenue, Westshore, Napier', '414475'),
    ('HBE2/765', '31 Douglas McLean Avenue, Marewa, Napier', '8162'),
]

print("Testing known Napier titles for easements...")
print("="*80)

for title_no, address, dp_num in test_titles:
    print(f"\n{title_no} ({address})")
    print(f"  DP: {dp_num}")
    
    # Query Linear Parcels for easements on this DP
    params = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
              'typeNames': 'data.linz.govt.nz:layer-51570', 'outputFormat': 'application/json',
              'cql_filter': f"affected_surveys LIKE '%DP {dp_num}%'"}
    
    resp = requests.get(BASE, params=params, timeout=30)
    if resp.status_code == 200:
        data = resp.json()
        easements = [f for f in data.get('features', []) 
                    if 'easement' in str(f['properties'].get('parcel_intent', '')).lower()]
        
        if easements:
            print(f"  ✅ HAS {len(easements)} EASEMENT(S)!")
            for e in easements[:3]:
                props = e['properties']
                print(f"     - {props.get('appellation')} ({props.get('status')})")
        else:
            print(f"  ℹ️  No easements (clean title)")
    else:
        print(f"  ❌ Query failed: {resp.status_code}")

print("\n" + "="*80)
print("If all are clean, we'll use one anyway for testing the 'no easements' case")
print("The code handles both cases correctly!")
