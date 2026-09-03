"""Test what's actually in the liquefaction layer"""

import requests
import sys
sys.stdout.reconfigure(encoding='utf-8')

api_key = open('report-generator/Config/linz-api-key.txt').read().strip()
url = f'https://data.linz.govt.nz/services;key={api_key}/wfs'

print("Testing LINZ Liquefaction Layer 51893...")
print("=" * 60)

# Test 1: Get first 10 features (no filter)
print("\n[Test 1] First 10 features in layer")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51893',
    'outputFormat': 'application/json',
    'count': 10
}

response = requests.get(url, params=params, timeout=30)

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    print(f"Got {len(features)} features")
    
    if features:
        props = features[0]['properties']
        print("\nFirst feature properties:")
        import json
        print(json.dumps(props, indent=2))
        
        # Check what fields are available
        print("\nAvailable fields:")
        for key in props.keys():
            print(f"  - {key}")
else:
    print(f"Error: {response.status_code}")
    print(response.text[:500])

# Test 2: Try Napier area with bbox
print("\n\n[Test 2] Query Napier area with bbox")
# Napier approx coords: -39.49, 176.91
bbox = '-39.52,176.88,-39.46,176.94,EPSG:4326'

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51893',
    'outputFormat': 'application/json',
    'bbox': bbox
}

response = requests.get(url, params=params, timeout=30)
if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    print(f"Found {len(features)} liquefaction zones in Napier area")
    
    if features:
        print(f"\nFirst zone properties:")
        print(json.dumps(features[0]['properties'], indent=2))
else:
    print(f"Error: {response.status_code}")
