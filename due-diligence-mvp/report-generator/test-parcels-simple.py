"""Get sample parcel records to see available fields"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 60)
print("NZ PARCELS - GET SAMPLE (no spatial filter)")
print("=" * 60)

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51571',
    'outputFormat': 'application/json',
    'count': 1
}

response = requests.get(BASE_URL, params=params, timeout=30)
print(f"\nStatus: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    
    if features:
        print(f"[OK] Parcel layer accessible")
        props = features[0]['properties']
        print(f"\nFields ({len(props)} total):")
        for key in sorted(props.keys()):
            val = str(props[key])[:60]
            print(f"   - {key}: {val}")
    else:
        print("[WARN] No parcels returned")
else:
    print(f"[ERROR] {response.text[:300]}")

print("\n" + "=" * 60)

# Also try NZ Primary Land Parcels (layer-50823)
print("\nTrying NZ PRIMARY LAND PARCELS (layer-50823)...")
params['typeNames'] = 'data.linz.govt.nz:layer-50823'
response = requests.get(BASE_URL, params=params, timeout=30)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    if data.get('features'):
        props = data['features'][0]['properties']
        print(f"[OK] Found fields:")
        for key in sorted(props.keys())[:10]:
            print(f"   - {key}: {str(props[key])[:50]}")
else:
    print(f"[ERROR] {response.text[:200]}")

print("\n" + "=" * 60)
