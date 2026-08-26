# SYSTEM_STATE.md - Project State

## Last Update: 2026-08-26 18:10 (GMT+2)

## Current Technical State
- **Report Engine**: `C:\Users\gstim\.openclaw\workspace\whatsapp\report-engine-v2.js`
- **Map Architecture**: Leaflet JS.
- **Basemap Status**:
    - **OSM**: ✅ Working.
    - **LINZ/Koordinates**: ❌ Blocked (Returning 403/404). Currently defaulted to OSM for stability.
- **Hazards Status**: ❌ Blocked (LINZ WMS returning 404).
- **Latest Breakthrough**: Identified `gis.hbrc.govt.nz/hazards/` as a potential source, though currently timing out for the user.

## Active Goals
- [ ] Resolve LINZ API authentication/endpoint mismatch to restore Satellite and Hazard layers.
- [ ] Investigate `gis.hbrc.govt.nz` for alternative WMS/ArcGIS endpoints.
- [ ] Transition from "Authority Links" back to embedded data to maintain competitive edge.

## Critical Context for Next Session
- The user has manually inserted a key into `report-engine-v2.js` (Line 175).
- The "Professional" report version uses OSM as default to avoid "black frames."
- The next priority is a technical deep-dive into the HBRC GIS server to find a working WMS/XYZ stream.

## Dependencies
- `leaflet.js` (via unpkg)
- `linz-api.js` (for geocoding)
- `hazards-api.js` (current implementations failing)
