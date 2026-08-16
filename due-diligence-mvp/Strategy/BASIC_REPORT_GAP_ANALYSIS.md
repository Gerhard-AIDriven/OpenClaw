# Basic Report Gap Analysis

**Date:** 2026-08-08  
**Purpose:** Compare current Tier 1 Enhanced report capabilities vs. marketed Basic Report offering

---

## Marketed Basic Report Features (from index.html)

According to our website pricing section, the **Basic Report ($75)** includes:

1. Property identification & legal details
2. Title ownership & easements
3. Zoning overview
4. Natural hazards assessment
5. Infrastructure & services check
6. HAIL contamination screen
7. Building consents summary (10 yrs)
8. Rates information
9. 7-page professional PDF
10. 24-48 hour turnaround

---

## Current Tier 1 Enhanced Capabilities (as of 2026-08-07)

### ✅ Implemented Features

| Feature | Status | Source | Notes |
|---------|--------|--------|-------|
| **Property identification** | ✅ Complete | LINZ cache | Address, property ID from title data |
| **Legal details** | ✅ Complete | LINZ cache | Title reference, legal description, land area |
| **Title ownership** | ✅ Complete | LINZ cache | Owner names (if not suppressed) |
| **Natural hazards - Flood** | ✅ Complete | Cyclone Gabrielle datasets | Hawke's Bay specific |
| **Natural hazards - Tsunami** | ✅ Complete | GNS Science layers | Evacuation zones |
| **Natural hazards - HAIL** | ✅ Complete | Ministry for Environment | Contaminated land sites (5km radius) |
| **Risk rating algorithm** | ✅ Complete | Proprietary | Critical/High/Medium/Low/Very Low |
| **Professional PDF** | ✅ Complete | wkhtmltopdf | Branded with AI Driven logo |
| **Interactive HTML** | ✅ Complete | Leaflet maps | Online version with clickable map |

**Performance:** 
- Title query: <0.01s (cached)
- End-to-end report: 10-15 seconds
- Validated on real properties (Marewa, Westshore cases)

---

## ❌ Missing Features (Gaps)

### Gap 1: Zoning Overview

**What's Marketed:** District plan zoning classification

**Current State:** ❌ Not implemented

**Data Source Needed:**
- Napier City Council: District Plan zones via GIS API or manual lookup
- Hastings District Council: Planning overlays via HDC Maps
- Central Hawke's Bay: Zone maps via council portal

**Implementation Options:**
1. **Automated:** Council GIS API (if available)
2. **Semi-automated:** Browser automation to extract from council maps
3. **Manual:** Look up zone code during report generation

**Effort Estimate:** 2-4 hours (depends on council data accessibility)

**Priority:** 🔴 **HIGH** - Core feature of Basic report

---

### Gap 2: Infrastructure & Services Check

**What's Marketed:** Status of water, sewer, stormwater connections

**Current State:** ❌ Not implemented

**Data Source Needed:**
- Council assets database (often not public)
- Rates database (sometimes shows service codes)
- Property file requests (manual)

**Implementation Options:**
1. **Automated:** Council rates API (if includes service flags)
2. **Heuristic:** Assume urban = connected, rural = septic/tank water
3. **Manual:** Add as research step during report generation

**Effort Estimate:** 3-5 hours (may require manual process initially)

**Priority:** 🟡 **MEDIUM** - Important but can use heuristics temporarily

---

### Gap 3: Building Consents Summary (10 Years)

**What's Marketed:** List of building consents issued in last 10 years

**Current State:** ❌ Not implemented

**Data Source Needed:**
- Council building consent database
- Public register (some councils provide online search)
- Property file (includes consent history)

**Implementation Options:**
1. **Automated:** Council API (rarely available)
2. **Semi-automated:** Browser automation on council consent search portals
3. **Manual:** Research step during report generation
4. **Alternative:** Note "Available in full LIM" if not feasible

**Effort Estimate:** 4-8 hours (complex due to council variation)

**Priority:** 🟡 **MEDIUM-HIGH** - Differentiator from free sources

---

### Gap 4: Rates Information

**What's Marketed:** Annual rates, capital value, land value, valuation date

**Current State:** ❌ Not implemented

**Data Source Needed:**
- Council rates database (public via online property search)
- Quotable Value NZ (QV) API (paid)
- OneRoof/Homes.co.nz (scraping, terms of service risk)

**Implementation Options:**
1. **Automated:** Council rates portal scraping (Puppeteer)
2. **API:** QV or CoreLogic (paid, but reliable)
3. **Manual:** User enters CV/rates from OneRoof during generation
4. **Hybrid:** Automated where possible, manual fallback

**Effort Estimate:** 2-4 hours (if using council portals)

**Priority:** 🟢 **HIGH** - Easy win, high perceived value

---

### Gap 5: Easements List (Explicit Extraction)

**What's Marketed:** Detailed list of easements affecting property

**Current State:** ⚠️ **TECHNICALLY BLOCKED - MANUAL WORKAROUND AVAILABLE**

**Technical Findings (2026-08-08):**
- LINZ WFS layer-51570 (NZ Linear Parcels) contains easement centerlines ✅
- Field `parcel_intent` = "Easement" identifies easement features ✅
- **BUT:** No direct link to title numbers in WFS response (`titles` field is null)
- Spatial join required: Would need to match easement lines to property boundaries
- Alternative: LINZ may offer separate API endpoint for title-easement associations

**Implementation Options:**
1. **Manual Extraction (RECOMMENDED for Beta)**
   - Extract easement details from LINZ title PDF during report generation
   - Add 2-3 minutes per report for staff time
   - Document process in SOP
   - Effort: 1 hour to create template/process

2. **Spatial Join Development (FUTURE)**
   - Query both Linear Parcels and Primary Parcels layers
   - Perform spatial intersection to match easements to properties
   - Complex, requires GIS processing library (e.g., GeoPandas)
   - Effort: 8-16 hours development + testing

3. **LINZ API Investigation (ONGOING)**
   - Contact LINZ support for correct title-easement association endpoint
   - May require different API (not WFS)
   - Timeline: Uncertain (days to weeks)

4. **Skip for Now**
   - Add disclaimer: "Full easement details available in formal LIM"
   - Reserve detailed easement analysis for Standard/Premium reports
   - Risk: Basic report doesn't match marketed features

**Effort Estimate:** 
- Option 1 (Manual): 1 hour setup + 2-3 min per report
- Option 2 (Spatial): 8-16 hours dev time
- Option 3 (Research): Variable
- Option 4 (Skip): 0 hours

**Priority:** 🟡 **MEDIUM** (downgraded due to technical complexity)

**Decision:** Use Option 1 (manual extraction) for beta launch (Aug 15-29). Investigate Option 2 or 3 for full launch if needed.

---

## Summary Table

| Feature | Status | Priority | Effort | Data Source |
|---------|--------|----------|--------|-------------|
| Property ID & Legal | ✅ Complete | - | - | LINZ |
| Title Ownership | ✅ Complete | - | - | LINZ |
| **Zoning Overview** | ❌ Missing | 🔴 HIGH | 2-4h | Council GIS |
| Natural Hazards | ✅ Complete | - | - | GNS, MfE |
| **Infrastructure/Services** | ❌ Missing | 🟡 MEDIUM | 3-5h | Council Assets |
| HAIL Screen | ✅ Complete | - | - | MfE |
| **Building Consents (10yr)** | ❌ Missing | 🟡 MED-HIGH | 4-8h | Council Consents |
| **Rates Information** | ❌ Missing | 🟢 HIGH | 2-4h | Council Rates |
| **Easements (formatted)** | ⚠️ BLOCKED | 🟡 MEDIUM | 1h (manual) | LINZ PDF (manual) |
| Professional PDF | ✅ Complete | - | - | wkhtmltopdf |
| 24-48hr Turnaround | ✅ Achievable | - | - | Current: 10-15s |

**Current Progress:** 6/10 features complete (60%)  
**With Manual Workarounds:** 8/10 achievable now (80%)

---

## Recommended Implementation Order

### Phase 1: Quick Wins (Week 1)
1. **Easements Formatting** (1-2h)
   - Parse existing LINZ data
   - Create table template
   - Test on sample titles

2. **Rates Information** (2-4h)
   - Build Puppeteer scraper for council rate portals
   - Start with Napier, then Hastings
   - Fallback to manual entry

**Outcome:** 4 of 5 gaps addressed (easements partial → complete)

---

### Phase 2: Core Features (Week 2-3)
3. **Zoning Overview** (2-4h)
   - Extract zone codes from council GIS
   - Map zone codes to plain English descriptions
   - Add permitted activities summary

4. **Building Consents** (4-8h)
   - Research council consent search portals
   - Build browser automation script
   - Handle multi-consent properties

**Outcome:** Basic report feature-complete

---

### Phase 3: Nice-to-Have (Week 4+)
5. **Infrastructure/Services** (3-5h)
   - Investigate council asset data availability
   - Implement heuristic approach if data unavailable
   - Document limitations in report

**Outcome:** Full Basic report spec achieved

---

## Interim Workarounds (Until Automation Complete)

### For Zoning:
- Manual lookup on council GIS during report generation
- Add 2-3 min per report for staff time
- Document process in SOP

### For Rates:
- Use OneRoof manual entry (current workaround in generate-tier1-report.py)
- Customer provides CV/rates in order form (optional field)
- Note "Rates not verified" in disclaimer

### For Building Consents:
- Add statement: "Full consent history available in formal LIM"
- Offer LIM Concierge as upsell
- Manual research for Premium reports only

### For Infrastructure:
- Heuristic: Urban residential = assume all services connected
- Rural/lifestyle = note "likely septic, tank water"
- Verify during Premium consultation call

---

## Impact on Current Operations

### Can We Sell Basic Reports Now?

**Yes, BUT with clear disclosures:**

**What we CAN deliver today:**
- ✅ Property legal details
- ✅ Title ownership
- ✅ Natural hazard assessment (flood, tsunami, HAIL)
- ✅ Risk ratings
- ✅ Professional PDF

**What requires manual work or has limitations:**
- ⚠️ Zoning: Manual lookup (adds 2-3 min)
- ⚠️ Rates: OneRoof manual entry or customer-provided
- ⚠️ Building consents: Not included (note in report)
- ⚠️ Infrastructure: Assumptions based on location

**Recommended Approach:**
1. Update website FAQ to clarify data sources
2. Add "Report Contents" page showing what's automated vs. manual
3. Offer "Basic Lite" at $50 until all features implemented
4. OR: Delay Basic launch until Phase 2 complete (2-3 weeks)

---

## Technical Implementation Notes

### Data Source Priority Matrix

| Source | Reliability | Access Method | Cost | Priority |
|--------|-------------|---------------|------|----------|
| LINZ API | ⭐⭐⭐⭐⭐ | REST API (free) | Free | Use first |
| Council GIS | ⭐⭐⭐⭐ | Web scraping / API | Free | High |
| Council Rates | ⭐⭐⭐⭐ | Web scraping | Free | High |
| Council Consents | ⭐⭐⭐ | Web portal (manual) | Free | Medium |
| QV API | ⭐⭐⭐⭐⭐ | REST API (paid) | $$$ | Low (expensive) |
| OneRoof | ⭐⭐ | Scraping (ToS risk) | Free | Last resort |

### Code Structure Recommendations

```
due-diligence-mvp/
├── generators/
│   ├── tier1_basic.py (NEW - combines existing + new features)
│   ├── tier2_standard.py (FUTURE)
│   └── tier3_premium.py (FUTURE)
├── data_sources/
│   ├── linz_client.py (existing)
│   ├── council_napier.py (NEW)
│   ├── council_hastings.py (NEW)
│   ├── council_chb.py (NEW)
│   └── rates_scraper.py (NEW)
├── templates/
│   ├── basic_report.html (UPDATE - add new sections)
│   ├── standard_report.html (FUTURE)
│   └── premium_report.html (FUTURE)
└── config/
    ├── councils.json (NEW - endpoints, selectors)
    └── zoning_codes.json (NEW - mapping to plain English)
```

---

## Testing Requirements

Before launching Basic Report:

- [ ] Test zoning lookup on 10+ properties (different zones)
- [ ] Verify rates accuracy vs. council records (5+ properties)
- [ ] Validate building consent completeness (compare to actual LIM)
- [ ] Confirm infrastructure assumptions correct (spot-check 5+ properties)
- [ ] Time manual steps (ensure <10 min total per report)
- [ ] Customer review of sample reports (clarity, usefulness)

---

## Success Criteria

**Basic Report is "Complete" when:**

1. All 10 marketed features are present and accurate
2. Generation time <15 minutes (including manual steps)
3. Cost to produce < $15 (labor + overhead)
4. Customer satisfaction > 4.5/5 stars
5. No material errors in 20+ consecutive reports

**Current Progress:** 6/10 features complete (60%)

**Target Date for 100%:** 2026-08-29 (3 weeks from today)

---

## Decision Required

**Gerhard to Decide:**

**Option A: Launch Now (with limitations)**
- Price at $50-60 until feature-complete
- Clear disclaimers about missing data
- Manual workarounds acceptable
- Revenue starts flowing immediately

**Option B: Wait Until Complete (3 weeks)**
- Launch at full $75 price
- All features working
- Stronger market positioning
- No rework or customer disappointment

**Recommendation:** Option A with tight timeline (Phase 1 done in 1 week, launch "Beta Basic" at $60, increase to $75 when 100% complete)

---

**Next Steps:**
1. Gerhard decides on launch strategy
2. If Option A: Update website copy to reflect beta status
3. Begin Phase 1 implementation (easements + rates)
4. Schedule weekly progress reviews

---

*Last Updated: 2026-08-08*  
*Owner: Development Team*  
*Status: Pending Decision*
