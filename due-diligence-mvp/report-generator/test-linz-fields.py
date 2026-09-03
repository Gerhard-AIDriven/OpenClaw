"""Test script to discover LINZ API field names and correct query syntax"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 70)
print("LINZ API FIELD DISCOVERY TEST")
print("=" * 70)

# Test 1: Get feature type description for Addresses layer
print("\n[TEST 1] Getting feature type description for Addresses layer (layer-105688)...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'DescribeFeatureType',
    'typeNames': 'layer-105688'
}

try:
    response = requests.get(BASE_URL, params=params, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        # Save to file for review
        with open('linz-addresses-schema.txt', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print("[OK] Schema saved to linz-addresses-schema.txt")
        print("\nFirst 2000 chars of schema:")
        print(response.text[:2000])
    else:
        print(f"[ERROR] {response.text[:500]}")
except Exception as e:
    print(f"[ERROR] {e}")

# Test 2: Try a very simple query - just get 1 feature without filters
print("\n" + "=" * 70)
print("[TEST 2] Simple query - get 1 address without filters...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'layer-105688',
    'outputFormat': 'application/json',
    'count': 1
}

try:
    response = requests.get(BASE_URL, params=params, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        if data.get('features'):
            feature = data['features'][0]
            properties = feature.get('properties', {})
            print(f"[OK] Got 1 feature. Available fields:")
            for key in sorted(properties.keys()):
                print(f"   - {key}: {properties[key]}")
        else:
            print("[WARN] No features returned")
    else:
        print(f"[ERROR] {response.text[:500]}")
except Exception as e:
    print(f"[ERROR] {e}")

# Test 3: Try querying with just road_name (simpler filter)
print("\n" + "=" * 70)
print("[TEST 3] Query with simple road_name filter...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'layer-105688',
    'outputFormat': 'application/json',
    'cql_filter': "road_name='DOUGLAS MCLEAN AVENUE'",
    'count': 5
}

try:
    response = requests.get(BASE_URL, params=params, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        features = data.get('features', [])
        print(f"[OK] Found {len(features)} addresses on DOUGLAS MCLEAN AVENUE")
        for i, feat in enumerate(features[:3], 1):
            props = feat.get('properties', {})
            print(f"\n   Address {i}:")
            print(f"      Full: {props.get('address_number', '')} {props.get('road_name', '')}, {props.get('suburb', '')}")
            if feat.get('geometry', {}).get('type') == 'Point':
                lon, lat = feat['geometry']['coordinates']
                print(f"      Coords: {lon}, {lat}")
    else:
        print(f"[ERROR] {response.text[:500]}")
except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
