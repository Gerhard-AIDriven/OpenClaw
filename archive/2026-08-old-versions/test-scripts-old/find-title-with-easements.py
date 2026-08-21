#!/usr/bin/env python3
"""Find a title with easements, then trace back to address"""

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
print("FINDING A TITLE WITH EASEMENTS (REVERSE ENGINEERING)")
print("="*80)

# Step 1: Search Linear Parcels for easements (ignore filters, just get some)
print("\n[STEP 1] Fetching sample easements from Linear Parcels...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetFeature',
    'typeNames': 'data.linz.govt.nz:layer-51570',
    'outputFormat': 'application/json',
    'count': 20
}

response = requests.get(base_url, params=params, timeout=30)
if response.status_code != 200:
    print(f"❌ Failed: {response.status_code}")
    exit(1)

data = response.json()
features = data.get('features', [])
print(f"Retrieved {len(features)} linear parcel features")

# Filter for easements only
easements = []
for f in features:
    props = f['properties']
    if 'easement' in str(props.get('parcel_intent', '')).lower():
        easements.append(f)

print(f"Found {len(easements)} actual easements")

if not easements:
    print("❌ No easements found in sample - trying different approach")
    exit(1)

# Step 2: Extract DP numbers from affected_surveys
print("\n[STEP 2] Extracting DP numbers from easement survey references...")
dp_numbers = set()
for eas in easements:
    affected = eas['properties'].get('affected_surveys', '')
    if affected:
        import re
        dps = re.findall(r'DP\s+(\d+)', affected)
        dp_numbers.update(dps)
        print(f"  Easement '{eas['properties'].get('appellation')}' → affects {affected}")

print(f"\nUnique DP numbers found: {list(dp_numbers)[:10]}")  # Show first 10

# Step 3: Search titles layer for properties on these DPs
print("\n[STEP 3] Searching for titles on these DP numbers...")

# We need to search by estate_description containing "Deposited Plan XXXXX"
# But WFS doesn't support full-text search well, so we'll try a different approach:
# Query ALL titles in Hawke's Bay and filter client-side (inefficient but works for testing)

# Better approach: Use the appellation from easement to find lot/DP
sample_easement = easements[0]
appellation = sample_easement['properties'].get('appellation', '')
print(f"\nUsing sample easement: {appellation}")

# Extract Lot and DP from appellation (e.g., "Marked A DP 405604" or "Lot 5 DP 123456")
import re
lot_match = re.search(r'Lot\s+(\d+)', appellation, re.IGNORECASE)
dp_match = re.search(r'DP\s+(\d+)', appellation, re.IGNORECASE)

if lot_match and dp_match:
    lot_num = lot_match.group(1)
    dp_num = dp_match.group(1)
    print(f"Extracted: Lot {lot_num}, DP {dp_num}")
    
    # Now we need to find a title that contains "Lot X Deposited Plan Y"
    # This is tricky without full-text search. Let's try querying by spatial location instead!
    
    # Get geometry from easement
    geom = sample_easement.get('geometry')
    if geom and geom['type'] == 'LineString':
        coords = geom['coordinates']
        # Get midpoint
        mid_idx = len(coords) // 2
        lon, lat = coords[mid_idx]
        print(f"\nEasement midpoint: {lat:.6f}, {lon:.6f}")
        
        # Step 4: Query titles by bounding box around this point
        print("\n[STEP 4] Searching for titles near this location...")
        
        # Create a small bbox (~100m around point)
        delta = 0.001  # ~0.1 degrees ≈ 10km (to be safe)
        min_lon, max_lon = lon - delta, lon + delta
        min_lat, max_lat = lat - delta, lat + delta
        
        params_bbox = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': 'data.linz.govt.nz:layer-50804',
            'outputFormat': 'application/json',
            'cql_filter': f"LAND_DISTRICT='Hawkes Bay'"  # Filter by district first
        }
        
        response_t = requests.get(base_url, params=params_bbox, timeout=30)
        if response_t.status_code == 200:
            title_data = response_t.json()
            titles = title_data.get('features', [])
            print(f"Found {len(titles)} titles in Hawke's Bay (need to filter by location)")
            
            # Client-side filtering by bbox (since WFS bbox filter might not work)
            nearby_titles = []
            for t in titles[:100]:  # Limit to first 100
                geom_t = t.get('geometry')
                if geom_t:
                    # Check if geometry intersects our bbox (simplified check)
                    t_coords = geom_t['coordinates'][0][0]  # Get first point of polygon
                    t_lon, t_lat = t_coords[0], t_coords[1]
                    if min_lon <= t_lon <= max_lon and min_lat <= t_lat <= max_lat:
                        nearby_titles.append(t)
            
            print(f"Found {len(nearby_titles)} titles near the easement")
            
            if nearby_titles:
                # Get the first nearby title
                target_title = nearby_titles[0]
                t_props = target_title['properties']
                title_no = t_props.get('title_no')
                estate_desc = t_props.get('estate_description', '')
                
                print(f"\n{'='*80}")
                print("🎯 TARGET TITLE FOUND!")
                print(f"{'='*80}")
                print(f"Title Number: {title_no}")
                print(f"Estate Description: {estate_desc}")
                print(f"\nAssociated Easement:")
                print(f"  Appellation: {sample_easement['properties'].get('appellation')}")
                print(f"  Type: {sample_easement['properties'].get('parcel_intent')}")
                print(f"  Status: {sample_easement['properties'].get('status')}")
                print(f"  Affected Surveys: {sample_easement['properties'].get('affected_surveys')}")
                
                # Step 5: Get address for this title
                print(f"\n[STEP 5] Finding address for title {title_no}...")
                
                # We need to query the addresses layer
                # Get centroid of title geometry
                t_geom = target_title.get('geometry')
                if t_geom and t_geom['type'] == 'MultiPolygon':
                    coords = t_geom['coordinates'][0][0]
                    # Calculate centroid (simplified)
                    avg_lon = sum(c[0] for c in coords) / len(coords)
                    avg_lat = sum(c[1] for c in coords) / len(coords)
                    
                    print(f"Title centroid: {avg_lat:.6f}, {avg_lon:.6f}")
                    
                    # Query addresses near this point
                    params_addr = {
                        'service': 'WFS',
                        'version': '2.0.0',
                        'request': 'GetFeature',
                        'typeNames': 'data.linz.govt.nz:layer-123113',
                        'outputFormat': 'application/json',
                        'count': 5
                    }
                    
                    # Note: WFS doesn't support proximity search easily
                    # We'll get addresses and filter client-side
                    response_a = requests.get(base_url, params=params_addr, timeout=30)
                    if response_a.status_code == 200:
                        addr_data = response_a.json()
                        addresses = addr_data.get('features', [])
                        
                        # Find closest address (simplified: just check first few)
                        print(f"\nChecking {len(addresses)} addresses for match...")
                        
                        for addr in addresses[:20]:
                            a_props = addr['properties']
                            a_full = a_props.get('full_address', '')
                            
                            # Check if address is in same general area (same road name maybe)
                            # This is a heuristic - proper solution would use distance calculation
                            if title_no in str(a_props):
                                print(f"✅ Found matching address: {a_full}")
                                break
                        else:
                            # No direct match, use centroid to suggest manual lookup
                            print(f"⚠️  No direct address link found.")
                            print(f"Suggested: Search LINZ website for title {title_no}")
                            print(f"Or use coordinates: {avg_lat:.6f}, {avg_lon:.6f}")
                            
                            # Try reverse geocoding suggestion
                            print(f"\n💡 Manual lookup:")
                            print(f"   1. Go to https://www.linz.govt.nz/data/online-services/find-property-information")
                            print(f"   2. Search for title number: {title_no}")
                            print(f"   3. Or navigate to coordinates: {avg_lat:.6f}, {avg_lon:.6f}")
                
                # Save results
                output_file = Path(__file__).parent / 'test-title-with-easements.json'
                result = {
                    'title_number': title_no,
                    'estate_description': estate_desc,
                    'easements': [{
                        'appellation': sample_easement['properties'].get('appellation'),
                        'type': sample_easement['properties'].get('parcel_intent'),
                        'status': sample_easement['properties'].get('status'),
                        'affected_surveys': sample_easement['properties'].get('affected_surveys')
                    }],
                    'search_method': 'reverse_engineered_from_linear_parcels',
                    'next_step': 'Manual address lookup via LINZ website or use coordinates'
                }
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f, indent=2)
                print(f"\n💾 Results saved to: {output_file.name}")
                
                exit(0)  # Exit after finding first match

else:
    print("❌ Could not extract Lot/DP from appellation")
    print(f"Appellation was: {appellation}")
