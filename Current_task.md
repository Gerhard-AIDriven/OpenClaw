# ACTIVE WORK SCRATCHPAD

## 🎯 CURRENT OBJECTIVE
* Integrate automated HBRC Hazard API queries into the report engine and restore LINZ map control buttons.

## 📋 ACTIVE STEP-BY-STEP CHECKLIST
- [x] **Phase 1: Map Stability (Completed)**
    - [x] Remove duplicate Leaflet JS script tags.
    - [x] Wrap map initialization in `DOMContentLoaded` to prevent race conditions.
    - [x] Verify basic map display.
- [x] **Phase 2: Hazard API Discovery (Completed)**
    - [x] Identify HBRC Open Data ArcGIS Hub as primary source.
    - [x] Extract `FeatureServer` endpoints for Tsunami and Coastal hazards.
    - [x] Perform POC for "31 Douglas McLean Avenue" to verify point-in-polygon accuracy.
    - [x] Document API endpoints in `SYSTEM_STATE.md`.
- [ ] **Phase 3: Engine Integration (Upcoming)**
    - [ ] Update `report-engine-v2.js` to call HBRC APIs during report generation.
    - [ ] Create a helper function to translate API JSON results into professional risk descriptions.
    - [ ] Map "Liquefaction" results to a manual check flag (since it's View-Only).
    - [ ] **TODO: Investigate and integrate Flood Risk data (Historical Observations vs. Predicted Maps).**
    - [ ] **TODO: Implement "Dynamic Consultation" logic: use LLM to generate personalized responses to the "I am interested in..." form field based on API results.**
    - [ ] **TODO: Implement "Executive Summary" generator: a high-level synthesis of all findings placed at the top of the report.**
- [ ] **Phase 4: Final Polish & Value-Add (Upcoming)**
    - [ ] Implement "Environmental History & Context" section (utilizing historical aerials, Cawthron 2005 surveys, and past flood observations).
    - [ ] Remove Hybrid button and associated logic.
    - [ ] Restore and implement LINZ-specific map control buttons.
    - [ ] Generate and verify a full operational report for a test case.

## 🚧 CURRENT BLOCKING VARIABLES / STATES
* **Liquefaction API:** Only available as a `MapServer` (View-Only), not a public `FeatureServer`. Must remain a manual verification step.
* **Server Stability:** `gis.hbrc.govt.nz` is prone to timeouts; must implement robust error handling/timeouts in the engine.
* **Context Management:** Reaching context limits; strictly maintaining `SYSTEM_STATE.md` for continuity.