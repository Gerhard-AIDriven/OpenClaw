# Council GIS Integration Research

**Date:** 2026-08-16  
**Status:** Investigation in progress  
**Goal:** Find real liquefaction, flood hazard, and rates data for Napier/Hastings councils

---

## What We Need

### 1. **Liquefaction Data (Napier-specific)**
Critical for Hawke's Bay property investment decisions post-2011 Canterbury earthquakes.

**Sources to investigate:**
- Napier City Council GIS layers
- Hastings District Council GIS
- GNS Science hazard maps
- EQC land damage zones

### 2. **Flood Hazard Maps**
- River flooding (Tutaekuri, Ngaruroro, Esk rivers)
- Surface water flooding
- Coastal inundation zones

### 3. **Council Rates + Services Costs**
Essential for investment analysis:
- Annual rates breakdown
- Water supply charges
- Wastewater fees
- Stormwater levies
- Rubbish/recycling services
- Total monthly cost calculation

### 4. **Interactive Map Integration**
"WOW factor" visual element for reports:
- Embedded council GIS viewer
- Custom Leaflet/Mapbox map with overlay layers
- Property boundary + hazard zone visualization

---

## Potential Data Sources

### Napier City Council

**GIS Portal:** Likely has interactive mapping
- Search for: "Napier City Council GIS mapping"
- Look for WMS/WFS endpoints
- Check for open data portal

**Rates Database:**
- Online rates enquiry tool?
- Property search by address?

**Known Layers:**
- Liquefaction susceptibility (TC2, TC3 equivalents)
- Flood hazard zones
- Zoning districts
- Infrastructure layers

### Hastings District Council

Similar structure to Napier. May have:
- Separate GIS system
- Different data formats
- Own rates portal

### Hawke's Bay Regional Council (HBRC)

**Goldmine for hazards:**
- Flood maps (river + surface)
- Environmental data
- Groundwater levels
- Soil types

**Likely has:**
- WMS/WFS services
- Open data initiatives
- Hazards GIS layers

### GNS Science

**National hazard data:**
- Liquefaction maps
- Fault lines
- Landslide risk
- Tsunami zones

**May provide:**
- Downloadable shapefiles
- WMS services
- API access

### LINZ (separate from titles)

**Base layers:**
- Property boundaries
- Roads, railways
- Hydrography
- Aerial imagery

---

## Technical Approaches

### Option A: Direct API/WMS Access (Best)
If councils expose OGC-compliant services:

```javascript
// WMS GetMap request example
https://maps.napier.govt.nz/geoserver/wms?
  service=WMS&
  version=1.3.0&
  request=GetMap&
  layers=napier:liquefaction&
  bbox=MINX,MINY,MAXX,MAXY&
  width=800&
  height=600&
  format=image/png
```

**Pros:** Real-time, automated, scalable  
**Cons:** Requires finding correct endpoint + layer names

### Option B: Web Scraping (Fallback)
Scrape council property search pages:

```javascript
// Example: Navigate to council property portal
// Search by address
// Extract rates + hazard info from results page
```

**Pros:** Works even without API  
**Cons:** Fragile (breaks if site changes), slower, may violate ToS

### Option C: Manual Lookup Template (Immediate Launch)
Create structured template for manual data entry:
- Staff lookup property on council site (~2 min)
- Copy/paste into report generator
- Automated report assembly still works

**Pros:** Launch immediately with real data  
**Cons:** Not scalable, labor-intensive

### Option D: Hybrid Approach (Recommended)
- Start with Option C (manual) for immediate launch
- Build Option A/B in parallel
- Switch to automated once tested

---

## Specific Research Tasks

### Task 1: Napier City Council GIS
**Search queries:**
- "Napier City Council GIS mapping"
- "Napier City Council property search"
- "Napier City Council rates enquiry"
- "Napier City Council liquefaction map"

**Look for:**
- Interactive map viewer URL
- Layer list (liquefaction, flood, zoning)
- WMS/WFS capabilities document
- Property search by address feature

### Task 2: Hastings District Council
Same approach as Napier.

### Task 3: Hawke's Bay Regional Council
**Focus:** Flood maps + environmental hazards

**Search queries:**
- "Hawke's Bay Regional Council flood map"
- "HBRC GIS data"
- "HBRC natural hazards"

### Task 4: GNS Science Hazards
**Search queries:**
- "GNS Science liquefaction map New Zealand"
- "GNS natural hazards portal"
- "Canterbury TC2 TC3 map" (reference for what we want)

### Task 5: OneRoof/Property IQ
**Commercial alternatives:**
- Do they offer API access?
- What's the pricing?
- Do they include hazard data?

---

## Integration Strategy for Reports

### Basic Package ($75-$99)
Include:
- ✅ Liquefaction zone (from council/GNS)
- ✅ Flood risk rating (low/medium/high)
- ✅ Annual rates total
- ⚠️ Static map screenshot (or embed link)

### Standard Package ($125)
Add:
- ✅ Detailed hazard breakdown (flood + liquefaction + others)
- ✅ Rates services itemization
- ✅ Interactive map embed
- ✅ Historical sales context

### Premium Package ($200)
Add:
- ✅ Multi-layer hazard analysis
- ✅ 5-year rates trend (if available)
- ✅ Growth constraints assessment (hazards limiting development)
- ✅ Professional map visualization

---

## Files to Create/Update

Once we identify sources:

- `automation/whatsapp-property-report/council-scraper.js` — Enhanced with real data fetchers
- `automation/whatsapp-property-report/hazard-fetcher.js` — New module for GNS/council hazards
- `automation/whatsapp-property-report/rates-fetcher.js` — New module for rates + services
- `whatsapp/report-template-v3.js` — Add interactive map embed + detailed hazard sections
- `automation/whatsapp-property-report/interactive-map.html` — Standalone map viewer component

---

## Success Criteria

✅ Can fetch liquefaction zone for any Napier address  
✅ Can fetch flood risk rating  
✅ Can extract full rates breakdown (including water, waste, stormwater)  
✅ Can generate interactive map embed URL or static image  
✅ All data sources are reliable and update regularly  

---

*Research by Seb | AI Driven | 2026-08-16*
