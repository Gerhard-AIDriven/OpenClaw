#!/usr/bin/env python3
"""
Fetch HBRC Hazard Portal layer information
Uses ArcGIS Python SDK to access web map layers
"""

import json
import sys

try:
    from arcgis.gis import GIS
    print("✓ ArcGIS SDK available")
    
    # Connect to HBRC portal
    print("\nConnecting to HBRC ArcGIS Online...")
    gis = GIS("https://hbrc.maps.arcgis.com")
    print("✓ Connected successfully")
    
    # Get the hazard portal item
    item_id = "9e5f7947822440dcb01b4ea2cbb1b3b5"
    print(f"\nFetching item {item_id}...")
    item = gis.content.get(item_id)
    
    if not item:
        print("✗ Item not found!")
        sys.exit(1)
    
    print(f"✓ Found: {item.title}")
    print(f"  Type: {item.type}")
    print(f"  Owner: {item.owner}")
    
    # Try to get web map data
    if item.type in ["Web Map", "Web Mapping Application"]:
        print("\n📍 This is a web map - extracting layers...")
        
        try:
            web_map = item.get_data()
            
            if "operationalLayers" in web_map:
                layers = web_map["operationalLayers"]
                print(f"\n🎯 Found {len(layers)} operational layers!\n")
                
                critical_layers = []
                
                for i, layer in enumerate(layers):
                    title = layer.get("title", "Unknown")
                    url = layer.get("url", "")
                    layer_type = layer.get("layerType", "")
                    
                    print(f"{i+1}. {title}")
                    print(f"   Type: {layer_type}")
                    print(f"   URL: {url}")
                    
                    # Check if this is a critical layer
                    keywords = ["liquefaction", "flood", "coastal", "hazard"]
                    if any(kw in title.lower() for kw in keywords):
                        critical_layers.append({
                            "title": title,
                            "url": url,
                            "type": layer_type
                        })
                        print(f"   ⭐ CRITICAL LAYER\n")
                    else:
                        print()
                
                # Save critical layers to file
                output_file = "hbr-critical-layers.json"
                with open(output_file, "w") as f:
                    json.dump(critical_layers, f, indent=2)
                
                print(f"✅ Saved {len(critical_layers)} critical layers to {output_file}")
                
            else:
                print("✗ No operationalLayers found in web map data")
                
        except Exception as e:
            print(f"✗ Error accessing web map data: {e}")
    
    else:
        print(f"Item type '{item.type}' is not a web map")

except ImportError:
    print("✗ ArcGIS SDK not installed")
    print("Install with: pip install arcgis")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
