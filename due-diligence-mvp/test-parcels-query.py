#!/usr/bin/env python3
"""Find correct way to query NZ Parcels layer"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
import json
from pathlib import Path

API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

api_key = API_KEY_FILE.read_text().strip()
base_url = BASE_WFS_URL.format(api_key)

print("Testing NZ Parcels layer (51571) query options...")
print("="*80)

# Get sample to see field names
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51571',
    'outputFormat': 'application/json',
    'count': 3
}

response = requests.get(base_url, params=params, timeout=30)
if response.status_code != 200:
    print(f"❌ Failed: {response.status_code}")
    exit(1)

data = response.json()
features = data.get('features', [])

print(f"Retrieved {len(features)} sample features\n")

# Show all fields from first feature
if features:
    props = features[0]['properties']
    print("Available fields in NZ Parcels layer:")
    print("-"*60)
    for key in sorted(props.keys()):
        value = props[key]
        value_str = str(value)[:50] if value else "null"
        print(f"  {key:30} : {value_str}")
    
    # Try querying by 'id' instead of 'par_id'
    sample_id = props.get('id')
    if sample_id:
        print(f"\nTrying to query by id={sample_id}...")
        params2 = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': 'data.linz.govt.nz:layer-51571',
            'outputFormat': 'application/json',
            'cql_filter': f"id={sample_id}"
        }
        
        response2 = requests.get(base_url, params=params2, timeout=30)
        if response2.status_code == 200:
            data2 = response2.json()
            feats2 = data2.get('features', [])
            print(f"✅ Query by 'id' worked! Found {len(feats2)} feature(s)")
        else:
            print(f"❌ Query by 'id' failed: {response2.status_code}")
