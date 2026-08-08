"""
Simple building fetch - get all for a town, filter by distance
"""

import requests
import json
import math
import sys

sys.stdout.reconfigure(encoding='utf-8')

api_key = open('report-generator/Config/linz-api-key.txt').read().strip()
url = f'https://data.linz.govt.nz/services;key={api_key}/wfs'

print("Fetching buildings in Napier...")

# Get first 100 buildings in the dataset (no filter)
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50246',
    'outputFormat': 'application/json',
    'count': 100
}

response = requests.get(url, params=params, timeout=30)

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    
    print(f"Got {len(features)} buildings")
    
    # Check if any are in Napier/Marewa
    napier_buildings = []
    for f in features:
        props = f.get('properties', {})
        suburb = props.get('suburb_locality', '')
        town = props.get('town_city', '')
        
        if 'napier' in suburb.lower() or 'marewa' in suburb.lower() or 'napier' in town.lower():
            napier_buildings.append(f)
    
    print(f"\nFound {len(napier_buildings)} buildings in Napier/Marewa area")
    
    if napier_buildings:
        print("\nFirst building details:")
        b = napier_buildings[0]
        props = b['properties']
        geom = b['geometry']
        
        print(f"  Suburb: {props.get('suburb_locality')}")
        print(f"  Town: {props.get('town_city')}")
        print(f"  Use: {props.get('use', 'Unknown')}")
        print(f"  Geometry: {geom.get('type')}")
        
        if geom.get('type') == 'Polygon':
            coords = geom['coordinates'][0]
            print(f"  Polygon points: {len(coords)}")
            
            # Calculate approximate area
            def calc_area(coords):
                avg_lat = sum(c[1] for c in coords) / len(coords)
                lat_factor = 111320
                lon_factor = 111320 * math.cos(math.radians(avg_lat))
                
                x = [(c[0] - coords[0][0]) * lon_factor for c in coords]
                y = [(c[1] - coords[0][1]) * lat_factor for c in coords]
                
                area = sum(x[i] * y[(i+1)%len(y)] - x[(i+1)%len(x)] * y[i] for i in range(len(x))) / 2
                return abs(area)
            
            area = calc_area(coords)
            print(f"  Approx area: {area:.1f} m²")
else:
    print(f"Error: {response.status_code}")
    print(response.text[:500])
