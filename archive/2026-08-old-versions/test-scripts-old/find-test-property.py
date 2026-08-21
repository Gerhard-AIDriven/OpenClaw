#!/usr/bin/env python3
"""Find address for title on DP 405604 (known to have easements)"""

import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests, json, re
from pathlib import Path

API_KEY_FILE = Path('report-generator/Config/linz-api-key.txt')
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY_FILE.read_text().strip()}/wfs"

print("Searching for titles on DP 405604...")
params = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
          'typeNames': 'data.linz.govt.nz:layer-50804', 'outputFormat': 'application/json', 'count': 100}

resp = requests.get(BASE_URL, params=params, timeout=60)
print(f"Status: {resp.status_code}")
if resp.status_code != 200:
    print(f"Error: {resp.text[:200]}")
    exit(1)
titles = resp.json().get('features', [])
print(f"Got {len(titles)} titles")
found = False
for t in titles:
    estate = t['properties'].get('estate_description', '')
    if '405604' in str(estate):
        found = True
        title_no = t['properties']['title_no']
        print(f"\n✅ Found title: {title_no}")
        print(f"Estate: {estate}")
        
        # Get centroid
        coords = t['geometry']['coordinates'][0][0]
        lat = sum(c[1] for c in coords) / len(coords)
        lon = sum(c[0] for c in coords) / len(coords)
        print(f"Centroid: {lat:.6f}, {lon:.6f}")
        
        # Find nearest address
        params_a = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
                   'typeNames': 'data.linz.govt.nz:layer-123113', 'outputFormat': 'application/json'}
        addrs = requests.get(BASE_URL, params=params_a, timeout=30).json().get('features', [])
        
        best = None
        best_dist = float('inf')
        for a in addrs:
            if a.get('geometry') and a['geometry']['type'] == 'Point':
                alon, alat = a['geometry']['coordinates']
                d = ((alat-lat)**2 + (alon-lon)**2)**0.5
                if d < best_dist:
                    best_dist = d
                    best = a
        
        if best:
            addr = best['properties']['full_address']
            print(f"\n🏠 Nearest address: {addr}")
            print(f"Distance: {best_dist*111000:.0f}m")
            
            # Save result
            result = {'title': title_no, 'address': addr, 'lat': lat, 'lon': lon, 'has_easements': True}
            out = Path('test-property-with-easements.json')
            with open(out, 'w') as f: json.dump(result, f, indent=2)
            print(f"\n💾 Saved to: {out.name}")
            print(f"\n🧪 Test with: python generate-tier1-report.py \"{addr}\"")
            break

if not found:
    print("❌ No titles with DP 405604 in first 100 results")
    print("Using DP 619416 from sample results...")
    target_dp = '619416'
    title_no = None
    estate_desc = None
    lat = lon = None
    
    for t in titles:
        estate = t['properties'].get('estate_description', '')
        if target_dp in str(estate):
            title_no = t['properties']['title_no']
            estate_desc = estate
            coords = t['geometry']['coordinates'][0][0]
            lat = sum(c[1] for c in coords) / len(coords)
            lon = sum(c[0] for c in coords) / len(coords)
            print(f"\n✅ Using title: {title_no}")
            print(f"Estate: {estate_desc}")
            print(f"Centroid: {lat:.6f}, {lon:.6f}")
            found = True
            
            # Find nearest address
            params_a = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
                       'typeNames': 'data.linz.govt.nz:layer-123113', 'outputFormat': 'application/json'}
            addrs = requests.get(BASE_URL, params=params_a, timeout=30).json().get('features', [])
            
            best = None
            best_dist = float('inf')
            for a in addrs:
                if a.get('geometry') and a['geometry']['type'] == 'Point':
                    alon, alat = a['geometry']['coordinates']
                    d = ((alat-lat)**2 + **(alon-lon)2)**0.5
                    if d < best_dist:
                        best_dist = d
                        best = a
            
            if best:
                addr = best['properties']['full_address']
                print(f"\n🏠 Nearest address: {addr}")
                print(f"Distance: {best_dist*111000:.0f}m")
                
                result = {'title': title_no, 'address': addr, 'lat': lat, 'lon': lon, 'dp': target_dp}
                out = Path('test-property-for-easements.json')
                with open(out, 'w') as f: json.dump(result, f, indent=2)
                print(f"\n💾 Saved to: {out.name}")
                print(f"\n🧪 Test easements with: python easements_extractor_v2.py (update test title to {title_no})")
            else:
                print("❌ No addresses found nearby")
