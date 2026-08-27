# SYSTEM_STATE.md - Project State

## Last Update: 2026-08-27 08:40 (GMT+2)

## Current Technical State
- **Report Engine**: `C:\Users\gstim\.openclaw\workspace\whatsapp\report-engine-v2\report-engine-v2.js`
- **Map Architecture**: Leaflet JS.
- **Basemap Status**:
    - **OSM**: ✅ Working.
    - **LINZ/Koordinates**: ❌ Blocked (Returning 403/404). Defaulted to OSM.
- **Hazards Status**: ✅ **PARTIALLY AUTOMATED**
    - Tsunami & Coastal hazards now use direct ArcGIS FeatureServer queries.
    - Liquefaction is currently "View Only" (No public API).
- **Latest Breakthrough**: Successfully bypassed the HBRC "shell" website to query raw ArcGIS FeatureServices for point-in-polygon hazard checks.

## Hazard API Configuration (ArcGIS)
The following endpoints are verified for automated point-in-polygon queries (Spatial Reference: 4326):

- **Tsunami Evacuation Zones**: 
  `https://services1.arcgis.com/hWByVnSkh6ElzHkf/ArcGIS/rest/services/HawkesBay_Tsunami_Evacuation_Zones_View/FeatureServer/1/query`
- **Coastal Hazards**: 
  `https://services1.arcgis.com/hWByVnSkh6ElzHkf/ArcGIS/rest/services/Coastal_Hazards/FeatureServer/[LayerID]/query`
- **Liquefaction**: 
  `https://gis.hbrc.govt.nz/server/rest/services/HazardPortal/Earthquake_Liquefaction/MapServer/1/query` (Note: Slow/Unstable, use as fallback).

## Active Goals
- [ ] Integrate the Tsunami and Coastal API queries into the `report-engine-v2.js` flow.
- [ ] Implement a "Hazard Scan" utility that pings all known HBRC endpoints for a given coordinate.
- [ ] Resolve LINZ API authentication/endpoint mismatch to restore Satellite and Hazard layers.

## Critical Context for Next Session
- **POC Verified**: 31 Douglas McLean Avenue tested; results: Tsunami (Low Risk), Coastal (Low Risk).
- The "Professional" report version uses OSM as default to avoid "black frames."
- Goal is to stop using "External Links" and return to integrated, high-res embedded maps and automated hazard data.

## Dependencies
- `leaflet.js` (via unpkg)
- `linz-api.js` (for geocoding)
- `hazards-api.js` (Now updating to use ArcGIS FeatureServers)