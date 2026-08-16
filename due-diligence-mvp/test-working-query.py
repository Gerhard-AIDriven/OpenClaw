import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

API_KEY = open('report-generator/Config/linz-api-key.txt', 'r').read().strip()
BASE_WFS_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 60)
print("DUE DILIGENCE MVP - PRODUCTION QUERY")
print("Address: 31 Douglas McLean Avenue, Marewa, Napier")
print("=" * 60)

# STEP 1: Get address coordinates
print("\n[STEP 1] Getting address coordinates...")
addr_params = {
    'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-123113',
    'outputFormat': 'application/json',
    'srsName': 'EPSG:4326',
    'cql_filter': "address_number=31 AND full_road_name='Douglas McLean Avenue' AND suburb_locality='Marewa'"
}

response = requests.get(BASE_WFS_URL, params=addr_params, timeout=30)
if response.status_code != 200 or not response.json().get('features'):
    print("[FAIL] Address not found")
    sys.exit(1)

addr_feature = response.json()['features'][0]
addr_props = addr_feature.get('properties', {})
lon, lat = addr_feature['geometry']['coordinates']
print(f"[OK] {lat:.6f}, {lon:.6f}")

# STEP 2: Query Hawkes Bay titles with LARGE count to ensure we get all
print(f"\n[STEP 2] Fetching ALL Hawkes Bay titles (no limit)...")

hb_params = {
    'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50804',
    'outputFormat': 'application/json',
    'cql_filter': "land_district = 'Hawkes Bay'"
}

response = requests.get(BASE_WFS_URL, params=hb_params, timeout=60)
if response.status_code != 200:
    print(f"[FAIL] HTTP {response.status_code}")
    sys.exit(1)

hb_data = response.json()
hb_features = hb_data.get('features', [])
print(f"Retrieved {len(hb_features)} Hawkes Bay titles")

# Find titles whose bounding box contains our point
matching_titles = []

for feature in hb_features:
    geom = feature.get('geometry', {})
    props = feature.get('properties', {})
    
    if not geom:
        continue
    
    if geom.get('type') == 'MultiPolygon':
        coords_list = geom['coordinates'][0]
    elif geom.get('type') == 'Polygon':
        coords_list = geom['coordinates']
    else:
        continue
    
    if coords_list and len(coords_list) > 0:
        coords = coords_list[0]
        lons = [c[0] for c in coords]
        lats = [c[1] for c in coords]
        
        min_lon, max_lon = min(lons), max(lons)
        min_lat, max_lat = min(lats), max(lats)
        
        if (min_lon <= lon <= max_lon) and (min_lat <= lat <= max_lat):
            matching_titles.append(feature)

print(f"\nTitles containing address point: {len(matching_titles)}")

if matching_titles:
    best_match = matching_titles[0]
    title_props = best_match.get('properties', {})
    
    print(f"\n[SUCCESS] Found: {title_props.get('title_no')}")
    
    print("\n" + "=" * 60)
    print("PROPERTY TITLE DETAILS")
    print("=" * 60)
    print(f"Title Number:      {title_props.get('title_no', 'N/A')}")
    print(f"Status:            {title_props.get('status', 'N/A')}")
    print(f"Type:              {title_props.get('type', 'N/A')}")
    print(f"Estate:            {title_props.get('estate_description', 'N/A')}")
    print(f"Guarantee Status:  {title_props.get('guarantee_status', 'N/A')}")
    print(f"Land District:     {title_props.get('land_district', 'N/A')}")
    print(f"Issue Date:        {title_props.get('issue_date', 'N/A')}")
    print(f"Number of Owners:  {title_props.get('number_owners', 'N/A')}")
    
    # Save
    results = {
        'query_address': {
            'street': f"{addr_props.get('address_number')} {addr_props.get('full_road_name')}",
            'suburb': addr_props.get('suburb_locality'),
            'city': addr_props.get('town_city'),
            'coordinates': {'latitude': lat, 'longitude': lon}
        },
        'property_title': {
            'title_number': title_props.get('title_no'),
            'status': title_props.get('status'),
            'type': title_props.get('type'),
            'estate': title_props.get('estate_description'),
            'guarantee_status': title_props.get('guarantee_status'),
            'land_district': title_props.get('land_district'),
            'issue_date': title_props.get('issue_date'),
            'number_of_owners': title_props.get('number_owners')
        }
    }
    
    with open('due-diligence-result.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n[SAVED] due-diligence-result.json")
    print("=" * 60)
    
    if title_props.get('title_no') == 'HBE2/765':
        print("✅ CORRECT TITLE: HBE2/765")
        print("✅ DUE DILIGENCE MVP IS WORKING!")
    else:
        print(f"⚠️  Got {title_props.get('title_no')}, expected HBE2/765")
else:
    print("[FAIL] No matching titles")
