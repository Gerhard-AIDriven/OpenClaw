import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Read API key
with open('report-generator/Config/linz-api-key.txt', 'r') as f:
    API_KEY = f.read().strip()

BASE_WFS_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 60)
print("Hawkes Bay Titles - Coordinate Analysis")
print("=" * 60)

# Query Hawkes Bay titles
params = {
    'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50804',
    'outputFormat': 'application/json',
    'cql_filter': "land_district = 'Hawkes Bay'",
    'count': 50
}

print("\nQuerying: land_district = 'Hawkes Bay'")
response = requests.get(BASE_WFS_URL, params=params, timeout=30)

if response.status_code != 200:
    print(f"[ERROR] HTTP {response.status_code}")
    print(response.text[:300])
    sys.exit(1)

data = response.json()
features = data.get('features', [])

if not features:
    print("[ERROR] No titles found")
    sys.exit(1)

print(f"Found {len(features)} Hawkes Bay titles\n")

# Target coordinates (31 Douglas McLean Ave)
TARGET_LAT = -39.500580
TARGET_LON = 176.904059
print(f"Target: {TARGET_LAT}, {TARGET_LON}\n")

# Analyze each title
print("Title locations:")
print("-" * 60)

for i, f in enumerate(features, 1):
    props = f.get('properties', {})
    geom = f.get('geometry', {})
    
    if geom.get('type') == 'MultiPolygon':
        coords = geom['coordinates'][0][0]
    elif geom.get('type') == 'Polygon':
        coords = geom['coordinates'][0]
    else:
        continue
    
    if not coords:
        continue
    
    # Bounding box
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    min_lon, max_lon = min(lons), max(lons)
    min_lat, max_lat = min(lats), max(lats)
    
    # Center
    center_lon = sum(lons) / len(lons)
    center_lat = sum(lats) / len(lats)
    
    # Distance (simple approximation)
    lat_diff = abs(center_lat - TARGET_LAT) * 111
    lon_diff = abs(center_lon - TARGET_LON) * 111
    dist_km = (lat_diff**2 + lon_diff**2)**0.5
    
    # In bbox?
    in_bbox = (min_lon <= TARGET_LON <= max_lon) and (min_lat <= TARGET_LAT <= max_lat)
    marker = " <-- POSSIBLE MATCH!" if in_bbox else ""
    
    print(f"{i:2d}. {props.get('title_no', 'N/A'):15s} {dist_km:6.2f} km{marker}")
    if in_bbox:
        print(f"    BBOX: {min_lat:.5f},{min_lon:.5f} to {max_lat:.5f},{max_lon:.5f}")

# Save
with open('hawkes-bay-titles-full.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"\nSaved to hawkes-bay-titles-full.json")
