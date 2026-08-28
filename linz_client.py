import requests
import os

class LinzClient:
    """
    Client to interact with LINZ Data Services API.
    Handles geocoding and vector data retrieval for property due diligence.
    """
    
    BASE_URL = "https://data.linz.govt.nz/services/query/v1/vector.json"
    GEOCODE_URL = "https://data.linz.govt.nz/services/address/v1/search"

    def __init__(self, api_key_path="LINZ API key.txt"):
        self.api_key_path = api_key_path
        self.api_key = self._load_api_key()

    def _load_api_key(self):
        """Loads the API key from the specified text file."""
        try:
            with open(self.api_key_path, 'r') as f:
                return f.read().strip()
        except FileNotFoundError:
            print(f"❌ Error: API key file not found at {self.api_key_path}")
            return None

    def geocode_address(self, number, street_name, street_type, suburb, city):
        """
        Converts a structured address into latitude and longitude.
        """
        full_address = f"{number} {street_name} {street_type}, {suburb}, {city}"
        print(f"📍 Geocoding address: {full_address}")
        
        params = {
            'key': self.api_key,
            'q': full_address,
            'max_results': 1
        }
        
        try:
            response = requests.get(self.GEOCODE_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            results = data.get('results', [])
            if not results:
                print(f"⚠️ No coordinates found for: {full_address}")
                return None
            
            # Extract coordinates from the first result
            coords = results[0].get('geometry', {}).get('coordinates', [])
            if len(coords) >= 2:
                # LINZ returns [longitude, latitude]
                return {
                    'lon': coords[0],
                    'lat': coords[1],
                    'formatted_address': results[0].get('address')
                }
            
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Geocoding request failed: {e}")
            return None

    def query_vector_layer(self, latitude, longitude, layer_id, radius=5000):
        """
        Queries a specific LINZ vector layer for features at a given location.
        """
        print(f"🔍 Querying LINZ Layer {layer_id} at {latitude}, {longitude}...")
        
        params = {
            'key': self.api_key,
            'layer': layer_id,
            'x': longitude,
            'y': latitude,
            'max_results': 5,
            'radius': radius,
            'geometry': 'false',
            'with_field_names': 'true'
        }
        
        try:
            response = requests.get(self.BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            layer_data = data.get('vectorQuery', {}).get('layers', {}).get(layer_id, {})
            features = layer_data.get('features', [])
            
            return {
                'features': features,
                'fields': layer_data.get('field_names', []),
                'count': len(features)
            }
            
        except requests.exceptions.RequestException as e:
            print(f"❌ LINZ vector query failed for layer {layer_id}: {e}")
            return None

    def get_parcel_info(self, latitude, longitude):
        """
        Fetches parcel/title information using the parcel layer.
        Note: Layer ID for parcels may vary; this is a placeholder for the primary parcel layer.
        """
        # Example Parcel Layer ID (this should be verified against the LINZ catalogue)
        PARCEL_LAYER_ID = '100100' 
        
        result = self.query_vector_layer(latitude, longitude, PARCEL_LAYER_ID)
        if result and result['count'] > 0:
            return result['features'][0]['properties']
        
        return None

if __name__ == "__main__":
    # Simple test block
    client = LinzClient()
    if client.api_key:
        # Test geocoding
        coords = client.geocode_address("18", "Ferguson", "Ave", "Napier", "Hawke's Bay")
        if coords:
            print(f"✅ Found coordinates: {coords}")
            # Test vector query (using Gabrielle Flood layer 112668 as example)
            hazards = client.query_vector_layer(coords['lat'], coords['lon'], '112668')
            print(f"✅ Hazard data found: {hazards['count']} features")
        else:
            print("❌ Geocoding failed.")
    else:
        print("❌ API Key missing. Please check LINZ API key.txt")
