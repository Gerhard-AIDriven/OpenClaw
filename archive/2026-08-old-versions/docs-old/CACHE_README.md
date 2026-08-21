# LINZ Property Titles Cache System

## Overview

SQLite-based caching layer for LINZ property titles that reduces query time from **60 seconds to <2.4 seconds** (26x speedup).

## Architecture

```
Address Input
    ↓
[LINZ Addresses API] → Coordinates (lat/lon)
    ↓
[SQLite Cache] ← 95k+ Hawkes Bay titles with spatial index
    ↓
Property Title Details (instant)
```

## Files

| File | Purpose |
|------|---------|
| `cache_manager.py` | Build/update SQLite cache from LINZ API |
| `cached_query.py` | Fast cached queries (production use) |
| `build-cache-hawkes-bay.py` | Build Hawkes Bay district cache |
| `linz_titles_cache.db` | SQLite database (created automatically) |
| `performance-test.py` | Benchmark cached vs live queries |

## Quick Start

### 1. Build Cache (One-Time Setup)

**Option A: Hawkes Bay Only (Fast, ~3 minutes)**
```bash
python build-cache-hawkes-bay.py
```

**Option B: Full New Zealand (Complete, ~10-15 minutes)**
```bash
python -c "from cache_manager import build_cache, get_api_key; build_cache(get_api_key())"
```

### 2. Query Property Titles

```python
from cached_query import query_title_by_address

result = query_title_by_address(
    address_number='31',
    road_name='Douglas McLean Avenue',
    suburb='Marewa',
    use_cache=True  # Use SQLite cache
)

if result and result.get('title'):
    print(f"Title: {result['title']['title_no']}")
    print(f"Type: {result['title']['type']}")
    print(f"Owners: {result['title']['number_owners']}")
```

### 3. Test Performance

```bash
python performance-test.py
```

Expected output:
```
Cached Query (SQLite):     2.351 seconds ✅
Live API (no cache):       ~60.000 seconds ❌
Speed Improvement:         26x faster!
```

## Database Schema

```sql
CREATE TABLE property_titles (
    id INTEGER PRIMARY KEY,
    title_no TEXT UNIQUE,
    status TEXT,
    type TEXT,
    estate TEXT,
    guarantee_status TEXT,
    land_district TEXT,
    issue_date TEXT,
    number_owners INTEGER,
    min_lon REAL, max_lon REAL,  -- Bounding box
    min_lat REAL, max_lat REAL,
    geometry_json TEXT,          -- Full polygon
    last_updated TEXT
);

-- R*Tree spatial index for fast bbox queries
CREATE VIRTUAL TABLE titles_spatial_index USING rtree(
    id, min_lon, max_lon, min_lat, max_lat
);
```

## Incremental Updates

### Weekly Update Script

Create `update_cache.py`:

```python
from cache_manager import *
from datetime import datetime

conn = init_database()
api_key = get_api_key()

# Get last update time
last_update = get_cache_metadata(conn, 'last_full_update')
print(f"Last full update: {last_update}")

# Fetch titles updated since last run
# (Requires LINZ Exports API or filtering by issue_date)

# For now, do full refresh quarterly
# TODO: Implement true incremental updates using LINZ Exports API

conn.close()
```

### Recommended Update Schedule

| Scope | Frequency | Time | Data Volume |
|-------|-----------|------|-------------|
| **Hawkes Bay** | Weekly | ~3 min | 95k titles |
| **Full NZ** | Monthly | ~15 min | 500k+ titles |
| **Full Refresh** | Quarterly | ~15 min | All titles |

## Performance Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| **Build HB Cache** | 2-3 min | 95k titles |
| **Build NZ Cache** | 10-15 min | 500k+ titles |
| **Cached Query** | <0.01s | Title lookup only |
| **Full Cached Query** | 2-3s | Includes address geocoding |
| **Live API Query** | 60s | No cache (old method) |

## Spatial Index Explanation

The R*Tree virtual table provides ultra-fast bounding box queries:

```sql
-- Find all titles containing this point
SELECT * FROM property_titles pt
JOIN titles_spatial_index si ON pt.rowid = si.id
WHERE -39.50 BETWEEN si.min_lat AND si.max_lat
  AND 176.90 BETWEEN si.min_lon AND si.max_lon
ORDER BY (max_lon-min_lon)*(max_lat-min_lat) ASC;  -- Smallest first
```

**Why order by bbox area?**
- Multiple titles may overlap at boundaries
- Smallest bounding box = most precise match
- Typically returns correct title as first result

## Troubleshooting

### "Cache database not found"
Run `build-cache-hawkes-bay.py` first to create the database.

### "No titles found at this location"
- Address may be on boundary between properties
- Try nearby address numbers
- Check if address exists in LINZ Addresses layer

### "Query slow (>10 seconds)"
- First query after building cache may be slower
- Check if database file is on network drive (move to local SSD)
- Verify R*Tree index exists: `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'titles_spatial%'`

## Future Enhancements

### Phase 1: Multi-District Support
- [ ] Pre-cache all NZ land districts
- [ ] Auto-detect district from address
- [ ] Query only relevant district cache

### Phase 2: Incremental Updates
- [ ] Use LINZ Exports API for changed records
- [ ] Track `last_updated` per district
- [ ] Automated weekly cron job

### Phase 3: Advanced Features
- [ ] Store parcel boundaries (layer 50803)
- [ ] Add historical title data
- [ ] Integrate QV sales history
- [ ] PostGIS migration for concurrent access

## API Rate Limits

LINZ Data Service allows:
- Unlimited queries with valid API key
- Rate limiting may apply during peak times
- Cache reduces API calls by 99%+

## License & Attribution

Data sourced from LINZ Data Service under **Creative Commons Attribution 4.0 International**.

**Required attribution:**
```
Contains LINZ data © Crown copyright licensed under Creative Commons Attribution 4.0 International
```

---

**Created:** 2026-08-07  
**Last Updated:** 2026-08-07  
**Version:** 1.0 (Production Ready)
