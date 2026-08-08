#!/usr/bin/env python3
"""Find a test property with known DP number"""
import sys, requests, json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
API_KEY = Path('report-generator/Config/linz-api-key.txt').read_text().strip()
BASE = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("Fetching titles...")
params = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
          'typeNames': 'data.linz.govt.nz:layer-50804', 'outputFormat': 'application/json', 'count': 100}
titles = requests.get(BASE, params=params, timeout=60).json().get('features', [])
print(f"Got {len(titles)} titles")

# Use first title
t = titles[0]
title_no = t['properties']['title_no']
estate = t['properties'].get('estate_description', '')
coords = t['geometry']['coordinates'][0][0]
lat = sum(c[1] for c in coords) / len(coords)
lon = sum(c[0] for c in coords) / len(coords)

print(f"\nTitle: {title_no}")
print(f"Estate: {estate}")
print(f"Centroid: {lat:.6f}, {lon:.6f}")

# Find nearest address
params_a = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
           'typeNames': 'data.linz.govt.nz:layer-123113', 'outputFormat': 'application/json'}
addrs = requests.get(BASE, params=params_a, timeout=30).json().get('features', [])

best = None
best_dist = 999
for a in addrs:
    if a.get('geometry') and a['geometry']['type'] == 'Point':
        alon, alat = a['geometry']['coordinates']
        d = ((alat-lat)*(alat-lat) + (alon-lon)*(alon-lon))**0.5
        if d < best_dist:
            best_dist = d
            best = a

if best:
    addr = best['properties']['full_address']
    print(f"\nAddress: {addr}")
    print(f"Distance: {best_dist*111000:.0f}m")
    
    result = {'title': title_no, 'address': addr, 'lat': lat, 'lon': lon}
    out = Path('test-property.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\nSaved to: {out.name}")
    print(f"\nTest: python easements_extractor_v2.py (edit to use title {title_no})")
