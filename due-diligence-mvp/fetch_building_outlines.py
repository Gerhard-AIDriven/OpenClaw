"""
Due Diligence MVP - Tier 1: Building Outlines

Fetches building footprint data from LINZ Layer 51604
Calculates floor area, extracts construction details if available
"""

import requests
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

# Configuration
API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"
LAYER_BUILDINGS = "data.linz.govt.nz:layer-50246"  # NZ Building Polygons (Topo, 1:50k)

def get_api_key():
    """Read LINZ API key from file"""
    with open(API_KEY_FILE, 'r') as f:
        return f.read().strip()

def fetch_building_outlines(lat, lon, radius_meters=50):
    """
    Fetch building outlines near a coordinate
    
    Args:
        lat, lon: Center point coordinates
        radius_meters: Search radius (default 50m)
    
    Returns:
        List of building features with geometry and properties
    """
    import math
    
    api_key = get_api_key()
    base_url = BASE_WFS_URL.format(api_key)
    
    # Create bounding box around point
    # Approximate: 1 degree ≈ 111km
    lat_delta = radius_meters / 111000.0
    lon_delta = radius_meters / (111000.0 * abs(math.cos(math.radians(lat))))
    
    min_lon = lon - lon_delta
    max_lon = lon + lon_delta
    min_lat = lat - lat_delta
    max_lat = lat + lat_delta
    
    # Use BBOX filter with correct LINZ syntax
    params = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': LAYER_BUILDINGS,
        'outputFormat': 'application/json',
        'srsName': 'EPSG:4326'
    }
    
    # Add bbox parameter instead of cql_filter
    params['bbox'] = f"{min_lat},{min_lon},{max_lat},{max_lon},EPSG:4326"
    
    try:
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        features = data.get('features', [])
        
        print(f"Found {len(features)} building(s) within {radius_meters}m")
        
        return features
        
    except Exception as e:
        print(f"Error fetching buildings: {e}")
        return []

def calculate_building_area(geometry):
    """
    Calculate building footprint area in m²
    
    Uses simple planar approximation (good enough for small buildings)
    For more accuracy, use pyproj/geodesic calculations
    """
    import math
    
    geom_type = geometry.get('type')
    coords = geometry.get('coordinates', [])
    
    if not coords:
        return None
    
    # Handle MultiPolygon
    if geom_type == 'MultiPolygon':
        # Sum areas of all polygons
        total_area = 0
        for polygon_coords in coords:
            ring_coords = polygon_coords[0]  # Exterior ring
            total_area += _calculate_polygon_area(ring_coords)
        return total_area
    
    elif geom_type == 'Polygon':
        ring_coords = coords[0]  # Exterior ring
        return _calculate_polygon_area(ring_coords)
    
    return None

def _calculate_polygon_area(coords):
    """
    Calculate polygon area using Shoelace formula
    Coordinates are in WGS84, convert to approximate meters
    """
    import math
    
    if len(coords) < 3:
        return 0
    
    # Get centroid for conversion factor
    avg_lat = sum(c[1] for c in coords) / len(coords)
    
    # Conversion factors (meters per degree)
    lat_factor = 111320  # Approximately constant
    lon_factor = 111320 * math.cos(math.radians(avg_lat))
    
    # Convert to local Cartesian coordinates
    x = [(c[0] - coords[0][0]) * lon_factor for c in coords]
    y = [(c[1] - coords[0][1]) * lat_factor for c in coords]
    
    # Shoelace formula
    area = 0
    n = len(x)
    for i in range(n):
        j = (i + 1) % n
        area += x[i] * y[j]
        area -= x[j] * y[i]
    
    return abs(area) / 2.0

def extract_building_info(feature):
    """
    Extract useful information from building feature
    
    Returns dict with:
    - floor_area_m2
    - decade_built (if available)
    - construction_type (if available)
    - roof_material (if available)
    - wall_material (if available)
    """
    props = feature.get('properties', {})
    geometry = feature.get('geometry')
    
    info = {
        'floor_area_m2': None,
        'decade_built': None,
        'construction_type': None,
        'roof_material': None,
        'wall_material': None,
        'building_use': None,
        'storeys': None
    }
    
    # Calculate floor area from geometry
    if geometry:
        info['floor_area_m2'] = calculate_building_area(geometry)
    
    # Extract properties (field names may vary - check LINZ schema)
    # Common fields in LINZ building data:
    if 'built' in props or 'year_built' in props:
        year = props.get('built') or props.get('year_built')
        if year:
            decade = (year // 10) * 10
            info['decade_built'] = f"{decade}s"
    
    if 'use' in props or 'building_use' in props:
        info['building_use'] = props.get('use') or props.get('building_use')
    
    if 'storeys' in props or 'number_storeys' in props:
        info['storeys'] = props.get('storeys') or props.get('number_storeys')
    
    # Construction materials (may not be available in all datasets)
    if 'roof_material' in props:
        info['roof_material'] = props['roof_material']
    
    if 'wall_material' in props:
        info['wall_material'] = props['wall_material']
    
    return info

def find_primary_building(buildings, lat, lon):
    """
    Find the primary/main building on the property
    
    Strategy:
    1. Calculate distance from address point to each building centroid
    2. Return closest building (usually the main house)
    """
    import math
    
    if not buildings:
        return None, None
    
    def distance_to_centroid(feature):
        geom = feature.get('geometry', {})
        coords = geom.get('coordinates', [])
        
        if geom.get('type') == 'Polygon':
            ring = coords[0]
            centroid_lon = sum(c[0] for c in ring) / len(ring)
            centroid_lat = sum(c[1] for c in ring) / len(ring)
            
            # Haversine distance (approximate)
            dlat = math.radians(centroid_lat - lat)
            dlon = math.radians(centroid_lon - lon)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(centroid_lat)) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            return c * 6371000  # meters
        
        return float('inf')
    
    # Sort by distance
    buildings_sorted = sorted(buildings, key=distance_to_centroid)
    
    # Return closest building
    primary = buildings_sorted[0]
    info = extract_building_info(primary)
    
    return primary, info

def get_building_data(lat, lon, radius_meters=50):
    """
    Main function: Get all building data for a property
    
    Args:
        lat, lon: Property coordinates
        radius_meters: Search radius
    
    Returns:
        Dict with primary building info and all buildings list
    """
    import math
    
    print(f"\n[STEP] Fetching building outlines...")
    
    # Fetch buildings
    buildings = fetch_building_outlines(lat, lon, radius_meters)
    
    if not buildings:
        return {
            'primary_building': None,
            'all_buildings': [],
            'total_floor_area_m2': 0,
            'message': 'No buildings found at this location'
        }
    
    # Find primary building
    primary, primary_info = find_primary_building(buildings, lat, lon)
    
    # Calculate total floor area (all buildings)
    total_area = 0
    for b in buildings:
        info = extract_building_info(b)
        if info['floor_area_m2']:
            total_area += info['floor_area_m2']
    
    result = {
        'primary_building': primary_info,
        'all_buildings': [extract_building_info(b) for b in buildings],
        'total_floor_area_m2': round(total_area, 1),
        'building_count': len(buildings),
        'message': f"Found {len(buildings)} building(s)"
    }
    
    # Display summary
    if primary_info and primary_info.get('floor_area_m2'):
        print(f"✅ Primary building: {primary_info['floor_area_m2']:.0f} m²")
        if primary_info.get('decade_built'):
            print(f"   Decade built: {primary_info['decade_built']}")
        if primary_info.get('building_use'):
            print(f"   Use: {primary_info['building_use']}")
    
    return result

if __name__ == '__main__':
    import math
    
    # Test with our sample address
    print("=" * 60)
    print("BUILDING OUTLINES TEST")
    print("31 Douglas McLean Avenue, Marewa, Napier")
    print("=" * 60)
    
    # Coordinates from our previous test
    lat = -39.500580
    lon = 176.904059
    
    result = get_building_data(lat, lon)
    
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(json.dumps(result, indent=2))
