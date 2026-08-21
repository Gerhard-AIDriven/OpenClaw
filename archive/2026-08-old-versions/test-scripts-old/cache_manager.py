"""
Due Diligence MVP - LINZ Property Titles Cache Manager

Handles:
1. Initial download of all NZ property titles from LINZ WFS
2. Storage in SQLite with spatial indexing
3. Incremental updates
4. Fast cached queries
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
LAYER_TITLES = "data.linz.govt.nz:layer-50804"

def get_api_key():
    """Read LINZ API key from file"""
    with open(API_KEY_FILE, 'r') as f:
        return f.read().strip()

def init_database():
    """Create database schema with spatial indexing"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable spatialite-like features using R*Tree for bbox indexing
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS property_titles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title_no TEXT UNIQUE NOT NULL,
            status TEXT,
            type TEXT,
            estate TEXT,
            guarantee_status TEXT,
            land_district TEXT,
            issue_date TEXT,
            number_owners INTEGER,
            title_id TEXT,
            min_lon REAL NOT NULL,
            max_lon REAL NOT NULL,
            min_lat REAL NOT NULL,
            max_lat REAL NOT NULL,
            geometry_json TEXT,
            last_updated TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes for fast querying
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_district ON property_titles(land_district)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_title_no ON property_titles(title_no)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_issue_date ON property_titles(issue_date)')
    
    # R*Tree for spatial bounding box queries (much faster than regular indexes)
    cursor.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS titles_spatial_index USING rtree(
            id,              -- integer primary key
            min_lon, max_lon,  -- longitude range
            min_lat, max_lat   -- latitude range
        )
    ''')
    
    # Metadata table for tracking updates
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cache_metadata (
            key TEXT PRIMARY KEY,
            value TEXT,
            last_updated TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    return conn

def fetch_all_titles(api_key, land_district=None):
    """
    Fetch property titles from LINZ WFS
    If land_district is specified, fetch only that district
    Otherwise fetch ALL NZ titles (may take several minutes)
    """
    base_url = BASE_WFS_URL.format(api_key)
    
    params = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': LAYER_TITLES,
        'outputFormat': 'application/json'
    }
    
    if land_district:
        params['cql_filter'] = f"land_district = '{land_district}'"
        print(f"Fetching titles for: {land_district}")
    else:
        print("Fetching ALL New Zealand property titles (this may take 5-10 minutes)...")
    
    all_features = []
    start_index = 0
    batch_size = 1000
    
    while True:
        params['startIndex'] = start_index
        params['count'] = batch_size
        
        try:
            response = requests.get(base_url, params=params, timeout=120)
            response.raise_for_status()
            
            data = response.json()
            features = data.get('features', [])
            
            if not features:
                break
            
            all_features.extend(features)
            start_index += batch_size
            
            if len(features) < batch_size:
                break
                
            print(f"  Fetched {start_index} titles...")
            
        except Exception as e:
            print(f"Error fetching batch at index {start_index}: {e}")
            break
    
    print(f"Total titles fetched: {len(all_features)}")
    return all_features

def extract_bbox(geometry):
    """Extract bounding box from GeoJSON geometry"""
    if not geometry:
        return None
    
    geom_type = geometry.get('type')
    coords = geometry.get('coordinates', [])
    
    if not coords:
        return None
    
    # Handle MultiPolygon
    if geom_type == 'MultiPolygon':
        coords = coords[0][0]  # First polygon, exterior ring
    elif geom_type == 'Polygon':
        coords = coords[0]  # Exterior ring
    else:
        return None
    
    if not coords or len(coords) == 0:
        return None
    
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    
    return {
        'min_lon': min(lons),
        'max_lon': max(lons),
        'min_lat': min(lats),
        'max_lat': max(lats)
    }

def store_titles(conn, features):
    """Store features in SQLite database"""
    cursor = conn.cursor()
    
    inserted = 0
    updated = 0
    skipped = 0
    
    for feature in features:
        props = feature.get('properties', {})
        geometry = feature.get('geometry')
        
        title_no = props.get('title_no')
        if not title_no:
            skipped += 1
            continue
        
        # Extract bounding box
        bbox = extract_bbox(geometry)
        if not bbox:
            skipped += 1
            continue
        
        # Prepare data
        data = {
            'title_no': title_no,
            'status': props.get('status'),
            'type': props.get('type'),
            'estate': props.get('estate_description'),
            'guarantee_status': props.get('guarantee_status'),
            'land_district': props.get('land_district'),
            'issue_date': props.get('issue_date'),
            'number_owners': props.get('number_owners'),
            'title_id': props.get('id'),
            'min_lon': bbox['min_lon'],
            'max_lon': bbox['max_lon'],
            'min_lat': bbox['min_lat'],
            'max_lat': bbox['max_lat'],
            'geometry_json': json.dumps(geometry, ensure_ascii=False)
        }
        
        # Insert or update
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO property_titles 
                (title_no, status, type, estate, guarantee_status, land_district, 
                 issue_date, number_owners, title_id, 
                 min_lon, max_lon, min_lat, max_lat, geometry_json, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (
                data['title_no'], data['status'], data['type'], data['estate'],
                data['guarantee_status'], data['land_district'], data['issue_date'],
                data['number_owners'], data['title_id'],
                data['min_lon'], data['max_lon'], data['min_lat'], data['max_lat'],
                data['geometry_json']
            ))
            
            # Update spatial index
            cursor.execute('''
                INSERT OR REPLACE INTO titles_spatial_index 
                (id, min_lon, max_lon, min_lat, max_lat)
                VALUES (last_insert_rowid(), ?, ?, ?, ?)
            ''', (data['min_lon'], data['max_lon'], data['min_lat'], data['max_lat']))
            
            inserted += 1
            
        except Exception as e:
            print(f"Error storing title {title_no}: {e}")
            skipped += 1
        
        # Progress indicator every 1000 records
        if inserted % 1000 == 0:
            print(f"  Stored {inserted} titles...")
    
    conn.commit()
    
    print(f"\nDatabase update complete:")
    print(f"  Inserted/Updated: {inserted}")
    print(f"  Skipped: {skipped}")
    
    return inserted

def update_cache_metadata(conn, key, value):
    """Update metadata table"""
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO cache_metadata (key, value, last_updated)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    ''', (key, value))
    conn.commit()

def get_cache_metadata(conn, key):
    """Retrieve metadata value"""
    cursor = conn.cursor()
    cursor.execute('SELECT value FROM cache_metadata WHERE key = ?', (key,))
    result = cursor.fetchone()
    return result[0] if result else None

def build_cache(api_key, land_district=None):
    """Main function to build or update the cache"""
    print("=" * 60)
    print("LINZ Property Titles Cache Builder")
    print("=" * 60)
    
    # Initialize database
    print("\nInitializing database...")
    conn = init_database()
    
    # Fetch titles
    print("\nFetching titles from LINZ...")
    features = fetch_all_titles(api_key, land_district)
    
    if not features:
        print("No titles fetched. Aborting.")
        conn.close()
        return False
    
    # Store in database
    print("\nStoring titles in SQLite cache...")
    count = store_titles(conn, features)
    
    # Update metadata
    update_cache_metadata(conn, 'last_full_update', datetime.now().isoformat())
    update_cache_metadata(conn, 'total_titles', str(count))
    
    if land_district:
        update_cache_metadata(conn, f'district_{land_district}_updated', datetime.now().isoformat())
    else:
        update_cache_metadata(conn, 'nz_total_titles', str(count))
    
    conn.close()
    
    print("\n" + "=" * 60)
    print("Cache build complete!")
    print(f"Database: {DB_PATH}")
    print("=" * 60)
    
    return True

if __name__ == '__main__':
    api_key = get_api_key()
    
    # Option 1: Build full NZ cache (slow, one-time)
    # build_cache(api_key)
    
    # Option 2: Build cache for specific district (faster, for testing)
    build_cache(api_key, land_district='Hawkes Bay')
    
    # Usage after building cache:
    # from cache_manager import query_title_by_address
    # result = query_title_by_address(-39.50058, 176.904059)
