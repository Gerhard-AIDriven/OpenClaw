#!/usr/bin/env python3
"""Find a title that contains DP 405604 (known to have easements)"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
import json
from pathlib import Path

API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

api_key = API_KEY_FILE.read_text().strip()
base_url = BASE_WFS_URL.format(api_key)

print("="*80)
print("SEARCHING FOR TITLES ON DP 405604")
print("="*80)

target_dp = "405604"
print(f"\nTarget DP: {target_dp}")
print("This DP has known easements from our sample query")

# Query all titles in Hawke's Bay and filter client-side
print("\nQuerying titles in Hawke's Bay district...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-50804',
    'outputFormat': 'application/json',
    'cql_filter': "LAND_DISTRICT='Hawkes Bay'"
}

response = requests.get(base_url, params=params, timeout=60)
if response.status_code != 200:
    print(f"❌ Failed: {response.status_code}")
    exit(1)

data = response.json()
titles = data.get('features', [])
print(f"Retrieved {len(titles)} titles in Hawke's Bay")

# Search for titles with DP 405604 in estate_description
matching_titles = []
for t in titles:
    props = t['properties']
    estate = props.get('estate_description', '')
    if target_dp in str(estate):
        matching_titles.append(t)
        print(f"\n✅ MATCH FOUND!")
        print(f"   Title: {props.get('title_no')}")
        print(f"   Estate: {estate}")
        
        # Get geometry centroid for address lookup
        geom = t.get('geometry')
        if geom and geom['type'] == 'MultiPolygon':
            coords = geom['coordinates'][0][0]
            avg_lon = sum(c[0] for c in coords) / len(coords)
            avg_lat = sum(c[1] for c in coords) / len(coords)
            print(f"   Centroid: {avg_lat:.6f}, {avg_lon:.6f}")

if matching_titles:
    print(f"\n{'='*80}")
    print(f"🎯 FOUND {len(matching_titles)} TITLE(S) ON DP {target_dp}")
    print(f"{'='*80}")
    
    # Use first match
    target_title = matching_titles[0]
    t_props = target_title['properties']
    title_no = t_props.get('title_no')
    
    print(f"\nTarget Title: {title_no}")
    print(f"Estate Description: {t_props.get('estate_description')}")
    
    # Get coordinates
    geom = target_title.get('geometry')
    if geom:
        coords = geom['coordinates'][0][0]
        avg_lon = sum(c[0] for c in coords) / len(coords)
        avg_lat = sum(c[1] for c in coords) / len(coords)
        
        print(f"\nCoordinates: {avg_lat:.6f}, {avg_lon:.6f}")
        
        # Now find address at these coordinates
        print(f"\n[SEARCHING] For address near {avg_lat:.6f}, {avg_lon:.6f}...")
        
        # Query addresses layer with bbox
        delta = 0.002  # ~200m
        min_lon, max_lon = avg_lon - delta, avg_lon + delta
        min_lat, max_lat = avg_lat - delta, avg_lat + delta
        
        # Unfortunately WFS doesn't support bbox filter easily
        # Let's try querying addresses in Hawke's Bay and filtering
        params_addr = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': 'data.linz.govt.nz:layer-123113',
            'outputFormat': 'application/json',
            'count': 100
        }
        
        response_a = requests.get(base_url, params=params_addr, timeout=30)
        if response_a.status_code == 200:
            addr_data = response_a.json()
            addresses = addr_data.get('features', [])
            
            # Find closest address by distance
            closest_addr = None
            min_distance = float('inf')
            
            for addr in addresses:
                a_props = addr['properties']
                a_geom = addr.get('geometry')
                
                if a_geom and a_geom['type'] == 'Point':
                    a_lon, a_lat = a_geom['coordinates']
                    
                    # Simple Euclidean distance (good enough for short distances)
                    dist = ((a_lat - avg_lat)**2 + **(a_lon - avg_lon)2)**0.5
                    
                    if dist < min_distance:
                        min_distance = dist
                        closest_addr = addr
            
            if closest_addr:
                a_props = closest_addr['properties']
                print(f"\n{'='*80}")
                print("🏠 CLOSEST ADDRESS FOUND")
                print(f"{'='*80}")
                print(f"Full Address: {a_props.get('full_address')}")
                print(f"Town/City: {a_props.get('town_city')}")
                print(f"Suburb: {a_props.get('suburb_locality')}")
                print(f"Road Name: {a_props.get('full_road_name')}")
                print(f"Address Number: {a_props.get('address_number')}")
                print(f"\nDistance from title centroid: {min_distance*111000:.1f}m")  # Rough conversion to meters
                
                # Save complete result
                output_file = Path(__file__).parent / 'test-property-with-easements.json'
                result = {
                    'title_number': title_no,
                    'estate_description': t_props.get('estate_description'),
                    'address': {
                        'full_address': a_props.get('full_address'),
                        'town_city': a_props.get('town_city'),
                        'suburb': a_props.get('suburb_locality'),
                        'road_name': a_props.get('full_road_name'),
                        'number': a_props.get('address_number')
                    },
                    'coordinates': {
                        'latitude': avg_lat,
                        'longitude': avg_lon
                    },
                    'known_easements': True,
                    'dp_number': target_dp,
                    'search_method': 'reverse_engineered_from_linear_parcels_easements'
                }
                
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f, indent=2)
                
                print(f"\n💾 Results saved to: {output_file.name}")
                
                print(f"\n{'='*80}")
                print("🧪 READY TO TEST FULL EASEMENT EXTRACTION!")
                print(f"{'='*80}")
                print(f"\nTest Command:")
                print(f"  python easements_extractor.py")
                print(f"  (will test on title {title_no})")
                
                print(f"\nOr generate full report:")
                print(f"  python generate-tier1-report.py \"{a_props.get('full_address')}\"")
                
            else:
                print("❌ Could not find nearby address")
        else:
            print(f"❌ Address query failed: {response_a.status_code}")

else:
    print(f"\n❌ No titles found containing DP {target_dp}")
