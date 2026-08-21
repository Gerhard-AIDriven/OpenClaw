"""
Build SQLite cache for Hawkes Bay property titles only
Fast test before building full NZ cache
"""

import sys
sys.path.insert(0, '.')

from cache_manager import build_cache, get_api_key

print("=" * 60)
print("Building Hawkes Bay Property Titles Cache")
print("=" * 60)

api_key = get_api_key()

# Build cache for Hawkes Bay district only (~2-3 minutes vs 10+ for all NZ)
success = build_cache(api_key, land_district='Hawkes Bay')

if success:
    print("\n✅ Hawkes Bay cache built successfully!")
    print("\nNext steps:")
    print("1. Test with: python cached_query.py")
    print("2. Build full NZ cache: Uncomment line in cache_manager.py")
    print("3. Or run: python -c \"from cache_manager import build_cache; build_cache(get_api_key())\"")
else:
    print("\n❌ Cache build failed")
