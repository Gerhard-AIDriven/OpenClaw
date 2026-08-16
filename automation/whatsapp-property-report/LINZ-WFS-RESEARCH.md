# LINZ WFS Integration Research

**Date:** 2026-08-16  
**Status:** ✅ **SOLVED**  
**Goal:** Find working LINZ WFS endpoint for property title data

---

## 🎯 BREAKTHROUGH (2026-08-16 Afternoon)

**WFS authentication works!** The key insight is that WFS uses a **path parameter** format, not query string.

### Working Authentication Method

```bash
https://data.linz.govt.nz/services;key=YOUR_KEY/wfs?service=WFS&request=GetCapabilities&version=2.0.0
```

**Test Command:**
```bash
curl "https://data.linz.govt.nz/services;key=b2e35aafd4e848e9b0265f1caf575255/wfs?service=WFS&request=GetCapabilities&version=2.0.0"
```

**Result:** ✅ Returns full `WFS_Capabilities` XML document successfully!

### Key Insight: REST vs WFS URL Structure

The API key string is **identical** for both protocols, but the URL structure differs:

| Protocol | Auth Pattern | URL Example |
|----------|-------------|-------------|
| **WFS** | Inline URL path parameter | `.../services;key=YOUR_KEY/wfs?service=WFS...` |
| **REST** | Query string parameter | `.../services/rest/v1/.../?key=YOUR_KEY` |

Note the semicolon syntax: `/services;key=XXX/wfs`

---

## Available Property Data Layers

From the WFS Capabilities document, these are the critical layers for property due diligence:

### 1. **Title Estate** (Ownership Data) ⭐ PRIMARY
- **Layer:** `data.linz.govt.nz:table-52068`
- **Title:** Landonline: Title Estate
- **Description:** Full Landonline dataset with title/ownership information
- **URL:** https://data.linz.govt.nz/table/52068-landonline-title-estate/
- **Keywords:** LAND-Cadastre, Full Landonline Dataset
- **Use Case:** Get ownership details, tenure type, owners

### 2. **NZ Parcels** (Property Boundaries) ⭐ PRIMARY
- **Layer:** `data.linz.govt.nz:layer-51571`
- **Title:** NZ Parcels
- **Description:** Cadastral parcel polygons with appellation (legal description), purpose, size, and list of titles
- **URL:** https://data.linz.govt.nz/layer/51571-nz-parcels/
- **Use Case:** Get legal description and boundaries from coordinates

### 3. **Title-Parcel Association**
- **Layer:** `data.linz.govt.nz:table-51569`
- **Title:** NZ Title-Parcel Association List
- **Description:** Links titles to parcels (many-to-many relationships)
- **URL:** https://data.linz.govt.nz/table/51569-nz-title-parcel-association-list/
- **Keywords:** Property Ownership & Boundaries, Titles & Owners
- **Use Case:** Resolve which titles apply to which parcels

### 4. **NZ Cadastral Adjustments**
- **Layer:** `data.linz.govt.nz:layer-50790`
- **Title:** NZ Cadastral Adjustments
- **Description:** Extents of influence for survey integration into cadastre

---

## WFS Endpoint Details

**Base URL (with auth):**
```
https://data.linz.govt.nz/services;key=b2e35aafd4e848e9b0265f1caf575255/wfs
```

**Supported Operations:**
- ✅ GetCapabilities (tested successfully)
- ✅ GetFeature (ready to implement)
- ✅ DescribeFeatureType
- ✅ GetPropertyValue
- ✅ ListStoredQueries
- ✅ DescribeStoredQueries

**Output Formats:**
- application/json (JSON supported! 🎉)
- application/gml+xml; version=3.2
- text/xml; subtype=gml/3.2
- KML
- CSV

---

## Failed Attempts (for reference)

### ❌ Attempt 1: Query String Parameter
```
GET https://data.linz.govt.nz/services/wfs?key=b2e35aafd4e848e9b0265f1caf575255&service=WFS&request=GetCapabilities&version=2.0.0
Result: 401 Unauthorized
```

### ❌ Attempt 2: Header Authentication
```
GET https://data.linz.govt.nz/services/wfs
Headers: X-API-Key: b2e35aafd4e848e9b0265f1caf575255
Result: 401 Unauthorized
```

### ❌ Attempt 3: Basic Auth
```
GET https://data.linz.govt.nz/services/wfs?service=WFS&request=GetCapabilities&version=2.0.0
Auth: Basic base64(b2e35aafd4e848e9b0265f1caf575255:)
Result: 401 Unauthorized
```

---

## Implementation Plan

### Phase 1: Test GetFeature Requests
```bash
# Test fetching parcel data by bounding box (Napier area)
curl "https://data.linz.govt.nz/services;key=b2e35aafd4e848e9b0265f1caf575255/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=data.linz.govt.nz:layer-51571&outputFormat=json&bbox=176.9,-39.5,177.0,-39.4,EPSG:4326"

# Test fetching title estate data
curl "https://data.linz.govt.nz/services;key=b2e35aafd4e848e9b0265f1caf575255/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=data.linz.govt.nz:table-52068&outputFormat=json"
```

### Phase 2: Update linz-fetcher.js
- [ ] Change endpoint to use path parameter format
- [ ] Implement GetFeature request for NZ Parcels layer
- [ ] Parse JSON response to extract:
  - Legal description (appellation)
  - Parcel area
  - Purpose
  - Title references
- [ ] Implement GetFeature request for Title Estate table
- [ ] Extract ownership details

### Phase 3: Integration Testing
- [ ] Test with real Napier property addresses
- [ ] Verify data accuracy against LINZ website
- [ ] Handle edge cases (multiple titles, unit titles, etc.)

---

## Sample Request Format

### GetFeature by BBOX (for address geocoding → parcel lookup)
```javascript
const url = `https://data.linz.govt.nz/services;key=${API_KEY}/wfs?` + new URLSearchParams({
  service: 'WFS',
  version: '2.0.0',
  request: 'GetFeature',
  typeName: 'data.linz.govt.nz:layer-51571', // NZ Parcels
  outputFormat: 'application/json',
  bbox: `${lonMin},${latMin},${lonMax},${latMax},EPSG:4326`
});
```

### GetFeature by CQL Filter (if we have title number)
```javascript
const url = `https://data.linz.govt.nz/services;key=${API_KEY}/wfs?` + new URLSearchParams({
  service: 'WFS',
  version: '2.0.0',
  request: 'GetFeature',
  typeName: 'data.linz.govt.nz:table-52068', // Title Estate
  outputFormat: 'application/json',
  CQL_FILTER: `title_number = 'NA1234/56'`
});
```

---

## Files to Update

- [x] ~~`automation/whatsapp-property-report/LINZ-WFS-RESEARCH.md`~~ (this file)
- [ ] `automation/whatsapp-property-report/linz-fetcher.js` — Rewrite with correct endpoint/auth
- [ ] `automation/whatsapp-property-report/report-engine.js` — May need adjustment for new data structure
- [ ] `.env` or config file — Store API key securely

---

*Research by Seb | AI Driven | 2026-08-16*  
**Next Action:** Test GetFeature requests on identified layers
