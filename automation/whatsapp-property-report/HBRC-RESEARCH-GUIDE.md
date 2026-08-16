# HBRC Hazard Data Research Guide

**Goal:** Find exact ArcGIS REST API layer IDs for Hawke's Bay hazard data  
**Date:** 2026-08-16  
**Status:** 🔍 In Progress (Gerhard researching)

---

## 🎯 What We Need to Find

### Critical Layers (Priority 1)

| Layer | Purpose | Status |
|-------|---------|--------|
| **Liquefaction Susceptibility** | GNS Science regional modeling, soil vulnerability | ⏳ Need layer ID |
| **Esk River Flood Hazard** | Flooding from Esk River catchment | ⏳ Need layer ID |
| **Napier Flood Hazard** | Urban Napier flood zones | ⏳ Need layer ID |
| **Clifton-Tangoio Coastal Hazards** | Coastal erosion, inundation, gravel barrier | ⏳ Need layer ID |

### Secondary Layers (Nice to Have)

- Earthquake fault lines
- Groundwater depth maps
- Historical flood extents (pre-Gabrielle)
- Land subsidence/uplift data

---

## 🔍 Where to Look

### 1. HBRC Open Data Portal

**URL:** Likely one of these:
- `https://hbrc.maps.arcgis.com/`
- `https://data.hbrc.govt.nz/`
- `https://maps.hbrc.govt.nz/`

**What to do:**
1. Navigate to the portal in your browser
2. Look for "Open Data", "GIS Data", or "Spatial Data" section
3. Search for layers with keywords:
   - "liquefaction"
   - "flood"
   - "coastal hazard"
   - "natural hazards"

**What we need from each layer:**
- ✅ **Layer ID** (e.g., `/HBRC_Liquefaction/FeatureServer/0`)
- ✅ **API endpoint URL** (should be visible in layer info)
- ✅ **Available fields/attributes** (what data columns exist)
- ✅ **Coordinate system** (WGS84 vs NZTM2000)

---

### 2. LINZ Data Service (Already Identified)

**Cyclone Gabrielle Layer:**
- **Layer ID:** 112668
- **Name:** Cyclone Gabrielle Flood Areas (14 Feb 2023)
- **URL:** `https://data.linz.govt.nz/layer/112668`
- **Access:** WFS already working ✅

**LiDAR DEM:**
- **Search:** "Hawke's Bay LiDAR 1m DEM 2023-2024"
- **Use case:** Slope stability, groundwater modeling

---

### 3. GNS Science / NHC

**National Liquefaction Model Portal:**
- **URL:** Check documentation at GNS Science website
- **Data access:** May require direct contact or special API

---

## 📋 Research Checklist

### Step 1: Find HBRC Portal
- [ ] Locate HBRC public GIS portal
- [ ] Confirm it has open data access (no login required)
- [ ] Note the base URL

### Step 2: Discover Layer IDs
For each critical layer (liquefaction, flood, coastal):

- [ ] Find layer in portal catalog
- [ ] Click "View Details" or "API Info"
- [ ] Copy the **FeatureServer URL**
  - Should look like: `https://services.arcgis.com/[ID]/arcgis/rest/services/[LAYER_NAME]/FeatureServer`
- [ ] Note the **layer number** (usually `/0` for single layers)
- [ ] Check available **fields/attributes** (we need risk level, zone type, etc.)

### Step 3: Test API Access
Once you have a layer URL:

```bash
# Example test query (replace with real layer ID)
curl "https://services.arcgis.com/[YOUR_LAYER_ID]/FeatureServer/0/query?where=1=1&outFields=*&f=geojson&geometry=176.9120,-39.4928&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects"
```

Check if it returns GeoJSON with actual data.

### Step 4: Document Findings
Fill in this template for each layer:

```markdown
### Layer Name: [e.g., HBRC Liquefaction Susceptibility]

**FeatureServer URL:**
`https://services.arcgis.com/[ID]/arcgis/rest/services/[NAME]/FeatureServer`

**Layer ID:** `/0` (or whatever number)

**Full API Endpoint:**
`https://services.arcgis.com/[ID]/arcgis/rest/services/[NAME]/FeatureServer/0`

**Available Fields:**
- `susceptibility_level` (Low, Moderate, High, Very High)
- `soil_type`
- `groundwater_depth_m`
- `gns_model_version`
- `last_updated`

**Example Query:**
`[Full working URL with test coordinates]`

**Notes:**
[Any quirks, auth requirements, rate limits, etc.]
```

---

## 🧪 Test Coordinates (Napier)

Use these for testing API queries:

**Napier Center:**
- Lat: `-39.4928`
- Lon: `176.9120`

**Bounding Box (Napier Urban):**
```
minLon: 176.85
minLat: -39.55
maxLon: 177.00
maxLat: -39.40
```

**NZTM2000 Equivalent (if needed):**
```
minE: 1700000
minN: 5400000
maxE: 1750000
maxN: 5450000
```

---

## 💡 Tips & Tricks

### ArcGIS REST API Patterns

**Basic query (all features):**
```
/FeatureServer/0/query?where=1=1&outFields=*&f=geojson
```

**Spatial query (point intersection):**
```
/FeatureServer/0/query?
  where=1=1&
  geometry=LON,LAT&
  geometryType=esriGeometryPoint&
  spatialRel=esriSpatialRelIntersects&
  outFields=*&
  f=geojson
```

**Bounding box query:**
```
/FeatureServer/0/query?
  geometry=MINLON,MINLAT,MAXLON,MAXLAT&
  geometryType=esriGeometryEnvelope&
  spatialRel=esriSpatialRelIntersects&
  outFields=*&
  f=geojson
```

### Common Field Names

Watch for these field names in responses:
- `risk_level`, `hazard_rating`, `susceptibility`
- `zone_type`, `classification`
- `soil_type`, `geology`
- `groundwater_depth`, `water_table`
- `event_date`, `last_updated`

### If You Get Stuck

**No public API found?**
- Check if HBRC requires data request form
- Look for "Download Data" option (GeoJSON, Shapefile)
- Contact HBRC GIS team for API access

**Layer requires authentication?**
- Note the auth method (API key, OAuth, etc.)
- We can implement it once we know the requirements

---

## 📞 Once You Have the Layer IDs

**Tell me:**
1. Base FeatureServer URL for each layer
2. Layer number (usually `/0`)
3. Any special query parameters needed
4. Sample response (first few lines of GeoJSON)

**I'll immediately:**
- Update `hazard-fetcher.js` with real endpoints
- Implement proper parsing for each layer's data structure
- Test with live API calls
- Integrate with the report engine

---

## 🚀 Quick Win: Cyclone Gabrielle Layer (Already Working!)

While you research HBRC, I've already implemented the LINZ Cyclone Gabrielle layer fetcher:

- **Layer:** 112668
- **Endpoint:** Working via LINZ WFS ✅
- **Data:** Satellite radar-derived flood extent polygons
- **Coverage:** Napier City + Hastings

This will give us immediate flood hazard data from the February 2023 event!

---

*Research guide by Seb | AI Driven | 2026-08-16*
