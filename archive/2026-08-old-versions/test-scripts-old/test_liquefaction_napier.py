#!/usr/bin/env python3
"""
Test liquefaction hazard for Napier addresses
"""

import sys
sys.path.insert(0, '.')

from fetch_hazards import fetch_liquefaction_hazard

# Test coordinates for Napier properties (including known risk areas)
test_properties = [
    ("18 Ferguson Avenue, Westshore", -39.4756, 176.8820),
    ("20 Ferguson Avenue, Westshore", -39.4750, 176.8809),
    ("Marewa (high risk area)", -39.4920, 176.9100),
    ("Napier South (coastal)", -39.5100, 176.9200),
]

print("Testing LIQUEFACTION HAZARD for Napier properties\n")
print("="*70)

for address, lat, lon in test_properties:
    print(f"\n{address}")
    print(f"Coordinates: {lat}, {lon}")
    print("-" * 70)
    
    result = fetch_liquefaction_hazard(lat, lon, search_radius_m=500)  # Increased to 500m
    
    if result:
        print(f"  Risk Level: {result['risk_level']}")
        print(f"  Details: {result['details']}")
        print(f"  Count: {result['count']} hazard zone(s)")
        
        if result.get('hazards'):
            print(f"\n  Hazard Categories:")
            for h in result['hazards'][:3]:  # Show first 3
                print(f"    - {h['category']}: {h['description']}")
    else:
        print(f"  ✓ No liquefaction hazard detected")

print("\n" + "="*70)
print("TEST COMPLETE")
