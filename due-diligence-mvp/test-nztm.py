import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

API_KEY = open('report-generator/Config/linz-api-key.txt', 'r').read().strip()
BASE_WFS_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("Testing coordinate system for NZ Property Titles layer...\n")

# Query Hawkes Bay titles and check their coordinate format
params = {
    'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50804',
    'outputFormat': 'application/json',
    'cql_filter': "land_district = 'Hawkes Bay'",
    'count': 5
}

response = requests.get(BASE_WFS_URL, params=params, timeout=30)
if response.status_code != 200:
    print(f"Error: {response.status_code}")
    sys.exit(1)

data = response.json()
features = data.get('features', [])

print(f"Retrieved {len(features)} titles\n")

for i, f in enumerate(features, 1):
    props = f.get('properties', {})
    geom = f.get('geometry', {})
    
    # Get first coordinate
    if geom.get('type') == 'MultiPolygon':
        coords = geom['coordinates'][0][0][0]
    elif geom.get('type') == 'Polygon':
        coords = geom['coordinates'][0][0]
    else:
        continue
    
    lon, lat = coords[0], coords[1]
    
    print(f"{i}. Title: {props.get('title_no')}")
    print(f"   First coord: {lon}, {lat}")
    
    # Check if these look like NZTM (large numbers) or WGS84 (normal lat/lon)
    if abs(lon) > 180 or abs(lat) > 90:
        print(f"   -> These are NZTM coordinates (meters)")
        print(f"   -> Need to convert WGS84 to NZTM for spatial queries")
    else:
        print(f"   -> These are WGS84 coordinates (degrees)")
    print()
