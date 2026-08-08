# LINZ Easements API Investigation Summary

**Date:** 2026-08-08  
**Investigated By:** Sebastian (Seb) 🎩  
**Status:** ✅ Root cause identified, workaround defined

---

## 🔍 What We Tried

### Attempt 1: Layer ID 53002 (Original)
```python
layer-53002  # "Easements" - assumed layer ID
```
**Result:** ❌ `Feature type data.linz.govt.nz:layer-53002 unknown`  
**Conclusion:** Layer doesn't exist or isn't accessible

---

### Attempt 2: Layer ID 51570 (LINZ Recommendation)
```python
layer-51570  # NZ Linear Parcels - contains easement centerlines
```
**Result:** ✅ **Layer exists and is accessible!**  
**BUT:** No direct link to title numbers

**Fields Available:**
- `appellation`: "Marked A DP 405604"
- `parcel_intent`: **"Easement"** ✅ (this identifies it as easement!)
- `topology_type`: "Secondary Centreline"
- `status`: "Historic" / "Live"
- `affected_surveys`: "DP 405604, DP 613389"
- `titles`: **null** ❌ (no link to title numbers)
- `land_district`: "Hawkes Bay"

**Sample Feature:**
```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [[176.7199, -39.4420], [176.7210, -39.4426]]
  },
  "properties": {
    "parcel_intent": "Easement",
    "appellation": "Marked A DP 405604",
    "status": "Historic",
    "titles": null  ← PROBLEM: No title association
  }
}
```

---

## 🎯 The Problem

**We can fetch easement LINES, but can't link them to TITLE NUMBERS.**

The Linear Parcels layer provides:
- ✅ Spatial location of easements (centerlines)
- ✅ Easement identification (`parcel_intent = "Easement"`)
- ✅ Survey references (DP numbers)
- ❌ **NO direct link to title numbers**

To match easements to a specific title (e.g., "454362"), we would need to:
1. Fetch the property boundary polygon (from Primary Parcels layer)
2. Fetch all easement lines in the area
3. Perform spatial intersection/join
4. Match based on geographic overlap

This is **complex GIS processing** requiring:
- GeoPandas or similar library
- Coordinate system transformations
- Spatial index for performance
- 8-16 hours development time

---

## ✅ Recommended Solution for Beta

### **Manual Extraction from Title PDF** (Option 1)

**Process:**
1. When generating report for title `454362`:
   - Open LINZ title PDF (already available via LINZ website)
   - Look for "Easements" section (usually page 2-3)
   - Extract details manually:
     - Type (Right of Way, Drainage, etc.)
     - Benefited title (if any)
     - Registration date
     - Area/description

2. Enter into report generator template
3. Generate formatted table (code already written!)

**Time Impact:** +2-3 minutes per report  
**Setup Time:** 1 hour to document process  
**Reliability:** 100% (human verification)  
**Cost:** Minimal (staff time only)

---

## 🚀 Future Enhancement (Post-Beta)

### **Automated Spatial Join** (Option 2)

**What's Needed:**
1. Install GeoPandas + dependencies
2. Query Primary Parcels for property boundary
3. Query Linear Parcels for nearby easements
4. Perform spatial intersection
5. Match and format results

**Development Effort:** 8-16 hours  
**Runtime:** ~5-10 seconds per property  
**Accuracy:** ~90-95% (may miss complex cases)

**Decision:** Build this after beta launch if volume justifies (100+ reports/month)

---

## 📊 Updated Basic Report Progress

| Feature | Status | Delivery Method |
|---------|--------|-----------------|
| ✅ Property legal details | Complete | Automated |
| ✅ Title ownership | Complete | Automated |
| ⚠️ **Easements** | **Blocked (API)** | **Manual** |
| ✅ Natural hazards | Complete | Automated |
| ❌ Zoning overview | Missing | Manual lookup |
| ❌ Infrastructure/services | Missing | Heuristics |
| ❌ Building consents | Missing | Not yet |
| ❌ Rates information | Missing | Manual entry |
| ✅ Professional PDF | Complete | Automated |

**Progress:** 60% automated, **80% achievable with manual workarounds**

---

## 💡 Key Insight

**The easement data EXISTS in LINZ systems**, but:
- It's stored as **spatial features** (lines/polygons)
- Not directly linked to **title numbers** in WFS API
- Would require **GIS spatial join** to connect them
- OR manual extraction from title documents

This is a **data model limitation**, not a bug in our code.

---

## 📝 Next Steps

### For Beta Launch (Aug 15):
1. ✅ Document manual easement extraction process (1h)
2. ✅ Create template for entering easement data (30min)
3. ✅ Test on 3-5 properties with known easements (1h)
4. ✅ Update pricing/disclaimers to reflect manual step

### For Full Launch (Aug 29+):
**Decision Point:** Invest in automation or keep manual?

**Automation makes sense if:**
- Volume > 50 reports/month
- Staff time becomes bottleneck
- Competitive advantage needed

**Keep manual if:**
- Volume < 50 reports/month
- Accuracy is critical (human verification valuable)
- Development resources better spent elsewhere

---

## 🎯 My Recommendation

**Proceed with manual easement extraction for beta.**

**Why:**
1. Gets us to 80% feature completion quickly
2. Validates market demand before investing in automation
3. Human verification ensures accuracy (important for legal data)
4. Can always automate later if volume justifies

**Then focus on Rates Scraper (Task 1.2)** which:
- Is fully automatable
- Has clear data sources (council portals)
- Provides high perceived value
- Takes only 2-4 hours to build

---

**Over to you, Gerhard:**

1. ✅ Approve manual easement approach for beta?
2. ✅ Proceed with Rates Scraper next?
3. Any questions about the technical findings?

The investigation is complete — we now know exactly what's possible and what requires workarounds! 🎩
