#!/usr/bin/env python3
"""Check if title layer has survey references we can use"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
import json
from pathlib import Path

API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

api_key = API_KEY_FILE.read_text().strip()
base_url = BASE_WFS_URL.format(api_key)

title_no = "HBE2/765"  # Marewa property - might have easements
print(f"Checking title {title_no} for survey references...")

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50804',
    'outputFormat': 'application/json',
    'cql_filter': f"title_no='{title_no}'"
}

response = requests.get(base_url, params=params, timeout=30)
if response.status_code != 200:
    print(f"❌ Failed: {response.status_code}")
    exit(1)

data = response.json()
features = data.get('features', [])

if features:
    props = features[0]['properties']
    print("\nTitle properties:")
    for key in sorted(props.keys()):
        value = props[key]
        value_str = str(value)[:100] if value else "null"
        print(f"  {key:30} : {value_str}")
    
    # Check estate_description for DP references
    estate = props.get('estate_description', '')
    if estate:
        print(f"\nEstate description: {estate}")
        import re
        dp_numbers = re.findall(r'Deposited Plan (\d+)', estate)
        if dp_numbers:
            print(f"✅ Found DP reference(s): {dp_numbers}")
        
        # Now search Linear Parcels for easements with these DP numbers
        for dp in dp_numbers:
            print(f"\nSearching for easements affecting DP {dp}...")
            params_eas = {
                'service': 'WFS',
                'version': '2.0.0',
                'request': 'GetFeature',
                'typeNames': 'data.linz.govt.nz:layer-51570',
                'outputFormat': 'application/json',
                'cql_filter': f"affected_surveys LIKE '%DP {dp}%'"
            }
            
            response_e = requests.get(base_url, params=params_eas, timeout=30)
            if response_e.status_code == 200:
                eas_data = response_e.json()
                easements = eas_data.get('features', [])
                if easements:
                    print(f"✅ Found {len(easements)} easement(s)!")
                    for eas in easements:
                        eas_props = eas['properties']
                        print(f"  - {eas_props.get('appellation')} ({eas_props.get('parcel_intent')})")
                    
                    # Save results
                    output_file = Path(__file__).parent / 'easements-via-dp.json'
                    result = {
                        'title_no': title_no,
                        'dp_numbers': dp_numbers,
                        'easements_count': len(easements),
                        'easements': [e['properties'] for e in easements]
                    }
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(result, f, indent=2)
                    print(f"\n💾 Saved to: {output_file.name}")
                    break
                else:
                    print(f"  ℹ️  No easements found for DP {dp}")
            else:
                print(f"  ❌ Query failed: {response_e.status_code}")
else:
    print("No title found")
