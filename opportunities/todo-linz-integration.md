# LINZ Titles API Integration - Master Plan

## 🎯 Strategic Importance
**This is our competitive edge.** Without LINZ integration, we're just repackaging free council data available on MyProperty. LINZ provides:
- ✅ **Nationwide coverage** (not just Napier)
- ✅ **Official title data** (authoritative source)
- ✅ **Complete easement information** (critical for due diligence)
- ✅ **Ownership details** (who owns the property)
- ✅ **Legal descriptions** (exact boundaries)
- ✅ **Professional credibility** (official government data)

## Current Status (Beta Phase)
✅ **Working:** Napier MyProperty scraper extracts title data for Napier properties only
⚠️ **Limitation:** Hastings/other districts show "Title data unavailable"
⚠️ **Risk:** No competitive differentiation from free council websites

---

## 🔍 What We've Learned (Critical Intelligence)

### LINZ API Structure
- **Base URL:** `https://data.linz.govt.nz/services/api/v1/`
- **API Key:** `b2e35aafd4e848e9b0265f1caf575255` (already configured)
- **Two main approaches:**
  1. **Vector Query API** - Query by attributes (title number, etc.)
  2. **WFS (Web Feature Service)** - OGC standard for geospatial data

### Previous Failures & Lessons
❌ **Attempt 1:** Layer ID `51306` returned 404 (layer doesn't exist or wrong format)
❌ **Attempt 2:** WFS query with `address_number='31'` worked for geocoding but not titles
❌ **Attempt 3:** Direct vector query to `/layers/{id}/features/` returned 403 (permission denied)

**Root Cause Analysis:**
- LINZ has **multiple data services** with different access patterns
- Cadastre titles may require **Landonline Data Service** specifically
- Some layers require **authentication beyond API key** (OAuth, referer restrictions)
- Title boundaries are **polygons**, not points - need spatial queries

### What Works
✅ **LINZ Geocoding API** - Successfully converts addresses to coordinates
✅ **LINZ Address Finder** - Fuzzy matching works well
✅ **Napier MyProperty Scraper** - Reliable for Napier City properties

---

## 📋 Implementation Plan

### Phase 1: Deep Research & Discovery (2-3 hours)
**Goal:** Identify the EXACT LINZ service/endpoint for cadastre titles

#### Step 1.1: LINZ Data Catalogue Investigation
- [ ] Browse https://data.linz.govt.nz/ to find cadastre title layers
- [ ] Search for "cadastre", "title", "parcel" in catalogue
- [ ] Note layer IDs, API endpoints, access requirements
- [ ] Check if Landonline Data Service is separate from main LINZ API

#### Step 1.2: API Documentation Review
- [ ] Read LINZ Services API docs: https://data.linz.govt.nz/services/api/v1/docs/
- [ ] Review Landonline Data Service docs (if separate)
- [ ] Identify authentication requirements (API key vs OAuth)
- [ ] Find example queries for title searches

#### Step 1.3: Test Endpoints Manually
- [ ] Use curl/Postman to test candidate endpoints
- [ ] Try different layer IDs until one returns title data
- [ ] Test both vector query and WFS approaches
- [ ] Document working query format

#### Step 1.4: Competitor Analysis
- [ ] Check how other NZ property sites get title data
- [ ] Look at homes.co.nz, oneroof.co.nz, realestate.co.nz
- [ ] See if they use LINZ or alternative sources
- [ ] Note what data they display (our benchmark)

### Phase 2: Module Development (4-6 hours)
**Goal:** Build robust `linz-titles-api.js` module

#### Step 2.1: Core Functions
```javascript
// Search title by coordinates (reverse lookup)
async function getTitleByCoordinates(lat, lon)

// Search title by title number (direct lookup)
async function getTitleByNumber(titleNumber)

// Search title by legal description
async function getTitleByLegalDescription(legalDesc)

// Extract complete title details from LINZ response
function parseTitleData(linzResponse)
```

#### Step 2.2: Data Extraction
Extract from LINZ response:
- [ ] Title number (Record of Title)
- [ ] Legal description (Lot/DP, Section, etc.)
- [ ] Area (hectares)
- [ ] Ownership type (freehold, leasehold, etc.)
- [ ] Registered owners (names, tenure shares)
- [ ] All easements (type, description, benefited/burdened titles)

---

## 🔜 NEW INVESTIGATION: NIWA Flood Data

**Priority:** HIGH  
**Added:** 2026-08-24 12:42  
**Reason:** Current flood data limited to Cyclone Gabrielle event (LINZ Layer 112668). Need comprehensive nationwide flood modeling.

### Research Questions:
1. What flood hazard datasets does NIWA provide?
   - River flooding models
   - Pluvial flooding (rainfall-induced)
   - Storm surge modeling
   - Sea level rise projections
   
2. How can we access NIWA data?
   - Public API?
   - WMS/WFS services?
   - Downloadable shapefiles/rasters?
   - Commercial licensing required?

3. Is NIWA data better than current approach?
   - Current: LINZ Gabrielle zones + HBRC elevation estimates
   - NIWA potential: Comprehensive physics-based flood modeling
   - Coverage: Nationwide vs event-specific

### Action Items:
- [ ] Browse NIWA website for flood hazard data
- [ ] Check NIWA Science publications on flood modeling
- [ ] Contact NIWA for commercial use inquiry (if needed)
- [ ] Test any available APIs or WMS endpoints
- [ ] Compare NIWA flood maps vs LINZ Layer 112668
- [ ] Integrate into `hazards-linz-integration.js` if superior

**Expected Outcome:** More accurate, comprehensive flood risk assessments for ALL NZ properties (not just Gabrielle-affected areas)
- [ ] Parcel boundaries (GeoJSON polygon)
- [ ] Covenants, encumbrances, caveats

#### Step 2.3: Error Handling
- [ ] Handle "no title found" gracefully
- [ ] Retry logic for rate limiting (429 responses)
- [ ] Fallback to scraper if LINZ fails
- [ ] Log all API calls for debugging

### Phase 3: Integration (2-3 hours)
**Goal:** Wire LINZ into the report generation workflow

#### Step 3.1: Update Poll Script
In `poll-automated-reports-v2.js`:
```javascript
// NEW: Try LINZ first, fallback to scraper
let titleData = await getLINZTitleData(coordinates);
if (!titleData) {
  console.log('ℹ️  LINZ failed, trying council scraper...');
  titleData = await getCouncilRatesData(address);
}
```

#### Step 3.2: Data Merging Strategy
- [ ] LINZ provides: title number, ownership, easements, legal desc
- [ ] Scraper provides: rates, valuations, building consents
- [ ] Merge both sources for comprehensive report
- [ ] Resolve conflicts (prefer LINZ for title data)

#### Step 3.3: Report Template Updates
- [ ] Add "Data Source" badges (LINZ vs Council)
- [ ] Show more detailed ownership info if available
- [ ] Display easement table with full details
- [ ] Add parcel boundary map overlay (optional)

### Phase 4: Testing & Validation (2-3 hours)
**Goal:** Prove LINZ integration works reliably

#### Test Cases:
- [ ] **Napier property** (31 Douglas McLean Ave) - compare LINZ vs scraper accuracy
- [ ] **Hastings property** (132 Priestley Terrace) - verify LINZ works where scraper fails
- [ ] **Unit title** - test multi-unit property handling
- [ ] **Cross-lease** - test complex ownership structures
- [ ] **Large rural property** - test with multiple parcels
- [ ] **Māori land** - test special title types

#### Validation:
- [ ] Cross-check LINZ data against official titles (buy a title deed)
- [ ] Verify easement completeness
- [ ] Measure API response times (<5s target)
- [ ] Monitor API usage/costs

---

## 🚀 Success Criteria

### Minimum Viable Product (MVP)
- [ ] LINZ returns title data for 80%+ of NZ residential properties
- [ ] Easement information is complete and accurate
- [ ] API response time <5 seconds
- [ ] Graceful fallback to scraper when LINZ fails

### Competitive Advantage Achieved When:
- [ ] Reports show **ownership details** (not just "unavailable")
- [ ] **Easements are fully listed** with legal descriptions
- [ ] Works **nationwide** (not just Napier)
- [ ] Data is **more comprehensive** than free council websites
- [ ] Customers say "Wow, I can't get this elsewhere for free"

---

## 📊 Business Impact

### Without LINZ:
- ❌ Just repackaging free council data
- ❌ Limited to Napier City (scraper dependency)
- ❌ No competitive moat
- ❌ Hard to justify paid tier

### With LINZ:
- ✅ **Unique value proposition** (comprehensive title reports)
- ✅ **Nationwide coverage** (scalable beyond Napier)
- ✅ **Professional-grade data** (lawyers, valuers, investors)
- ✅ **Premium pricing justified** ($49-99 per report)
- ✅ **B2B opportunities** (real estate agencies, law firms)

---

## ⏭️ Next Actions

1. **[IMMEDIATE]** Spend 2-3 hours on Phase 1 research
   - Find the correct LINZ endpoint for cadastre titles
   - Test manually with curl until it works
   - Document exact API call format

2. **[ONCE WORKING]** Build the module (Phase 2)
3. **[THEN]** Integrate into reports (Phase 3)
4. **[FINALLY]** Test thoroughly (Phase 4)

---

## 📝 Historical Notes

### Previous Attempts (for reference)
**Date:** 2026-08-24  
**Attempted:** Vector query to layer 51306  
**Result:** 404 Not Found  
**Learnings:** Wrong layer ID, need to search LINZ catalogue properly

**Date:** 2026-08-24  
**Attempted:** WFS query with address matching  
**Result:** Worked for geocoding, not for titles  
**Learnings:** Geocoding and titles are different datasets

### Key Insight
The Napier MyProperty scraper is a **temporary workaround**, not the endgame. LINZ integration is what makes this business viable long-term. Don't get stuck perfecting the scraper - invest in LINZ.

---

## 🔗 Reference Links
- LINZ Data Catalogue: https://data.linz.govt.nz/
- LINZ Services API: https://data.linz.govt.nz/services/api/v1/
- Landonline Data Service: (TBD - need to find URL)
- NZ Property Titles: https://www.linz.govt.nz/property/property-titles
