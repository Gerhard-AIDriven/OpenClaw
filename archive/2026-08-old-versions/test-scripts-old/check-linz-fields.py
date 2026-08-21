#!/usr/bin/env python3
"""Check if Linear Parcels has par_id field or needs different join"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
import json
from pathlib import Path

API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

api_key = API_KEY_FILE.read_text().strip()
base_url = BASE_WFS_URL.format(api_key)

print("Checking Linear Parcels layer fields...")

# Get a larger sample to see all possible fields
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51570',
    'outputFormat': 'application/json',
    'count': 10
}

response = requests.get(base_url, params=params, timeout=30)
if response.status_code != 200:
    print(f"❌ Failed: {response.status_code}")
    exit(1)

data = response.json()
features = data.get('features', [])

print(f"Retrieved {len(features)} features\n")

# Collect all unique field names
all_fields = set()
for feature in features:
    props = feature['properties']
    all_fields.update(props.keys())

print("All available fields in Linear Parcels layer:")
print("-"*60)
for field in sorted(all_fields):
    # Show sample value from first feature that has it
    sample_value = None
    for f in features:
        val = f['properties'].get(field)
        if val is not None:
            sample_value = str(val)[:40]
            break
    print(f"  {field:30} : {sample_value or 'null'}")

# Check if any field could be used to join with parcel table
print("\n" + "="*60)
print("Looking for potential join fields...")
potential_joins = ['par_id', 'parcel_id', 'id', 'appellation', 'affected_surveys']
for field in potential_joins:
    if field in all_fields:
        print(f"✅ '{field}' exists - could be used for joining!")
    else:
        print(f"❌ '{field}' not found")
