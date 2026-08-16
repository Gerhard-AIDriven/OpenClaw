"""Search all of NZ for Douglas McLean Avenue"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 70)
print("SEARCH: DOUGLAS MCLEAN AVENUE (ALL NZ)")
print("=" * 70)

# Search by full_road_name only, no suburb filter
print("\n[SEARCH] Looking for 'DOUGLAS MCLEAN' in road names nationwide...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-123113',
    'outputFormat': 'application/json',
    'cql_filter': "full_road_name LIKE '%DOUGLAS%'",
    'count': 100
}

try:
    response = requests.get(BASE_URL, params=params, timeout=60)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        features = data.get('features', [])
        print(f"[OK] Found {len(features)} addresses with 'DOUGLAS' in road name")
        
        # Filter for McLean
        mclean_addresses = [f for f in features if 'MCLEAN' in str(f['properties'].get('full_road_name', '')).upper()]
        
        if mclean_addresses:
            print(f"\n[SUCCESS] Found {len(mclean_addresses)} addresses on Douglas McLean Avenue:")
            for feat in mclean_addresses:
                props = feat['properties']
                print(f"   - {props['full_address']}")
                if feat.get('geometry', {}).get('type') == 'Point':
                    lon, lat = feat['geometry']['coordinates']
                    print(f"     Coords: {lon}, {lat}")
                    
                    # Test title lookup
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
                            print(f"     [TITLES] Found {len(title_features)} active title(s):")
                            for tf in title_features:
                                tprops = tf['properties']
                                tr = tprops.get('title_reference', 'N/A')
                                tt = tprops.get('title_type', 'N/A')
                                print(f"       * {tr} ({tt})")
                        else:
                            print(f"     [WARN] No titles found")
        else:
            print("\n[FAIL] No Douglas McLean Avenue found anywhere in NZ")
            
            # Show what Douglas roads exist
            douglas_roads = set()
            for feat in features[:20]:
                douglas_roads.add(feat['properties']['full_road_name'])
            print(f"Douglas roads that DO exist: {list(douglas_roads)[:10]}")
    else:
        print(f"[ERROR] {response.text[:300]}")
except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "=" * 70)
print("SEARCH COMPLETE")
print("=" * 70)
