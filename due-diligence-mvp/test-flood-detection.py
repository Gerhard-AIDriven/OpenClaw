"""Test flood detection on properties that were actually flooded in Gabrielle"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from fetch_hazards import get_all_hazards

# Test locations in Napier/Hastings areas that were flooded during Cyclone Gabrielle
test_locations = [
    {
        'name': '31 Douglas McLean Ave, Marewa (CONTROL - not flooded)',
        'lat': -39.500580,
        'lon': 176.904059
    },
    {
        'name': 'Taradale area (some flooding reported)',
        'lat': -39.525,
        'lon': 176.890
    },
    {
        'name': 'Raumati South (flood affected)',
        'lat': -40.898,
        'lon': 175.051
    }
]

print("Testing flood detection on various locations...")
print("=" * 80)

for loc in test_locations:
    print(f"\n\n📍 Testing: {loc['name']}")
    print("-" * 80)
    
    result = get_all_hazards(loc['lat'], loc['lon'], loc['name'])
    
    print(f"\nResult: {result['flood']['description']}")
    print(f"Risk Rating: {result['flood']['risk_rating']}")
    print(f"Overall: {result['overall_risk_rating'].upper()}")
