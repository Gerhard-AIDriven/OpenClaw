#!/usr/bin/env python3
"""Test LINZ Title Parcel Association Table (51569) - the missing link!"""

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
print("TESTING LINZ TITLE-PARCEL ASSOCIATION TABLE (51569)")
print("="*80)
print(f"API Key: {api_key[:8]}...{api_key[-4:]}")

# Test 1: Check if table exists and get sample
print("\n[TEST 1] Fetching sample records from table-51569...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:table-51569',
    'outputFormat': 'application/json',
    'count': 5
}

response = requests.get(base_url, params=params, timeout=30)
print(f"Response Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    features = data.get('features', [])
    print(f"✅ Success! Retrieved {len(features)} sample records")
    
    if features:
        print("\nAvailable fields:")
        props = features[0]['properties']
        for key in sorted(props.keys()):
            value = props[key]
            if value is not None:
                value_str = str(value)[:50]
            else:
                value_str = "null"
            print(f"  - {key}: {value_str}")
        
        # Test 2: Query by specific title number
        print("\n[TEST 2] Querying parcels for title '454362' (Westshore property)...")
        params['cql_filter'] = "title_no='454362'"
        params['count'] = None  # Remove count limit
        
        response2 = requests.get(base_url, params=params, timeout=30)
        print(f"Response Status: {response2.status_code}")
        
        if response2.status_code == 200:
            data2 = response2.json()
            parcels = data2.get('features', [])
            print(f"✅ Found {len(parcels)} parcel(s) linked to title 454362")
            
            for i, parcel in enumerate(parcels, 1):
                props = parcel['properties']
                print(f"\n  Parcel {i}:")
                print(f"    Parcel ID: {props.get('parcel_id')}")
                print(f"    Title No: {props.get('title_no')}")
                print(f"    Appellation: {props.get('appellation')}")
                print(f"    Parcel Type: {props.get('parcel_type')}")
                
                # Now test 3: Use parcel_id to query Linear Parcels for easements
                parcel_id = props.get('parcel_id')
                if parcel_id:
                    print(f"\n  [TEST 3] Searching for easements on parcel {parcel_id}...")
                    params_easement = {
                        'service': 'WFS',
                        'version': '2.0.0',
                        'request': 'GetFeature',
                        'typeNames': 'data.linz.govt.nz:layer-51570',
                        'outputFormat': 'application/json',
                        'cql_filter': f"parcel_id={parcel_id}"
                    }
                    
                    response3 = requests.get(base_url, params=params_easement, timeout=30)
                    if response3.status_code == 200:
                        easement_data = response3.json()
                        easements = easement_data.get('features', [])
                        if easements:
                            print(f"    ✅ Found {len(easements)} easement(s)!")
                            for eas in easements:
                                eas_props = eas['properties']
                                print(f"      - Type: {eas_props.get('parcel_intent')}")
                                print(f"        Appellation: {eas_props.get('appellation')}")
                                print(f"        Status: {eas_props.get('status')}")
                        else:
                            print(f"    ℹ️  No easements found for this parcel")
                    else:
                        print(f"    ❌ Easement query failed: {response3.status_code}")
        else:
            print(f"❌ Title query failed: {response2.status_code}")
            print(response2.text[:300])
    else:
        print("⚠️  No features returned")
else:
    print(f"❌ Failed: {response.status_code}")
    print(response.text[:500])

print("\n" + "="*80)
print("TEST COMPLETE")
print("="*80)
