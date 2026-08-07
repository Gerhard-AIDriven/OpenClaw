import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('report-generator/Config/linz-api-key.txt', 'r') as f:
    API_KEY = f.read().strip()

BASE_WFS_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 60)
print("DUE DILIGENCE MVP - BBOX Spatial Query")
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

# STEP 2: Query titles using small bounding box around address
print(f"\n[STEP 2] Querying titles with BBOX (0.001 degree ~100m buffer)...")

# Create small bbox around point (approx 100m buffer)
buffer = 0.001  # ~100 meters
bbox = f"{lon-buffer},{lat-buffer},{lon+buffer},{lat+buffer}"
print(f"BBOX: {bbox}")

title_params = {
    'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50804',
    'outputFormat': 'application/json',
    'cql_filter': f"BBOX(shape, {bbox})"
}

response = requests.get(BASE_WFS_URL, params=title_params, timeout=30)
if response.status_code != 200:
    print(f"[FAIL] HTTP {response.status_code}")
    print(response.text[:300])
    sys.exit(1)

title_data = response.json()
titles = title_data.get('features', [])

if not titles:
    print("[WARN] No titles found in BBOX")
    print("Falling back to DWITHIN 50 meters...")
    
    # Fallback to DWITHIN
    title_params['cql_filter'] = f"DWITHIN(shape, POINT({lon} {lat}), 50, meters)"
    response = requests.get(BASE_WFS_URL, params=title_params, timeout=30)
    if response.status_code == 200:
        title_data = response.json()
        titles = title_data.get('features', [])

if titles:
    print(f"[OK] Found {len(titles)} title(s) in area\n")
    
    # If multiple titles, find the one whose polygon contains or is closest to our point
    best_title = None
    min_distance = float('inf')
    
    for i, feature in enumerate(titles, 1):
        props = feature.get('properties', {})
        geom = feature.get('geometry', {})
        
        # Get polygon coords
        if geom.get('type') == 'MultiPolygon':
            coords = geom['coordinates'][0][0]
        elif geom.get('type') == 'Polygon':
            coords = geom['coordinates'][0]
        else:
            continue
        
        # Calculate centroid
        center_lon = sum(c[0] for c in coords) / len(coords)
        center_lat = sum(c[1] for c in coords) / len(coords)
        
        # Distance
        lat_diff = abs(center_lat - lat) * 111
        lon_diff = abs(center_lon - lon) * 111
        distance = (lat_diff**2 + lon_diff**2)**0.5
        
        print(f"Title {i}: {props.get('title_no', 'N/A')} - {distance*1000:.1f}m from address")
        
        if distance < min_distance:
            min_distance = distance
            best_title = feature
    
    if best_title:
        title_props = best_title.get('properties', {})
        
        print("\n" + "=" * 60)
        print("BEST MATCH - PROPERTY TITLE DETAILS")
        print("=" * 60)
        print(f"Title Number:      {title_props.get('title_no', 'N/A')}")
        print(f"Status:            {title_props.get('status', 'N/A')}")
        print(f"Type:              {title_props.get('type', 'N/A')}")
        print(f"Estate:            {title_props.get('estate_description', 'N/A')}")
        print(f"Guarantee Status:  {title_props.get('guarantee_status', 'N/A')}")
        print(f"Land District:     {title_props.get('land_district', 'N/A')}")
        print(f"Issue Date:        {title_props.get('issue_date', 'N/A')}")
        print(f"Number of Owners:  {title_props.get('number_owners', 'N/A')}")
        print(f"Distance:          {min_distance*1000:.1f}m from address point")
        
        # Save results
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
                'number_of_owners': title_props.get('number_owners'),
                'distance_meters': round(min_distance * 1000, 1)
            }
        }
        
        with open('due-diligence-result.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        with open('raw-title-data.json', 'w', encoding='utf-8') as f:
            json.dump(best_title, f, indent=2, ensure_ascii=False)
        
        print(f"\n[SAVED] Results saved to due-diligence-result.json")
        print("=" * 60)
        
        # Check if this matches expected title
        if title_props.get('title_no') == 'HBE2/765':
            print("✅ MATCHES EXPECTED TITLE (HBE2/765)!")
        else:
            print(f"⚠️  Got {title_props.get('title_no')}, expected HBE2/765")
            print("   Manual LINZ query shows HBE2/765 for this address")
else:
    print("[FAIL] No titles found with any method")
