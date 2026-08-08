#!/usr/bin/env python3
"""Test joining easements via appellation field"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
import json
from pathlib import Path

API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

api_key = API_KEY_FILE.read_text().strip()
base_url = BASE_WFS_URL.format(api_key)

title_no = "454362"
print(f"Testing easement lookup for title {title_no}")
print("="*80)

# Step 1: Get parcel appellation from association table
print("\n[STEP 1] Getting parcel appellation for title...")
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

if not parcels:
    print("No parcels found")
    exit(0)

# Get appellations from parcel table
appellations = []
for parcel in parcels:
    props = parcel['properties']
    # Note: table-51569 might not have appellation, only par_id
    par_id = props.get('par_id')
    print(f"Found parcel: par_id={par_id}")
    
    # We need to query NZ Parcels layer (51571) to get appellation from par_id
    if par_id:
        params_parcel = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': 'data.linz.govt.nz:layer-51571',
            'outputFormat': 'application/json',
            'cql_filter': f"par_id={par_id}"
        }
        
        response_p = requests.get(base_url, params=params_parcel, timeout=30)
        if response_p.status_code == 200:
            parcel_data = response_p.json()
            p_features = parcel_data.get('features', [])
            if p_features:
                app = p_features[0]['properties'].get('appellation')
                if app:
                    appellations.append(app)
                    print(f"  → Appellation: {app}")

if not appellations:
    print("⚠️  Could not get appellation - trying alternative approach")
    # Fallback: Use affected_surveys from title layer
    print("\nAlternative: Querying titles layer for survey references...")
    params_title = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': 'data.linz.govt.nz:layer-50804',
        'outputFormat': 'application/json',
        'cql_filter': f"title_no='{title_no}'"
    }
    
    response_t = requests.get(base_url, params=params_title, timeout=30)
    if response_t.status_code == 200:
        title_data = response_t.json()
        t_features = title_data.get('features', [])
        if t_features:
            props = t_features[0]['properties']
            print(f"Title properties: {list(props.keys())}")
    exit(0)

# Step 2: Search Linear Parcels for easements with matching appellation
print(f"\n[STEP 2] Searching for easements with appellation match...")

for app in appellations:
    # Extract DP number from appellation (e.g., "Marked A DP 405604" → "DP 405604")
    dp_part = app.split('DP ')[-1] if 'DP ' in app else app
    
    # Try matching on appellation
    params_eas = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': 'data.linz.govt.nz:layer-51570',
        'outputFormat': 'application/json',
        'cql_filter': f"appellation='{app}'"
    }
    
    print(f"Querying with appellation='{app}'...")
    response_e = requests.get(base_url, params=params_eas, timeout=30)
    
    if response_e.status_code == 200:
        eas_data = response_e.json()
        easements = eas_data.get('features', [])
        
        if easements:
            print(f"✅ SUCCESS! Found {len(easements)} easement(s)!")
            for eas in easements:
                props = eas['properties']
                print(f"\n  Easement Details:")
                print(f"    Appellation:     {props.get('appellation')}")
                print(f"    Parcel Intent:   {props.get('parcel_intent')}")
                print(f"    Status:          {props.get('status')}")
                print(f"    Affected Surveys:{props.get('affected_surveys')}")
            
            # Save success
            output_file = Path(__file__).parent / 'easements-found.json'
            result = {
                'title_no': title_no,
                'appellation_used': app,
                'easements_count': len(easements),
                'easements': [e['properties'] for e in easements]
            }
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)
            print(f"\n💾 Saved to: {output_file.name}")
            break
        else:
            print(f"  ℹ️  No easements found for appellation '{app}'")
    else:
        print(f"  ❌ Query failed: {response_e.status_code}")
