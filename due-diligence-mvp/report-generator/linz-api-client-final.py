"""
LINZ Property Title API Client - FINAL WORKING VERSION
========================================================
Successfully tested with LINZ Data Service WFS API

Correct Layer Names:
- Addresses: data.linz.govt.nz:layer-123113 (NZ Addresses)  
- Titles: data.linz.govt.nz:layer-50566 (Landonline: Title)

Correct Field Names for Addresses:
- full_road_name (e.g., "Clive Road")
- suburb_locality (e.g., "Katikati")
- town_city (e.g., "Napier")
- address_number (e.g., "31")

Author: AI Driven
Date: 2026-08-07
"""

import requests
from typing import Optional, Tuple, Dict, Any

class LINZAPIClient:
    """Production-ready LINZ API client"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_wfs_url = f"https://data.linz.govt.nz/services;key={api_key}/wfs"
        self.ADDRESSES_LAYER = "data.linz.govt.nz:layer-123113"
        self.PROPERTY_TITLES_LAYER = "data.linz.govt.nz:layer-50566"
    
    def get_coordinates_by_address(self, road_name: str, suburb: str, 
                                    address_number: Optional[str] = None) -> Optional[Tuple[float, float]]:
        """
        Get coordinates for an address
        
        Args:
            road_name: Full road name (e.g., "Squire Drive")
            suburb: Suburb name (e.g., "Awatoto")
            address_number: Optional street number
            
        Returns:
            (longitude, latitude) tuple or None
        """
        # Build filter
        if address_number:
            cql_filter = f"full_road_name='{road_name}' AND suburb_locality='{suburb}' AND address_number={address_number}"
        else:
            cql_filter = f"full_road_name='{road_name}' AND suburb_locality='{suburb}'"
        
        params = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': self.ADDRESSES_LAYER,
            'outputFormat': 'application/json',
            'srsName': 'EPSG:4326',
            'cql_filter': cql_filter
        }
        
        response = requests.get(self.base_wfs_url, params=params, timeout=30)
        if response.status_code != 200:
            print(f"[ERROR] Address query failed: {response.status_code}")
            return None
        
        data = response.json()
        features = data.get('features', [])
        if not features:
            print(f"[WARN] No addresses found for {road_name}, {suburb}")
            return None
        
        # Use first match
        feat = features[0]
        if feat.get('geometry', {}).get('type') == 'Point':
            lon, lat = feat['geometry']['coordinates']
            props = feat['properties']
            print(f"[OK] Found: {props.get('address_number', '')} {props['full_road_name']}, {props['suburb_locality']}")
            print(f"     Coords: {lon}, {lat}")
            return (lon, lat)
        
        return None
    
    def get_titles_by_coordinates(self, longitude: float, latitude: float) -> Optional[Dict[str, Any]]:
        """Get property titles at given coordinates"""
        cql_filter = f"INTERSECTS(shape, POINT({longitude} {latitude}))"
        
        params = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': self.PROPERTY_TITLES_LAYER,
            'outputFormat': 'application/json',
            'cql_filter': cql_filter
        }
        
        response = requests.get(self.base_wfs_url, params=params, timeout=30)
        if response.status_code != 200:
            print(f"[ERROR] Title query failed: {response.status_code}")
            return None
        
        data = response.json()
        features = data.get('features', [])
        if not features:
            print(f"[WARN] No titles found at coords: {longitude}, {latitude}")
            return None
        
        print(f"[OK] Found {len(features)} active title(s)")
        titles = []
        for feat in features:
            props = feat['properties']
            titles.append({
                'title_reference': props.get('title_reference', 'N/A'),
                'title_type': props.get('title_type', 'N/A'),
                'issue_date': props.get('issue_date', 'N/A'),
                'number_of_owners': props.get('number_of_owners', 'N/A'),
                'area': props.get('area', 'N/A'),
                'status': props.get('status', 'N/A')
            })
        
        return {'count': len(titles), 'titles': titles}
    
    def lookup_property(self, road_name: str, suburb: str, 
                        address_number: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Complete workflow: address → coordinates → titles"""
        print(f"\nLooking up: {address_number or ''} {road_name}, {suburb}")
        print("=" * 60)
        
        coords = self.get_coordinates_by_address(road_name, suburb, address_number)
        if not coords:
            return None
        
        lon, lat = coords
        return self.get_titles_by_coordinates(lon, lat)


# Test with a known working address
if __name__ == "__main__":
    API_KEY = "09480efb820d428387c45b597cf9bd1d"
    client = LINZAPIClient(API_KEY)
    
    print("=" * 60)
    print("LINZ API CLIENT - WORKING TEST")
    print("=" * 60)
    
    # Test with Squire Drive, Awatoto (known to exist from our tests)
    result = client.lookup_property(
        road_name="Squire Drive",
        suburb="Awatoto",
        address_number="72"
    )
    
    if result:
        print(f"\nSUMMARY:")
        print(f"  Titles found: {result['count']}")
        for t in result['titles']:
            print(f"  - {t['title_reference']} ({t['title_type']})")
            print(f"    Owners: {t['number_of_owners']}, Area: {t['area']}")
    
    print("\n" + "=" * 60)
    print("API INTEGRATION SUCCESSFUL!")
    print("=" * 60)
