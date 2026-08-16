#!/usr/bin/env python3
"""
Fetch HBRC Hazard Layer URLs from ArcGIS Online
Searches for critical hazard layers and extracts their Feature Server URLs
"""

import requests
import json
import sys
from urllib.parse import urlencode

def search_arcgis(query, num=10):
    """Search ArcGIS Online for layers"""
    base_url = "https://www.arcgis.com/sharing/rest/search"
    params = {
        'q': query,
        'f': 'json',
        'num': num
    }
    
    response = requests.get(base_url, params=params, timeout=15)
    response.raise_for_status()
    return response.json()

def main():
    print("Searching ArcGIS Online for HBRC Hazard Layers\n")
    print("=" * 70)
    
    # Critical search queries
    queries = [
        "Hawke's Bay liquefaction",
        "Hawke's Bay flood hazard", 
        "Hawke's Bay coastal hazard",
        "HBRC liquefaction",
        "HBRC flood",
        "HBRC coastal"
    ]
    
    critical_keywords = ['liquefaction', 'flood', 'coastal', 'tsunami', 'landslide', 'fault']
    
    all_layers = []
    
    for query in queries:
        print(f"\nSearching: {query}")
        print("-" * 70)
        
        try:
            results = search_arcgis(query, num=20)
            
            if results.get('total', 0) > 0:
                print(f"OK - Found {results['total']} results")
                
                for item in results.get('results', []):
                    item_type = item.get('type', '')
                    title = item.get('title', '')
                    url = item.get('url', '')
                    owner = item.get('owner', '')
                    
                    # Check if this is a critical layer
                    is_critical = any(kw in title.lower() for kw in critical_keywords)
                    
                    if item_type in ['Feature Service', 'Map Service', 'Feature Layer']:
                        layer_info = {
                            'title': title,
                            'type': item_type,
                            'url': url,
                            'owner': owner,
                            'id': item.get('id', ''),
                            'critical': is_critical
                        }
                        all_layers.append(layer_info)
                        
                        marker = "[CRITICAL]" if is_critical else "           "
                        print(f"\n{marker} {title}")
                        print(f"   Type: {item_type}")
                        print(f"   URL:  {url}")
                        print(f"   Owner: {owner}")
                        
            else:
                print("  No results")
                
        except Exception as e:
            print(f"  Error: {e}")
    
    # Save all findings
    print("\n" + "=" * 70)
    print(f"\nSUMMARY: Found {len(all_layers)} hazard layers")
    
    critical_layers = [l for l in all_layers if l['critical']]
    print(f"CRITICAL: {len(critical_layers)} layers")
    
    output_file = "hbr-discovered-layers.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total_layers': len(all_layers),
            'critical_layers': len(critical_layers),
            'layers': all_layers
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved to: {output_file}")
    
    # Print critical layer URLs for immediate use
    if critical_layers:
        print("\n" + "=" * 70)
        print("\nCRITICAL LAYER URLs (copy these for Seb):\n")
        
        for i, layer in enumerate(critical_layers, 1):
            print(f"{i}. {layer['title']}")
            print(f"   {layer['url']}")
            print()
    else:
        print("\nNo critical layers found in search results")

if __name__ == "__main__":
    main()
