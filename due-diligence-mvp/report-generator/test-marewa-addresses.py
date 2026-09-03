"""Test querying addresses in Marewa suburb to find Douglas McLean Avenue"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 70)
print("MAREWA ADDRESS DISCOVERY")
print("=" * 70)

# Get addresses in Marewa suburb
print("\n[TEST] Get addresses in MAREWA suburb...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-123113',
    'outputFormat': 'application/json',
    'cql_filter': "suburb_locality='Marewa'",
    'count': 50
}

try:
    response = requests.get(BASE_URL, params=params, timeout=30)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        features = data.get('features', [])
        print(f"[OK] Found {len(features)} addresses in Marewa")
        
        # Look for Douglas McLean Avenue
        douglas_addresses = [f for f in features if 'DOUGLAS' in str(f['properties'].get('full_road_name', '')).upper()]
        
        if douglas_addresses:
            print(f"\n[SUCCESS] Found {len(douglas_addresses)} addresses on DOUGLAS roads:")
            for feat in douglas_addresses:
                props = feat['properties']
                print(f"   - {props['full_address']}")
                if feat.get('geometry', {}).get('type') == 'Point':
                    lon, lat = feat['geometry']['coordinates']
                    print(f"     Coords: {lon}, {lat}")
                    
                    # Now test property title lookup with these coords!
                    print(f"\n   [TESTING TITLE LOOKUP...]")
                    title_params = {
                        'service': 'WFS',
                        'version': '2.0.0',
                        'request': 'GetFeature',
                        'typeNames': 'data.linz.govt.nz:layer-50566',
                        'outputFormat': 'application/json',
                        'cql_filter': f"INTERSECTS(shape, POINT({lon} {lat}))"
                    }
                    title_response = requests.get(BASE_URL, params=title_params, timeout=30)
                    if title_response.status_code == 200:
                        title_data = title_response.json()
                        title_features = title_data.get('features', [])
                        if title_features:
                            print(f"     [OK] Found {len(title_features)} title(s)")
                            for tf in title_features[:3]:
                                tprops = tf['properties']
                                print(f"       Title: {tprops.get('title_reference', 'N/A')}")
                                print(f"       Type: {tprops.get('title_type', 'N/A')}")
                                print(f"       Owners: {tprops.get('number_of_owners', 'N/A')}")
                        else:
                            print(f"     [WARN] No titles found at this location")
                    else:
                        print(f"     [ERROR] Title query failed: {title_response.status_code}")
        else:
            print("\n[WARN] No Douglas McLean Avenue found in Marewa")
            # Show what roads ARE in Marewa
            roads = set()
            for feat in features[:20]:
                roads.add(feat['properties']['full_road_name'])
            print(f"Sample roads in Marewa: {list(roads)[:10]}")
    else:
        print(f"[ERROR] {response.text[:300]}")
except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
