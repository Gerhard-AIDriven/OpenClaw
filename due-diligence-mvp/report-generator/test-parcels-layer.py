"""Test NZ Parcels layer for property/title data"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 60)
print("NZ PARCELS LAYER TEST (layer-51571)")
print("=" * 60)

# Get 1 parcel at Squire Drive coordinates
lon, lat = 176.913281, -39.5283420387  # From our earlier test

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51571',
    'outputFormat': 'application/json',
    'cql_filter': f"INTERSECTS(shape, POINT({lon} {lat}))"
}

response = requests.get(BASE_URL, params=params, timeout=30)
print(f"\nStatus: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    
    if features:
        print(f"[OK] Found {len(features)} parcel(s) at test location")
        props = features[0]['properties']
        print(f"\nAvailable fields ({len(props)} total):")
        for key in sorted(props.keys()):
            val = str(props[key])[:60]
            print(f"   - {key}: {val}")
        
        geom = features[0].get('geometry', {})
        print(f"\nGeometry type: {geom.get('type', 'None')}")
        
    else:
        print("[WARN] No parcels found at test coords")
else:
    print(f"[ERROR] {response.text[:300]}")

print("\n" + "=" * 60)
