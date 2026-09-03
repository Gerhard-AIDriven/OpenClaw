"""Simple test to query NZ Addresses without complex filters"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 70)
print("SIMPLE ADDRESS QUERY TEST")
print("=" * 70)

# Test 1: Get just 1 feature from NZ Addresses with NO filter
print("\n[TEST 1] Get 1 address record without any filter...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-123113',
    'outputFormat': 'application/json',
    'count': 1
}

try:
    response = requests.get(BASE_URL, params=params, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data.get('features'):
            props = data['features'][0]['properties']
            print(f"[OK] Got 1 address. Available fields:")
            for key in sorted(props.keys()):
                val = str(props[key])[:60]
                print(f"   - {key}: {val}")
        else:
            print("[WARN] No features returned")
    else:
        print(f"[ERROR] {response.text[:300]}")
except Exception as e:
    print(f"[ERROR] {e}")

# Test 2: Try filtering by road_name only (simplest possible filter)
print("\n" + "=" * 70)
print("[TEST 2] Filter by road_name only...")
params['cql_filter'] = "road_name='DOUGLAS MCLEAN AVENUE'"
params['count'] = 5

try:
    response = requests.get(BASE_URL, params=params, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        features = data.get('features', [])
        print(f"[OK] Found {len(features)} addresses on DOUGLAS MCLEAN AVENUE")
        for i, feat in enumerate(features[:3], 1):
            props = feat.get('properties', {})
            addr_num = props.get('address_number', '')
            road = props.get('road_name', '')
            suburb = props.get('suburb', '')
            print(f"   {i}. {addr_num} {road}, {suburb}")
            if feat.get('geometry', {}).get('type') == 'Point':
                lon, lat = feat['geometry']['coordinates']
                print(f"      Coords: {lon}, {lat}")
    else:
        print(f"[ERROR] {response.text[:300]}")
except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
