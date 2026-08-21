#!/usr/bin/env python3
"""Complete reverse lookup: Easement → DP → Title → Address using LINZ Street Address layer"""
import sys, requests, json, re
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
API_KEY = Path('report-generator/Config/linz-api-key.txt').read_text().strip()
BASE = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("="*80)
print("REVERSE LOOKUP: Finding address from known easement")
print("="*80)

# Step 1: Get a known easement from Linear Parcels
print("\n[STEP 1] Fetching easements from Linear Parcels (layer-51570)...")
params = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
          'typeNames': 'data.linz.govt.nz:layer-51570', 'outputFormat': 'application/json', 'count': 10}
eas_data = requests.get(BASE, params=params, timeout=30).json()
easements = [f for f in eas_data.get('features', []) if 'easement' in str(f['properties'].get('parcel_intent', '')).lower()]

if not easements:
    print("❌ No easements found")
    exit(1)

print(f"✅ Found {len(easements)} easements")
eas = easements[0]
eas_props = eas['properties']
affected = eas_props.get('affected_surveys', '')
print(f"Sample easement: {eas_props.get('appellation')}")
print(f"Affected surveys: {affected}")

# Extract DP number - try multiple until we find one with a title
dp_matches = re.findall(r'DP\s+(\d+)', affected)
if not dp_matches:
    print("❌ Could not extract DP number")
    exit(1)

# Try each DP until we find a matching title
target_title = None
dp_num = None
for dp_candidate in dp_matches[:3]:  # Try first 3 DPs
    print(f"\nTrying DP {dp_candidate}...")
    params_t = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
                'typeNames': 'data.linz.govt.nz:layer-50804', 'outputFormat': 'application/json', 'count': 500}
    titles = requests.get(BASE, params=params_t, timeout=60).json().get('features', [])
    
    for t in titles:
        estate = t['properties'].get('estate_description', '')
        if dp_candidate in str(estate):
            target_title = t
            dp_num = dp_candidate
            break
    
    if target_title:
        break

if not target_title:
    print(f"❌ No title found with any of the DPs: {dp_matches}")
    exit(1)

print(f"\n✅ Found title for DP {dp_num}: {title_no}")
print(f"Estate: {target_title['properties'].get('estate_description')[:80]}")

# Get title centroid
coords = target_title['geometry']['coordinates'][0][0]
t_lat = sum(c[1] for c in coords) / len(coords)
t_lon = sum(c[0] for c in coords) / len(coords)
print(f"Title centroid: {t_lat:.6f}, {t_lon:.6f}")

# Step 3: Query Street Address layer (53353)
print(f"\n[STEP 3] Querying Street Address layer (53353) near title...")
params_a = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetFeature',
            'typeNames': 'data.linz.govt.nz:layer-53353', 'outputFormat': 'application/json'}

try:
    addr_resp = requests.get(BASE, params=params_a, timeout=30)
    if addr_resp.status_code == 200:
        addr_data = addr_resp.json()
        addresses = addr_data.get('features', [])
        print(f"Retrieved {len(addresses)} addresses")
        
        # Find closest address to title centroid
        best = None
        best_dist = float('inf')
        for a in addresses:
            geom = a.get('geometry')
            if geom and geom['type'] == 'Point':
                alon, alat = geom['coordinates']
                dist = abs(alat-t_lat) + abs(alon-t_lon)  # Manhattan distance, no exponent issues
                if dist < best_dist:
                    best_dist = dist
                    best = a
        
        if best:
            addr_props = best['properties']
            full_addr = addr_props.get('full_address', 'Unknown')
            print(f"\n{'='*80}")
            print("🎯 SUCCESS! COMPLETE CHAIN ESTABLISHED")
            print(f"{'='*80}")
            print(f"Easement:      {eas_props.get('appellation')}")
            print(f"DP Number:     {dp_num}")
            print(f"Title Number:  {title_no}")
            print(f"Address:       {full_addr}")
            print(f"Distance:      {best_dist*111000:.0f}m")
            
            # Save result
            result = {
                'easement': eas_props.get('appellation'),
                'dp_number': dp_num,
                'title_number': title_no,
                'address': full_addr,
                'coordinates': {'lat': t_lat, 'lon': t_lon},
                'test_command': f'python generate-tier1-report.py "{full_addr}"'
            }
            out = Path('reverse-lookup-result.json')
            with open(out, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Saved to: {out.name}")
            print(f"\n🧪 Test full report generation:")
            print(f"   python generate-tier1-report.py \"{full_addr}\"")
        else:
            print("❌ No addresses found near title")
    else:
        print(f"❌ Address query failed: {addr_resp.status_code}")
        print("Street Address layer may not be accessible via WFS")
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Alternative: Use manual lookup")
    print(f"   1. Go to https://www.oneroof.co.nz/")
    print(f"   2. Search for properties in the area: {t_lat:.6f}, {t_lon:.6f}")
    print(f"   3. Or search LINZ website for title {title_no}")
