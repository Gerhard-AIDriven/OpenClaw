#!/usr/bin/env python3
"""Test complete easement lookup chain: Title → Parcel → Easement"""

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
print("COMPLETE EASEMENT LOOKUP CHAIN TEST")
print("="*80)

# Step 1: Get parcel_id for title 454362
title_no = "454362"
print(f"\n[STEP 1] Finding parcel(s) for title {title_no}...")

params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:table-51569',
    'outputFormat': 'application/json',
    'cql_filter': f"title_no='{title_no}'"
}

response = requests.get(base_url, params=params, timeout=30)
if response.status_code != 200:
    print(f"❌ Failed: {response.status_code}")
    exit(1)

data = response.json()
parcels = data.get('features', [])
print(f"✅ Found {len(parcels)} parcel record(s)")

if not parcels:
    print("No parcels found for this title")
    exit(0)

# Extract parcel IDs
parcel_ids = []
for parcel in parcels:
    props = parcel['properties']
    par_id = props.get('par_id')
    if par_id:
        parcel_ids.append(par_id)
        print(f"  - Parcel ID: {par_id}")

if not parcel_ids:
    print("⚠️  No parcel IDs found (par_id is null)")
    exit(0)

# Step 2: Query Linear Parcels for easements using parcel IDs
print(f"\n[STEP 2] Searching for easements on parcel(s) {parcel_ids}...")

# Build filter for multiple parcel IDs
if len(parcel_ids) == 1:
    filter_str = f"par_id={parcel_ids[0]}"
else:
    filter_str = f"par_id IN ({','.join(map(str, parcel_ids))})"

params_easement = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51570',
    'outputFormat': 'application/json',
    'cql_filter': filter_str
}

response2 = requests.get(base_url, params=params_easement, timeout=30)
if response2.status_code != 200:
    print(f"❌ Easement query failed: {response2.status_code}")
    print(response2.text[:300])
    exit(1)

easement_data = response2.json()
easements = easement_data.get('features', [])

if easements:
    print(f"✅ SUCCESS! Found {len(easements)} easement(s)!")
    print("\nEasement Details:")
    print("-"*80)
    
    for i, eas in enumerate(easements, 1):
        props = eas['properties']
        print(f"\n{f'Easement #{i}':^80}")
        print(f"  Parcel ID:       {props.get('par_id')}")
        print(f"  Appellation:     {props.get('appellation')}")
        print(f"  Parcel Intent:   {props.get('parcel_intent')}")
        print(f"  Topology Type:   {props.get('topology_type')}")
        print(f"  Status:          {props.get('status')}")
        print(f"  Land District:   {props.get('land_district')}")
        print(f"  Affected Surveys:{props.get('affected_surveys')}")
        
        # Get geometry if available
        if eas.get('geometry'):
            geom = eas['geometry']
            if geom['type'] == 'LineString':
                coords = geom['coordinates']
                print(f"  Geometry:        LineString with {len(coords)} points")
                if coords:
                    print(f"                   Start: {coords[0][0]:.6f}, {coords[0][1]:.6f}")
                    print(f"                   End:   {coords[-1][0]:.6f}, {coords[-1][1]:.6f}")
    
    print("\n" + "="*80)
    print("🎉 AUTOMATED EASEMENT EXTRACTION IS POSSIBLE!")
    print("="*80)
    
    # Save results
    output_file = Path(__file__).parent / 'test-easements-success.json'
    result = {
        'title_no': title_no,
        'parcel_ids': parcel_ids,
        'easements_count': len(easements),
        'easements': [e['properties'] for e in easements]
    }
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)
    print(f"\n💾 Results saved to: {output_file.name}")
    
else:
    print(f"ℹ️  No easements found for title {title_no}")
    print("This property may have no registered easements.")
