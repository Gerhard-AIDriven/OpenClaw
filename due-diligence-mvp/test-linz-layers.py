#!/usr/bin/env python3
"""Test LINZ Linear Parcels layer for easements"""

import requests
import json
from pathlib import Path

API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

api_key = API_KEY_FILE.read_text().strip()
base_url = BASE_WFS_URL.format(api_key)

print(f"Testing LINZ Linear Parcels layer (51570)...")
print(f"API Key: {api_key[:8]}...{api_key[-4:]}")

# Test without filter first
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51570',
    'outputFormat': 'application/json',
    'count': 1
}

print(f"\nRequest: {base_url}")
print(f"Params: {params}")

response = requests.get(base_url, params=params, timeout=30)
print(f"\nResponse Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    print(f"Features returned: {len(features)}")
    
    if features:
        props = features[0]['properties']
        print(f"\nAvailable fields in Linear Parcels:")
        for key in sorted(props.keys()):
            print(f"  - {key}: {type(props[key]).__name__}")
else:
    print(f"Error response:\n{response.text[:500]}")
