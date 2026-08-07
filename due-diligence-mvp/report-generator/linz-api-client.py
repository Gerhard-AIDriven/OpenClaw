"""LINZ API Client - Windows-compatible version (no emoji in print statements)"""

import requests
import json
from typing import Optional, Tuple, Dict, Any


class LINZAPIClient:
    """Client for LINZ Data Service WFS API"""
    
    def __init__(self, api_key: str):
        """
        Initialize LINZ API client
        
        Args:
            api_key: LINZ Data Service API key
        """
        self.api_key = api_key
        self.base_wfs_url = f"https://data.linz.govt.nz/services;key={api_key}/wfs"
        
        # Layer IDs (correct format from LINZ WFS Capabilities)
        self.ADDRESSES_LAYER = "data.linz.govt.nz:layer-123113"  # NZ Addresses
        self.PROPERTY_TITLES_LAYER = "data.linz.govt.nz:layer-50566"  # Landonline: Title
        
    def get_address_coordinates(self, address_number: str, road_name: str, 
                                 suburb_locality: Optional[str] = None,
                                 city: Optional[str] = None) -> Optional[Tuple[float, float]]:
        """
        Step 1: Query NZ Addresses layer to get coordinates for a street address
        
        Args:
            address_number: Street number (e.g., "28")
            road_name: Road name (e.g., "STANLEY STREET")
            suburb_locality: Suburb name (e.g., "PARNELL") - optional but recommended
            city: City name (e.g., "AUCKLAND") - optional
            
        Returns:
            Tuple of (longitude, latitude) if found, None otherwise
        """
        # Build CQL filter
        cql_parts = [
            f"address_number={address_number}",
            f"full_road_name='{road_name}'"
        ]
        
        if suburb_locality:
            cql_parts.append(f"suburb_locality='{suburb_locality}'")
        
        if city:
            cql_parts.append(f"city='{city}'")
        
        cql_filter = " AND ".join(cql_parts)
        
        # Query parameters
        params = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': self.ADDRESSES_LAYER,
            'outputFormat': 'application/json',
            'srsName': 'EPSG:4326',  # WGS84 Lat/Lon
            'cql_filter': cql_filter
        }
        
        try:
            response = requests.get(self.base_wfs_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get('features') or len(data['features']) == 0:
                print(f"[ERROR] No address found for: {address_number} {road_name}, {suburb_locality or ''}")
                return None
            
            # Extract coordinates from first matching feature
            feature = data['features'][0]
            geometry = feature.get('geometry', {})
            
            if geometry.get('type') == 'Point':
                lon, lat = geometry['coordinates']
                print(f"[OK] Address found: {lon}, {lat}")
                return (lon, lat)
            else:
                print(f"[WARN] Unexpected geometry type: {geometry.get('type')}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Error querying addresses: {e}")
            return None
        except (KeyError, IndexError, ValueError) as e:
            print(f"[ERROR] Error parsing address response: {e}")
            return None
    
    def get_property_titles_by_coordinates(self, longitude: float, latitude: float) -> Optional[Dict[str, Any]]:
        """
        Step 2: Query NZ Property Titles layer using coordinates
        
        Args:
            longitude: Longitude (X coordinate)
            latitude: Latitude (Y coordinate)
            
        Returns:
            Dictionary containing property title information, or None if not found
        """
        # Spatial intersection query
        cql_filter = f"INTERSECTS(shape, POINT({longitude} {latitude}))"
        
        params = {
            'service': 'WFS',
            'version': '2.0.0',
            'request': 'GetFeature',
            'typeNames': self.PROPERTY_TITLES_LAYER,
            'outputFormat': 'application/json',
            'cql_filter': cql_filter
        }
        
        try:
            response = requests.get(self.base_wfs_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get('features') or len(data['features']) == 0:
                print(f"[ERROR] No property titles found at coordinates: {longitude}, {latitude}")
                return None
            
            # Extract title information from all matching features
            titles = []
            for feature in data['features']:
                properties = feature.get('properties', {})
                titles.append(properties)
            
            print(f"[OK] Found {len(titles)} active title(s)")
            return {
                'count': len(titles),
                'titles': titles,
                'coordinates': {'longitude': longitude, 'latitude': latitude}
            }
            
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Error querying property titles: {e}")
            return None
        except (KeyError, ValueError) as e:
            print(f"[ERROR] Error parsing title response: {e}")
            return None
    
    def get_property_title_by_address(self, address_number: str, road_name: str,
                                       suburb_locality: Optional[str] = None,
                                       city: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Complete workflow: Get property title information by street address
        
        Args:
            address_number: Street number
            road_name: Road name
            suburb_locality: Suburb name (optional but recommended)
            city: City name (optional)
            
        Returns:
            Dictionary containing property title information, or None if not found
        """
        print(f"\n[LOOKUP] Property title for: {address_number} {road_name}, {suburb_locality or ''}")
        print("=" * 70)
        
        # Step 1: Get coordinates
        coords = self.get_address_coordinates(
            address_number, 
            road_name, 
            suburb_locality, 
            city
        )
        
        if not coords:
            print("[ERROR] Could not resolve address to coordinates")
            return None
        
        longitude, latitude = coords
        
        # Step 2: Get property titles
        titles_data = self.get_property_titles_by_coordinates(longitude, latitude)
        
        if not titles_data:
            print("[ERROR] Could not retrieve property titles for this location")
            return None
        
        # Add address information to result
        titles_data['address'] = {
            'number': address_number,
            'road_name': road_name,
            'suburb_locality': suburb_locality,
            'city': city
        }
        
        return titles_data


def main():
    """Test the LINZ API client with sample queries"""
    
    # Load API key from config file
    try:
        with open('Config/linz-api-key.txt', 'r') as f:
            API_KEY = f.read().strip()
    except FileNotFoundError:
        print("[ERROR] Config/linz-api-key.txt not found")
        return
    
    # Initialize client
    client = LINZAPIClient(API_KEY)
    
    # Test Case 1: 31 Douglas McLean Avenue, Marewa, Napier
    print("\n" + "=" * 70)
    print("TEST CASE 1: 31 Douglas McLean Avenue, Marewa, Napier")
    print("=" * 70)
    
    result = client.get_property_title_by_address(
        address_number="31",
        road_name="DOUGLAS MCLEAN AVENUE",
        suburb_locality="MAREWA",
        city="NAPIER"
    )
    
    if result:
        print("\n📋 PROPERTY TITLE SUMMARY:")
        print(f"   Number of active titles: {result['count']}")
        
        for i, title in enumerate(result['titles'], 1):
            print(f"\n   --- Title {i} ---")
            print(f"   Title Reference: {title.get('title_reference', 'N/A')}")
            print(f"   LINZ ID: {title.get('id', 'N/A')}")
            print(f"   Title Type: {title.get('title_type', 'N/A')}")
            print(f"   Issue Date: {title.get('issue_date', 'N/A')}")
            print(f"   Owners: {title.get('number_of_owners', 'N/A')}")
            print(f"   Area: {title.get('area', 'N/A')} {title.get('area_unit', 'm²')}")
            print(f"   Status: {title.get('status', 'N/A')}")
    
    # Test Case 2: Example from LINZ documentation (Stanley Street, Parnell)
    print("\n" + "=" * 70)
    print("TEST CASE 2: 28 Stanley Street, Parnell, Auckland")
    print("=" * 70)
    
    result2 = client.get_property_title_by_address(
        address_number="28",
        road_name="STANLEY STREET",
        suburb_locality="PARNELL",
        city="AUCKLAND"
    )
    
    if result2:
        print(f"\n[OK] Successfully retrieved {result2['count']} title(s)")
    
    print("\n" + "=" * 70)
    print("API CLIENT TEST COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()
