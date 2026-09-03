import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

API_KEY = open('report-generator/Config/linz-api-key.txt', 'r').read().strip()
BASE_WFS_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("Querying specific title: HBE2/765\n")

# Query by title number
params = {
    'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50804',
    'outputFormat': 'application/json',
    'cql_filter': "title_no = 'HBE2/765'"
}

print(f"CQL Filter: title_no = 'HBE2/765'")
response = requests.get(BASE_WFS_URL, params=params, timeout=30)

if response.status_code != 200:
    print(f"Error: HTTP {response.status_code}")
    print(response.text[:300])
    sys.exit(1)

data = response.json()
features = data.get('features', [])

if not features:
    print("[NOT FOUND] Title HBE2/765 does not exist in the dataset")
    print("\nSearching for similar titles in Hawkes Bay...")
    
    # List all HBE* titles
    params['cql_filter'] = "land_district = 'Hawkes Bay' AND title_no LIKE 'HBE%'"
    response = requests.get(BASE_WFS_URL, params=params, timeout=30)
    if response.status_code == 200:
        data = response.json()
        features = data.get('features', [])
        print(f"Found {len(features)} titles starting with 'HBE':")
        for f in features[:20]:
            props = f.get('properties', {})
            print(f"  - {props.get('title_no')}")
else:
    print(f"[FOUND] Retrieved {len(features)} feature(s)\n")
    
    for i, f in enumerate(features, 1):
        props = f.get('properties', {})
        geom = f.get('geometry', {})
        
        print(f"Title Details:")
        print(f"  Title Number: {props.get('title_no')}")
        print(f"  Status: {props.get('status')}")
        print(f"  Type: {props.get('type')}")
        print(f"  Estate: {props.get('estate_description')}")
        print(f"  Land District: {props.get('land_district')}")
        print(f"  Issue Date: {props.get('issue_date')}")
        print(f"  Number of Owners: {props.get('number_owners')}")
        
        # Get bounding box of polygon
        if geom.get('type') == 'MultiPolygon':
            coords = geom['coordinates'][0][0]
        else:
            coords = geom['coordinates'][0]
        
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        
        print(f"\n  Polygon BBOX:")
        print(f"    Min: {min(lons):.6f}, {min(lats):.6f}")
        print(f"    Max: {max(lons):.6f}, {max(lats):.6f}")
        
        # Check if our target point is inside
        TARGET_LON = 176.904059
        TARGET_LAT = -39.500580
        
        in_bbox = (min(lons) <= TARGET_LON <= max(lons)) and (min(lats) <= TARGET_LAT <= max(lats))
        print(f"\n  Target point ({TARGET_LAT}, {TARGET_LON}):")
        if in_bbox:
            print(f"    ✓ Inside bounding box!")
        else:
            print(f"    ✗ OUTSIDE bounding box")
            print(f"    Distance from bbox: ...")
        
        # Save full feature
        with open('hbe2-765-full.json', 'w', encoding='utf-8') as outfile:
            json.dump(f, outfile, indent=2, ensure_ascii=False)
        print(f"\n  Saved to hbe2-765-full.json")
