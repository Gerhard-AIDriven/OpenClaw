#!/usr/bin/env python3
"""
Inspect what's actually in the LINZ liquefaction layer
"""

import requests
import json
from pathlib import Path

API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'

with open(API_KEY_FILE, 'r') as f:
    api_key = f.read().strip()

# Query the susceptibility layer (more detailed - 107k features)
base_url = "https://data.linz.govt.nz/services;key={}/wfs".format(api_key)

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50784',
    'outputFormat': 'application/json',
    'maxFeatures': 5
}

print("Fetching sample from LINZ Liquefaction Susceptibility layer (50784)...\n")

response = requests.get(base_url, params=params, timeout=30)

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    
    print(f"Retrieved {len(features)} features\n")
    
    for i, feature in enumerate(features, 1):
        props = feature.get('properties', {})
        geom = feature.get('geometry', {})
        
        print(f"Feature {i}:")
        print(f"  Properties: {json.dumps(props, indent=2)[:500]}")
        print(f"  Geometry type: {geom.get('type', 'N/A')}")
        if geom.get('coordinates'):
            coords = geom['coordinates']
            if isinstance(coords[0], (int, float)):
                print(f"  Location: {coords[1]}, {coords[0]}")  # lat, lon
        print()

else:
    print(f"Error: {response.status_code}")
    print(response.text[:500])
