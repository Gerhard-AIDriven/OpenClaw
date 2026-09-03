"""Test different query approaches for buildings"""

import requests
import sys
sys.stdout.reconfigure(encoding='utf-8')

api_key = open('report-generator/Config/linz-api-key.txt').read().strip()
url = f'https://data.linz.govt.nz/services;key={api_key}/wfs'

print("Testing building queries for Napier area...")
print("=" * 60)

# Test 1: Get all buildings in Hawke's Bay using suburb filter
print("\n[Test 1] Filter by suburb_locality = 'Napier'")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50246',
    'outputFormat': 'application/json',
    'cql_filter': "suburb_locality = 'Napier'",
    'count': 5
}

response = requests.get(url, params=params, timeout=30)
if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    print(f"✅ Success! Found {len(features)} buildings")
    if features:
        props = features[0]['properties']
        print(f"Sample: {props.get('name', 'Unnamed')} in {props.get('suburb_locality', 'Unknown')}")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text[:200])

# Test 2: Try Marewa specifically
print("\n[Test 2] Filter by suburb_locality = 'Marewa'")
params['cql_filter'] = "suburb_locality = 'Marewa'"
response = requests.get(url, params=params, timeout=30)
if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    print(f"✅ Success! Found {len(features)} buildings in Marewa")
    if features:
        import json
        print("\nFirst building properties:")
        print(json.dumps(features[0]['properties'], indent=2))
else:
    print(f"❌ Error: {response.status_code}")
