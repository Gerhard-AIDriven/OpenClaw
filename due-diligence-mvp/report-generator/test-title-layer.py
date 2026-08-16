"""Test if title layer has data and what fields it contains"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 60)
print("TITLE LAYER TEST")
print("=" * 60)

# Get 1 title record without spatial filter
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50566',
    'outputFormat': 'application/json',
    'count': 1
}

response = requests.get(BASE_URL, params=params, timeout=30)
print(f"\nStatus: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    
    if features:
        print(f"[OK] Title layer is accessible")
        props = features[0]['properties']
        print(f"\nAvailable fields ({len(props)} total):")
        for key in sorted(props.keys())[:15]:
            val = str(props[key])[:50]
            print(f"   - {key}: {val}")
        
        # Check if there's a shape/geometry field
        geom = features[0].get('geometry', {})
        print(f"\nGeometry type: {geom.get('type', 'None')}")
        
    else:
        print("[WARN] No titles returned (empty layer?)")
else:
    print(f"[ERROR] {response.text[:300]}")

print("\n" + "=" * 60)
