#!/usr/bin/env python3
"""
Test Basic Report hazards (with simplified liquefaction)
"""

import sys
sys.path.insert(0, '.')

from fetch_hazards import get_all_hazards

# Test properties
test_addresses = [
    ("18 Ferguson Avenue, Westshore", -39.4756, 176.8820),
    ("20 Ferguson Avenue, Westshore", -39.4750, 176.8809),
    ("Marewa", -39.4920, 176.9100),
]

print("Testing BASIC REPORT Hazards (Beta Version)")
print("="*80)

for address, lat, lon in test_addresses:
    print(f"\n{address}")
    print(f"Coordinates: {lat}, {lon}")
    print("-"*80)
    
    hazards = get_all_hazards(lat, lon)
    
    print(f"\nOverall Risk: {hazards['overall_risk_rating'].upper()}")
    print("\nHazard Summary:")
    for line in hazards['summary']:
        print(f"  {line}")
    
    print("\nDetailed Breakdown:")
    if hazards['liquefaction']:
        print(f"  • Liquefaction: {hazards['liquefaction']['risk_level']}")
        print(f"    {hazards['liquefaction']['details']}")
    
    if hazards['tsunami']:
        in_zone = "YES ⚠️" if hazards['tsunami'].get('in_zone') else "No"
        print(f"  • Tsunami Zone: {in_zone}")
        if hazards['tsunami'].get('in_zone'):
            print(f"    {hazards['tsunami']['description']}")
    
    if hazards['flood']:
        flooded = "YES ⚠️" if hazards['flood'].get('flooded_in_gabrielle') else "No"
        print(f"  • Flood (Gabrielle): {flooded}")
    
    hail_count = len(hazards['hail_sites'])
    print(f"  • HAIL Sites nearby: {hail_count}")
    
    print()

print("="*80)
print("TEST COMPLETE")
