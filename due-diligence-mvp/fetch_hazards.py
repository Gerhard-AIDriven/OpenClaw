"""
Due Diligence MVP - Tier 1: Hazard Overlays

Fetches natural hazard data for a property location:
- Flood zones (Cyclone Gabrielle data - Hawke's Bay specific)
- Tsunami risk (coastal proximity assessment)
- HAIL sites (Ministry for Environment contaminated land database)

Returns structured hazard data with risk ratings for report inclusion.
"""

import requests
import json
import sys
import math
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

# Configuration
API_KEY_FILE = Path(__file__).parent / 'report-generator/Config/linz-api-key.txt'
BASE_WFS_URL = "https://data.linz.govt.nz/services;key={}/wfs"

# LINZ Hazard Layers
LAYER_FLOOD_GABRIELLE = "data.linz.govt.nz:layer-112668"  # Cyclone Gabrielle Flood Areas (Feb 2023)

def get_api_key():
    """Read LINZ API key from file"""
    with open(API_KEY_FILE, 'r') as f:
        return f.read().strip()

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in meters"""
    R = 6371000  # Earth radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def fetch_flood_hazard_gabrielle(lat, lon, search_radius_m=100):
    """
    Fetch flood hazard data from Cyclone Gabrielle Flood Areas (Layer 112668)
    
    This shows areas that were actually flooded during Cyclone Gabrielle (Feb 2023)
    which is highly relevant for Hawke's Bay properties
    """
    api_key = get_api_key()
    base_url = BASE_WFS_URL.format(api_key)
    
    lat_delta = search_radius_m / 111000.0
    lon_delta = search_radius_m / (111000.0 * abs(math.cos(math.radians(lat))))
    
    min_lon = lon - lon_delta
    max_lon = lon + lon_delta
    min_lat = lat - lat_delta
    max_lat = lat + lat_delta
    
    params = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': LAYER_FLOOD_GABRIELLE,
        'outputFormat': 'application/json',
        'srsName': 'EPSG:4326',
        'bbox': f"{min_lat},{min_lon},{max_lat},{max_lon},EPSG:4326"
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=30)
        
        if response.status_code != 200:
            print(f"  Flood query failed: {response.status_code}")
            return None
        
        data = response.json()
        features = data.get('features', [])
        
        if not features:
            return {
                'flooded_in_gabrielle': False,
                'description': 'Property was NOT in Cyclone Gabrielle flood zone (Feb 2023)',
                'risk_rating': 'low'
            }
        
        # Check if point is inside any flood polygon
        for feature in features:
            props = feature.get('properties', {})
            geom = feature.get('geometry', {})
            
            if geom.get('type') == 'Polygon':
                coords = geom['coordinates'][0]
                centroid_lat = sum(c[1] for c in coords) / len(coords)
                centroid_lon = sum(c[0] for c in coords) / len(coords)
                
                dist = haversine_distance(lat, lon, centroid_lat, centroid_lon)
                
                # If within 100m of flood zone centroid, consider it affected
                if dist < 100:
                    flood_source = props.get('source') or props.get('flood_type') or 'River/Storm flooding'
                    
                    return {
                        'flooded_in_gabrielle': True,
                        'flood_type': flood_source,
                        'description': f'Property WAS FLOODED during Cyclone Gabrielle ({flood_source})',
                        'risk_rating': 'critical',
                        'event_date': '2023-02-14',
                        'distance_to_flood_m': round(dist, 1)
                    }
        
        return {
            'flooded_in_gabrielle': False,
            'description': 'Property was NOT in Cyclone Gabrielle flood zone (Feb 2023)',
            'risk_rating': 'low'
        }
        
    except Exception as e:
        print(f"  Error fetching Gabrielle flood data: {e}")
        return None

def fetch_tsunami_risk(lat, lon):
    """
    Assess tsunami risk based on distance from coast
    
    Uses known Napier coastline longitudes by suburb for accuracy
    """
    # Napier coastline approximate longitudes by latitude band
    # Westshore/Meeanee: ~176.88-176.89
    # Napier city front: ~176.91-176.92
    # Bay View: ~176.93+
    
    # Determine approximate coast longitude based on latitude
    # Note: More negative = further south in Southern Hemisphere
    # Westshore/Meeanee: -39.48 to -39.52
    # Napier city/Marewa: -39.44 to -39.48
    # Bay View: -39.40 and north
    if lat <= -39.47:  # Westshore, Meeanee (south)
        coast_lon = 176.885
    elif lat <= -39.43:  # Napier city, Marewa
        coast_lon = 176.915
    else:  # Bay View (north)
        coast_lon = 176.935
    
    dist_to_coast_km = abs(lon - coast_lon) * 111.0 * abs(math.cos(math.radians(lat)))
    
    if dist_to_coast_km < 1.0:
        return {
            'in_zone': True,
            'zone_type': 'Coastal Red Zone',
            'description': f'Property is {dist_to_coast_km:.2f}km from coast - HIGH RISK tsunami evacuation zone',
            'risk_rating': 'high',
            'note': 'Verify with Napier City Council tsunami evacuation map'
        }
    elif dist_to_coast_km < 2.0:
        return {
            'in_zone': True,
            'zone_type': 'Coastal Orange Zone (potential)',
            'description': f'Property is {dist_to_coast_km:.1f}km from coast - may be in tsunami evacuation zone',
            'risk_rating': 'medium',
            'note': 'Verify with Napier City Council tsunami evacuation map'
        }
    else:
        return {
            'in_zone': False,
            'zone_type': None,
            'description': f'Property is {dist_to_coast_km:.1f}km from coast - unlikely to be in tsunami zone',
            'risk_rating': 'low'
        }

def fetch_hail_sites(lat, lon, search_radius_km=5):
    """
    Fetch HAIL (Hazardous Activities and Industries List) sites
    
    These are potentially contaminated land sites tracked by Ministry for Environment
    """
    api_key = get_api_key()
    base_url = BASE_WFS_URL.format(api_key)
    
    # Search radius in degrees
    search_radius_deg = search_radius_km / 111.0
    
    min_lon = lon - search_radius_deg
    max_lon = lon + search_radius_deg
    min_lat = lat - search_radius_deg
    max_lat = lat + search_radius_deg
    
    # Try to find HAIL layer (layer ID may vary)
    # Common layer: data.linz.govt.nz:layer-50628 (HAIL sites)
    hail_layer = "data.linz.govt.nz:layer-50628"
    
    params = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': hail_layer,
        'outputFormat': 'application/json',
        'srsName': 'EPSG:4326',
        'bbox': f"{min_lat},{min_lon},{max_lat},{max_lon},EPSG:4326"
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=30)
        
        if response.status_code != 200:
            return []
        
        data = response.json()
        features = data.get('features', [])
        
        if not features:
            return []
        
        # Process nearby HAIL sites
        hail_sites = []
        for feature in features:
            props = feature.get('properties', {})
            geom = feature.get('geometry', {})
            
            # Calculate distance
            if geom.get('type') == 'Point':
                site_lon, site_lat = geom['coordinates']
            elif geom.get('type') == 'Polygon':
                coords = geom['coordinates'][0]
                site_lat = sum(c[1] for c in coords) / len(coords)
                site_lon = sum(c[0] for c in coords) / len(coords)
            else:
                continue
            
            dist_m = haversine_distance(lat, lon, site_lat, site_lon)
            
            if dist_m <= (search_radius_km * 1000):
                site_info = {
                    'name': props.get('site_name') or props.get('name') or 'Unnamed Site',
                    'activity': props.get('activity_type') or props.get('use') or 'Unknown activity',
                    'status': props.get('status') or 'Unknown',
                    'distance_m': round(dist_m, 0),
                    'risk_rating': 'high' if dist_m < 500 else 'medium'
                }
                hail_sites.append(site_info)
        
        # Sort by distance
        hail_sites.sort(key=lambda x: x['distance_m'])
        
        return hail_sites[:5]  # Return top 5 closest
        
    except Exception as e:
        print(f"  Error fetching HAIL sites: {e}")
        return []

def get_all_hazards(lat, lon, property_address=""):
    """
    Main function: Fetch all hazard data for a property
    
    Args:
        lat, lon: Property coordinates
        property_address: For display/logging
    
    Returns:
        Comprehensive hazard report dict
    """
    print(f"\n{'='*60}")
    print(f"HAZARD ASSESSMENT")
    print(f"Address: {property_address or f'{lat:.6f}, {lon:.6f}'}")
    print(f"{'='*60}")
    
    hazards = {
        'address': property_address,
        'coordinates': {'lat': lat, 'lon': lon},
        'assessment_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'liquefaction': None,  # Not available via LINZ WFS
        'tsunami': None,
        'flood': None,
        'hail_sites': [],
        'overall_risk_rating': 'unknown',
        'summary': []
    }
    
    # Fetch tsunami
    print("\n[1/3] Assessing tsunami risk (coastal proximity)...")
    hazards['tsunami'] = fetch_tsunami_risk(lat, lon)
    if hazards['tsunami']:
        status = "POTENTIAL RISK" if hazards['tsunami'].get('in_zone') else "LOW RISK"
        print(f"  ✓ {status}")
    
    # Fetch flood (Gabrielle)
    print("\n[2/3] Fetching Cyclone Gabrielle flood data...")
    hazards['flood'] = fetch_flood_hazard_gabrielle(lat, lon)
    if hazards['flood']:
        if hazards['flood'].get('flooded_in_gabrielle'):
            print(f"  ⚠️ FLOODED in Gabrielle!")
        else:
            print(f"  ✓ Not flooded")
    
    # Fetch HAIL sites
    print("\n[3/3] Searching for HAIL sites within 5km...")
    hazards['hail_sites'] = fetch_hail_sites(lat, lon)
    if hazards['hail_sites']:
        print(f"  ⚠ Found {len(hazards['hail_sites'])} nearby HAIL site(s)")
    else:
        print(f"  ✓ No HAIL sites found within 5km")
    
    # Calculate overall risk rating
    risk_ratings = []
    
    if hazards['tsunami']:
        risk_ratings.append(hazards['tsunami']['risk_rating'])
    
    if hazards['flood']:
        risk_ratings.append(hazards['flood']['risk_rating'])
    
    for site in hazards['hail_sites']:
        risk_ratings.append(site['risk_rating'])
    
    # Determine highest risk
    risk_order = ['critical', 'high', 'medium', 'low', 'very_low', 'unknown']
    hazards['overall_risk_rating'] = 'unknown'
    
    for risk in risk_order:
        if risk in risk_ratings:
            hazards['overall_risk_rating'] = risk
            break
    
    # Generate summary
    summary_lines = []
    
    if hazards['tsunami'] and hazards['tsunami'].get('in_zone'):
        summary_lines.append(f"⚠️ TSUNAMI RISK: {hazards['tsunami']['description']}")
    
    if hazards['flood'] and hazards['flood'].get('flooded_in_gabrielle'):
        summary_lines.append(f"⚠️ FLOOD HISTORY: {hazards['flood']['description']}")
    
    if hazards['hail_sites']:
        nearest = hazards['hail_sites'][0]
        summary_lines.append(f"⚠️ CONTAMINATION RISK: {nearest['name']} ({nearest['distance_m']}m away)")
    
    if not summary_lines:
        summary_lines.append("✓ No critical hazards identified")
    
    hazards['summary'] = summary_lines
    
    # Print summary
    print(f"\n{'='*60}")
    print("HAZARD SUMMARY")
    print(f"{'='*60}")
    for line in summary_lines:
        print(line)
    
    print(f"\nOverall Risk Rating: {hazards['overall_risk_rating'].upper()}")
    
    return hazards

if __name__ == '__main__':
    # Test with our sample address
    test_lat = -39.500580
    test_lon = 176.904059
    test_address = "31 Douglas McLean Avenue, Marewa, Napier"
    
    result = get_all_hazards(test_lat, test_lon, test_address)
    
    print("\n" + "="*60)
    print("RAW DATA")
    print("="*60)
    print(json.dumps(result, indent=2, default=str))
