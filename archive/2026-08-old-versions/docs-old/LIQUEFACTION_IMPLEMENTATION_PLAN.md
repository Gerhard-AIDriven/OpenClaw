# Liquefaction Hazard Implementation Plan

## Current Status (2026-08-08 21:00)

### What We Tried:
- ✅ Queried LINZ for liquefaction layers
- ❌ Layer 50783 (GNS Liquefaction Hazard): Returns data but not for Napier coordinates
- ❌ Layer 50784 (GNS Liquefaction Susceptibility): Actually geodetic survey marks, NOT liquefaction data!

### The Problem:
The LINZ WFS layers we found don't have comprehensive liquefaction coverage for Hawke's Bay/Napier. This explains why Property Compass likely sources their data directly from **Hawke's Bay Regional Council (HBRC)**, not LINZ.

---

## Options for Basic Report Tier

### Option 1: Use Property Compass as Data Source ⭐ RECOMMENDED
**Approach:** 
- Subscribe to Property Compass API (if available)
- Or manually check their reports for Napier properties
- Include their liquefaction assessment in our Basic Report

**Pros:**
- Immediate implementation
- Accurate, council-sourced data
- No development time needed

**Cons:**
- Dependency on third party
- Potential cost per query

---

### Option 2: Direct HBRC GIS Integration
**Approach:**
- Contact HBRC for direct GIS data access
- Download liquefaction shapefiles from HBRC portal
- Add to our local database (like we did with LINZ titles)

**Pros:**
- Direct from source (most accurate)
- One-time setup
- No ongoing costs

**Cons:**
- Requires outreach to HBRC
- May need data sharing agreement
- Development time to integrate

---

### Option 3: Simplified Proximity-Based Assessment
**Approach:**
- Use geological maps to identify high-risk zones
- Flag properties within X km of rivers/coast as "potential liquefaction risk"
- Note: "Detailed liquefaction assessment available in Premium report"

**Pros:**
- Quick to implement
- Conservative (safe) approach

**Cons:**
- Less accurate than council data
- May over-flag properties

---

### Option 4: Partner with Property Compass ⭐ LONG-TERM
**Approach:**
- White-label their hazard reports for Basic tier
- Focus our development on Premium features (rates, investment analysis)
- Revenue share model

**Pros:**
- Best-in-class hazard data immediately
- Focus on our unique value (financial analysis)
- Faster time to market

**Cons:**
- Revenue sharing
- Less control over quality

---

## Recommended Path Forward

### For Beta Launch (Aug 15):
**Use Option 3 (Simplified Assessment)** for Basic Report:
```python
def assess_liquefaction_risk_simple(lat, lon):
    """
    Simple proximity-based liquefaction risk for Basic Report
    Until HBRC data integration is complete
    """
    # Check distance to coast (higher risk near coast)
    # Check distance to rivers (higher risk near waterways)
    # Return conservative estimate
    
    if distance_to_coast < 2km and elevation < 10m:
        return "POTENTIAL RISK - Near coastal area"
    elif distance_to_river < 500m:
        return "POTENTIAL RISK - Near river system"
    else:
        return "LOW RISK - Not in high-risk zone"
```

**Message to customers:**
> *"Basic Report includes preliminary liquefaction assessment. For detailed council-grade liquefaction mapping, upgrade to Premium Report."*

### For Full Launch (Aug 29+):
**Implement Option 2 (Direct HBRC Integration)**:
- Contact HBRC GIS team
- Obtain official liquefaction vulnerability maps
- Integrate into fetch_hazards.py
- Market as "Council-grade hazard data"

---

## Competitive Positioning

### Property Compass:
- ✅ Comprehensive liquefaction data (HBRC sourced)
- ✅ 56 councils nationwide
- ❌ No financial analysis
- ❌ No rates data
- ❌ No easements

### AI Driven Basic ($49-59):
- ✅ Flood (Gabrielle)
- ✅ Tsunami
- ✅ HAIL sites
- ⚠️ Liquefaction (simplified until HBRC integration)
- ❌ No rates (our premium feature)
- ❌ No investment analysis (premium)

### AI Driven Premium ($79-125):
- ✅ ALL hazards (including full liquefaction post-Aug29)
- ✅ **ACTUAL council rates & valuations** (UNIQUE)
- ✅ Easements (UNIQUE)
- ✅ Investment analysis (UNIQUE)
- ✅ Professional interactive reports

---

## Next Steps

1. **Immediate (Before Aug 15):**
   - [ ] Add simplified liquefaction assessment to `fetch_hazards.py`
   - [ ] Update Basic Report marketing materials
   - [ ] Test on known Napier properties

2. **Post-Beta (Aug 16-28):**
   - [ ] Contact HBRC GIS department
   - [ ] Request liquefaction data access
   - [ ] Integrate official data

3. **Full Launch (Aug 29):**
   - [ ] Market "Council-grade hazard data"
   - [ ] Premium positioning justified

---

**Bottom Line:** We can launch Beta with simplified liquefaction assessment, then upgrade to official HBRC data for full launch. Our UNIQUE value (rates + investment analysis) is already working perfectly.
