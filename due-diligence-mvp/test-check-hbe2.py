import requests
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = open('report-generator/Config/linz-api-key.txt', 'r').read().strip()
BASE_WFS_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("Checking if HBE2/765 is in the Hawkes Bay results...\n")

# Get 200 HB titles
params = {
    'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50804',
    'outputFormat': 'application/json',
    'cql_filter': "land_district = 'Hawkes Bay'",
    'count': 200
}

response = requests.get(BASE_WFS_URL, params=params, timeout=30)
data = response.json()
features = data.get('features', [])

# Check for HBE2/765
hbe2_765 = None
for f in features:
    props = f.get('properties', {})
    if props.get('title_no') == 'HBE2/765':
        hbe2_765 = f
        break

if hbe2_765:
    print("✓ HBE2/765 IS in the results!")
    
    # Check its bbox
    geom = hbe2_765.get('geometry', {})
    if geom.get('type') == 'MultiPolygon':
        coords = geom['coordinates'][0][0]
    else:
        coords = geom['coordinates'][0]
    
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    
    print(f"\nHBE2/765 BBOX:")
    print(f"  Lon: {min(lons):.6f} to {max(lons):.6f}")
    print(f"  Lat: {min(lats):.6f} to {max(lats):.6f}")
    
    # Our target
    TARGET_LON = 176.904059
    TARGET_LAT = -39.500580
    
    print(f"\nTarget point: {TARGET_LAT}, {TARGET_LON}")
    
    in_bbox = (min(lons) <= TARGET_LON <= max(lons)) and (min(lats) <= TARGET_LAT <= max(lats))
    print(f"Inside bbox: {in_bbox}")
    
    if not in_bbox:
        print(f"\nDistance from bbox:")
        print(f"  Lon distance: min={TARGET_LON-min(lons):.6f}, max={max(lons)-TARGET_LON:.6f}")
        print(f"  Lat distance: min={TARGET_LAT-min(lats):.6f}, max={max(lats)-TARGET_LAT:.6f}")
else:
    print("✗ HBE2/765 NOT in the 200 results")
    print("\nFirst 20 Hawkes Bay titles:")
    for f in features[:20]:
        props = f.get('properties', {})
        print(f"  - {props.get('title_no')}")
