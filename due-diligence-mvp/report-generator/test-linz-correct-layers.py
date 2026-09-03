"""Test to find correct LINZ layer names/IDs"""

import requests

API_KEY = "09480efb820d428387c45b597cf9bd1d"
BASE_URL = f"https://data.linz.govt.nz/services;key={API_KEY}/wfs"

print("=" * 70)
print("LINZ LAYER NAME DISCOVERY")
print("=" * 70)

# Try different layer name formats
layer_tests = [
    ("layer-105688", "Hyphenated format"),
    ("105688", "Numeric only"),
    ("linz:105688", "With linz prefix"),
    ("data.linz.govt.nz:105688", "Full domain prefix"),
]

for layer_name, description in layer_tests:
    print(f"\n[TEST] Trying {description}: '{layer_name}'")
    params = {
        'service': 'WFS',
        'version': '2.0.0',
        'request': 'GetFeature',
        'typeNames': layer_name,
        'outputFormat': 'application/json',
        'count': 1
    }
    
    try:
        response = requests.get(BASE_URL, params=params, timeout=30)
        if response.status_code == 200:
            print(f"   [SUCCESS] Layer '{layer_name}' works!")
            data = response.json()
            if data.get('features'):
                props = data['features'][0].get('properties', {})
                print(f"   Sample fields: {list(props.keys())[:5]}")
            break
        else:
            error_text = response.text[:200]
            if "unknown" in error_text.lower():
                print(f"   [FAIL] Unknown layer")
            else:
                print(f"   [ERROR] {error_text}")
    except Exception as e:
        print(f"   [EXCEPTION] {e}")

# Also try GetCapabilities to list all available layers
print("\n" + "=" * 70)
print("[TEST] Getting WFS Capabilities (lists all available layers)...")
params = {
    'service': 'WFS',
    'version': '2.0.0',
    'request': 'GetCapabilities'
}

try:
    response = requests.get(BASE_URL, params=params, timeout=60)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        # Look for layer names in the XML
        content = response.text
        # Save full capabilities to file
        with open('linz-wfs-capabilities.xml', 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Saved full capabilities to linz-wfs-capabilities.xml ({len(content)} bytes)")
        
        # Extract just the <FeatureTypeName> entries
        import re
        type_names = re.findall(r'<FeatureTypeName>([^<]+)</FeatureTypeName>', content)
        print(f"\nFound {len(type_names)} feature types total")
        
        # Look for addresses and property titles
        addresses_layers = [l for l in type_names if 'address' in l.lower()]
        title_layers = [l for l in type_names if 'title' in l.lower() or 'property' in l.lower()]
        
        print(f"\nAddress-related layers ({len(addresses_layers)}):")
        for layer in addresses_layers[:10]:
            print(f"   - {layer}")
        
        print(f"\nProperty Title-related layers ({len(title_layers)}):")
        for layer in title_layers[:10]:
            print(f"   - {layer}")
            
    else:
        print(f"[ERROR] {response.text[:500]}")
except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
