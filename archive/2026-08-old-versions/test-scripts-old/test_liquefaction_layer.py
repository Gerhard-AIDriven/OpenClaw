#!/usr/bin/env python3
"""
Test if LINZ has liquefaction data for Hawke's Bay/Napier
"""

import requests
from pathlib import Path

# Configuration
API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'

def get_api_key():
    with open(API_KEY_FILE, 'r') as f:
        return f.read().strip()

# Test known liquefaction layer IDs
# These are common LINZ layer IDs for liquefaction in NZ
LIQUEFACTION_LAYERS = [
    # Hawke's Bay specific
    'data.linz.govt.nz:layer-61028',  # HBRC Liquefaction Vulnerability
    'data.linz.govt.nz:layer-61029',  # HBRC Liquefaction Susceptibility
    # National/regional
    'data.linz.govt.nz:layer-50783',  # GNS Liquefaction Hazard
    'data.linz.govt.nz:layer-50784',  # GNS Liquefaction Susceptibility
    # Canterbury (for reference)
    'data.linz.govt.nz:layer-10707',  # CCC Liquefaction Vulnerability
]

api_key = get_api_key()
base_url = "https://data.linz.govt.nz/services;key={}/wfs".format(api_key)

print("Testing LINZ for liquefaction layers...\n")

for layer_id in LIQUEFACTION_LAYERS:
    params = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': layer_id,
        'outputFormat': 'application/json',
        'maxFeatures': 1  # Just test if layer exists
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        
        if response.status_code == 200:
            print(f"[OK] {layer_id}")
            print(f"   Status: ACCESSIBLE")
            data = response.json()
            if 'features' in data:
                print(f"   Features found: {len(data['features'])}")
        elif response.status_code == 404:
            print(f"[NOT FOUND] {layer_id}")
            print(f"   Status: NOT FOUND")
        else:
            print(f"[WARN] {layer_id}")
            print(f"   Status: {response.status_code}")
            
    except Exception as e:
        print(f"[ERROR] {layer_id}")
        print(f"   Error: {e}")
    
    print()

print("\nNext step: Search LINZ catalog for more layers")
print("URL: https://data.linz.govt.nz/")
