"""
Due Diligence MVP - Fast Cached Property Title Queries

Uses SQLite cache for sub-second queries instead of fetching 95k records from LINZ API
"""

import sqlite3
import requests
import json
import sys
from datetime import datetime
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

# Configuration
DB_PATH = Path(__file__).parent / 'linz_titles_cache.db'
API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"
LAYER_ADDRESSES = "data.linz.govt.nz:layer-123113"

def get_api_key():
    """Read LINZ API key from file"""
    with open(API_KEY_FILE, 'r') as f:
        return f.read().strip()

def get_address_coordinates(address_number, road_name, suburb):
    """Query LINZ Addresses API for coordinates (this is still live API)"""
    api_key = get_api_key()
    base_url = BASE_WFS_URL.format(api_key)
    
    params = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': LAYER_ADDRESSES,
        'outputFormat': 'application/json',
        'srsName': 'EPSG:4326',
        'cql_filter': f"address_number={address_number} AND full_road_name='{road_name}' AND suburb_locality='{suburb}'"
    }
    
    response = requests.get(base_url, params=params, timeout=30)
    if response.status_code != 200:
        return None
    
    data = response.json()
    features = data.get('features', [])
    
    if not features:
        return None
    
    feature = features[0]
    coords = feature['geometry']['coordinates']
    props = feature.get('properties', {})
    
    return {
        'longitude': coords[0],
        'latitude': coords[1],
        'full_address': props.get('full_address'),
        'town_city': props.get('town_city')
    }

def query_title_by_bbox(conn, lat, lon):
    """
    Query cached titles using spatial index
    Returns all titles whose bounding box contains the point,
    ordered by smallest area (most precise match first)
    """
    cursor = conn.cursor()
    
    # Use R*Tree spatial index for ultra-fast bbox query
    # Order by bbox area (smallest first) to get most precise match
    cursor.execute('''
        SELECT pt.id, pt.title_no, pt.status, pt.type, pt.estate, 
               pt.guarantee_status, pt.land_district, pt.issue_date, 
               pt.number_owners, pt.title_id, pt.geometry_json,
               (pt.max_lon - pt.min_lon) * (pt.max_lat - pt.min_lat) as bbox_area
        FROM property_titles pt
        JOIN titles_spatial_index si ON pt.rowid = si.id
        WHERE ? BETWEEN si.min_lat AND si.max_lat
          AND ? BETWEEN si.min_lon AND si.max_lon
        ORDER BY bbox_area ASC
    ''', (lat, lon))
    
    results = []
    for row in cursor.fetchall():
        results.append({
            'id': row[0],
            'title_no': row[1],
            'status': row[2],
            'type': row[3],
            'estate': row[4],
            'guarantee_status': row[5],
            'land_district': row[6],
            'issue_date': row[7],
            'number_owners': row[8],
            'title_id': row[9],
            'geometry': json.loads(row[10]) if row[10] else None,
            'bbox_area': row[11]
        })
    
    return results

def query_title_by_address(address_number, road_name, suburb, use_cache=True):
    """
    Complete workflow: Address → Coordinates → Property Title
    
    Args:
        address_number: Street number (e.g., "31")
        road_name: Full road name (e.g., "Douglas McLean Avenue")
        suburb: Suburb name (e.g., "Marewa")
        use_cache: If True, use SQLite cache for titles (fast)
                   If False, fetch from LINZ API every time (slow)
    
    Returns:
        Dictionary with address and title information, or None if not found
    """
    print("=" * 60)
    print("DUE DILIGENCE MVP - Cached Query")
    print(f"Address: {address_number} {road_name}, {suburb}")
    print("=" * 60)
    
    # Step 1: Get coordinates (always live API)
    print("\n[STEP 1] Getting address coordinates...")
    addr_result = get_address_coordinates(address_number, road_name, suburb)
    
    if not addr_result:
        print("[FAIL] Could not find address")
        return None
    
    lat = addr_result['latitude']
    lon = addr_result['longitude']
    print(f"[OK] {lat:.6f}, {lon:.6f}")
    
    # Step 2: Query titles
    if use_cache:
        print(f"\n[STEP 2] Querying cached titles...")
        
        if not DB_PATH.exists():
            print("[ERROR] Cache database not found!")
            print("Run cache_manager.py first to build the cache.")
            return None
        
        conn = sqlite3.connect(DB_PATH)
        matching_titles = query_title_by_bbox(conn, lat, lon)
        conn.close()
        
        print(f"Found {len(matching_titles)} matching title(s)")
    else:
        # Fallback to old slow method
        print("\n[STEP 2] Fetching from LINZ API (SLOW - consider building cache)...")
        from test_working_query import fetch_titles_live
        matching_titles = fetch_titles_live(lat, lon)
    
    if not matching_titles:
        print("[WARN] No titles found at this location")
        return {
            'address': addr_result,
            'title': None,
            'message': 'No matching property title found'
        }
    
    # Use first match (typically only one)
    best_match = matching_titles[0]
    
    print(f"\n[SUCCESS] Found: {best_match['title_no']}")
    
    # Display results
    print("\n" + "=" * 60)
    print("PROPERTY TITLE DETAILS")
    print("=" * 60)
    print(f"Title Number:      {best_match['title_no']}")
    print(f"Status:            {best_match['status']}")
    print(f"Type:              {best_match['type']}")
    print(f"Estate:            {best_match['estate']}")
    print(f"Guarantee Status:  {best_match['guarantee_status']}")
    print(f"Land District:     {best_match['land_district']}")
    print(f"Issue Date:        {best_match['issue_date']}")
    print(f"Number of Owners:  {best_match['number_owners']}")
    
    # Prepare result
    result = {
        'address': addr_result,
        'title': best_match,
        'query_timestamp': str(datetime.now())
    }
    
    # Save JSON output
    output_file = Path(__file__).parent / 'due-diligence-result.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)
    print(f"\n[SAVED] {output_file.name}")
    
    return result

if __name__ == '__main__':
    from datetime import datetime
    
    # Test with our known address
    result = query_title_by_address(
        address_number='31',
        road_name='Douglas McLean Avenue',
        suburb='Marewa',
        use_cache=True
    )
    
    if result and result.get('title'):
        print(f"\n✅ Query successful: {result['title']['title_no']}")
        print("Cache is working perfectly!")
    else:
        print("\n⚠️  Query returned no results")
        print("Make sure you've built the cache with cache_manager.py first")
