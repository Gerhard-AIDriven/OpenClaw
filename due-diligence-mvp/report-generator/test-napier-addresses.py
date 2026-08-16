"""Test querying addresses in Napier to find correct road name format"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 70)
print("NAPIER ADDRESS DISCOVERY")
print("=" * 70)

# Get addresses in Napier by filtering on town_city
print("\n[TEST] Get addresses in NAPIER town/city...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-123113',
    'outputFormat': 'application/json',
    'cql_filter': "town_city='Napier'",
    'count': 20
}

try:
    response = requests.get(BASE_URL, params=params, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        features = data.get('features', [])
        print(f"[OK] Found {len(features)} addresses in Napier")
        
        # Look for Douglas McLean Avenue specifically
        douglas_addresses = [f for f in features if 'DOUGLAS' in str(f['properties'].get('full_road_name', '')).upper()]
        
        if douglas_addresses:
            print(f"\n[FOUND] {len(douglas_addresses)} addresses on DOUGLAS roads:")
            for feat in douglas_addresses[:10]:
                props = feat['properties']
                print(f"   - {props['full_address']}")
                print(f"     road_name='{props['road_name']}', full_road_name='{props['full_road_name']}'")
                print(f"     suburb='{props['suburb_locality']}', town='{props['town_city']}'")
                if feat.get('geometry', {}).get('type') == 'Point':
                    lon, lat = feat['geometry']['coordinates']
                    print(f"     Coords: {lon}, {lat}")
        else:
            print("\n[WARN] No Douglas McLean Avenue found. Showing sample Napier addresses:")
            for i, feat in enumerate(features[:5], 1):
                props = feat['properties']
                print(f"   {i}. {props['full_address']}")
                print(f"      road_name='{props['road_name']}', full_road_name='{props['full_road_name']}'")
                print(f"      suburb='{props['suburb_locality']}'")
    else:
        print(f"[ERROR] {response.text[:300]}")
except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
