# ACTIVE WORK SCRATCHPAD

## 🎯 CURRENT OBJECTIVE
* Remove Hybrid view and restore LINZ map control buttons in reports.

## 📝 ACTIVE STEP-BY-STEP CHECKLIST
- [x] Step 1: Review and internalize `system_state.md` and `current_task.md` protocols.
- [x] Step 2: Base update of `system_state.md` with current architectural truths.
- [x] Step 3: Base update of `current_task.md` to capture current state.
- [x] Step 4: Remove duplicate Leaflet JS script tag at the bottom of `report-engine-v2.js`.
- [x] Step 5: Wrap map initialization in `DOMContentLoaded` listener in `report-engine-v2.js` to prevent race conditions.
- [x] Step 6: Verify report generation with a test case to confirm map displays correctly.
- [x] Step 7: Update `toggleLayer` logic in `report-engine-v2.js` to stack Satellite, Street, AND Reference layers for the 'hybrid' view.
- [ ] Step 8: Remove Hybrid button and its associated logic from `report-engine-v2.js`.
- [ ] Step 9: Restore and implement the LINZ-specific map control buttons (as per previous versions).
- [ ] Step 10: Generate and verify a full operational report for "28 Logan Avenue" with the new buttons.
- [ ] Step 11: Perform "Sign-Out Update" to `SYSTEM_STATE.md` and `CURRENT_TASK.md`.

## 📊 CURRENT BLOCKING VARIABLES / STATES
* **Change of Direction:** User determined Hybrid view adds no value; wants restoration of LINZ-specific map controls.
* **Continuity:** Now strictly adhering to Context Failsafe measures.
