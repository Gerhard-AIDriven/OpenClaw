"""Search Meeanee area for Ferguson Avenue"""

import requests
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

api_key = open('report-generator/Config/linz-api-key.txt').read().strip()
url = f'https://data.linz.govt.nz/services;key={api_key}/wfs'

# Meeanee area bbox (approximate)
# Meeanee is around -39.51, 176.88
bbox = '-39.53,176.87,-39.49,176.90,EPSG:4326'

print("Searching Meeanee area for addresses...")
print("=" * 60)

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-123113',
    'outputFormat': 'application/json',
    'bbox': bbox,
    'count': 200
}

response = requests.get(url, params=params, timeout=30)

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    print(f"Got {len(features)} addresses in Meeanee bbox")
    
    # Look for Ferguson Avenue
    ferguson_addresses = []
    for f in features:
        props = f.get('properties', {})
        road = props.get('road_name', '')
        
        if 'ferguson' in road.lower():
            geom = f.get('geometry', {})
            coords = geom.get('coordinates', [None, None]) if geom.get('type') == 'Point' else [None, None]
            
            ferguson_addresses.append({
                'number': props.get('address_number', '?'),
                'road': road,
                'suburb': props.get('suburb_locality', '?'),
                'city': props.get('town_city', '?'),
                'lat': coords[1],
                'lon': coords[0]
            })
    
    print(f"\nFound {len(ferguson_addresses)} Ferguson Avenue addresses:")
    for addr in ferguson_addresses:
        print(f"  ✓ {addr['number']} {addr['road']}, {addr['suburb']}, {addr['city']}")
        print(f"    Coords: {addr['lat']:.6f}, {addr['lon']:.6f}")
else:
    print(f"Error: {response.status_code}")
    print(response.text[:500])
