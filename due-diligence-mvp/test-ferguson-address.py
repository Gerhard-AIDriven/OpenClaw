"""Test Ferguson Avenue address lookup"""

import requests
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

api_key = open('report-generator/Config/linz-api-key.txt').read().strip()
url = f'https://data.linz.govt.nz/services;key={api_key}/wfs'

print("Searching for Ferguson Avenue addresses in Napier...")
print("=" * 60)

# Try without cql_filter (not supported), just get first 100 and filter client-side
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-123113',
    'outputFormat': 'application/json',
    'count': 100
}

response = requests.get(url, params=params, timeout=30)

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    print(f"Got {len(features)} addresses from LINZ")
    
    # Filter for Ferguson Avenue
    ferguson_addresses = []
    for f in features:
        props = f.get('properties', {})
        road = props.get('road_name', '')
        suburb = props.get('suburb_locality', '')
        town = props.get('town_city', '')
        
        if 'ferguson' in road.lower():
            ferguson_addresses.append({
                'number': props.get('address_number', '?'),
                'road': road,
                'suburb': suburb,
                'city': town,
                'lat': props.get('geometry', {}).get('coordinates', [None, None])[1] if props.get('geometry', {}).get('type') == 'Point' else None,
                'lon': props.get('geometry', {}).get('coordinates', [None, None])[0] if props.get('geometry', {}).get('type') == 'Point' else None
            })
    
    print(f"\nFound {len(ferguson_addresses)} Ferguson Avenue addresses:")
    for addr in ferguson_addresses[:10]:
        print(f"  {addr['number']} {addr['road']}, {addr['suburb']}, {addr['city']}")
        print(f"    Coords: {addr['lat']}, {addr['lon']}")
else:
    print(f"Error: {response.status_code}")
    print(response.text[:500])
