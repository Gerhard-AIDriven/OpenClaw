#!/usr/bin/env python3
"""Test LINZ Linear Parcels - get full feature details"""

import requests
import json
from pathlib import Path

API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

api_key = API_KEY_FILE.read_text().strip()
base_url = BASE_WFS_URL.format(api_key)

print("Fetching sample Linear Parcel feature...\n")

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51570',
    'outputFormat': 'application/json',
    'count': 1
}

response = requests.get(base_url, params=params, timeout=30)

if response.status_code == 200:
    data = response.json()
    if data.get('features'):
        feature = data['features'][0]
        print("Full feature structure:")
        print(json.dumps(feature, indent=2))
else:
    print(f"Error: {response.status_code}")
    print(response.text[:500])
