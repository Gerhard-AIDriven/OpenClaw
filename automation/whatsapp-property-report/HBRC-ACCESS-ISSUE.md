# HBRC Server Access Issue - 2026-08-16

## Problem
**HBRC ArcGIS REST API is unreachable from outside their network.**

### Test Results (2026-08-16 18:01 NZST)
```bash
# LINZ API - ✅ WORKING
✓ Cyclone Gabrielle layer returns data
✓ Response time: <2 seconds
✓ Detected flood polygons at test location

# HBRC API - ❌ BLOCKED/TIMEOUT
✗ ETIMEDOUT 202.36.185.10:443
✗ All layers unreachable (liquefaction, flood, coastal)
✗ Tested with retry logic (3 attempts, 45s timeout)
```

## Likely Causes

1. **Firewall Restriction** - HBRC GIS server may only allow connections from:
   - HBRC internal network
   - Partner organizations (whitelisted IPs)
   - Specific referer headers

2. **Authentication Required** - May need:
   - API key
   - Token-based auth
   - Referer whitelist registration

3. **Server Down** - Less likely, but possible

## Investigation Steps Needed

### 1. Check Public Accessibility
```powershell
# Test from different networks
curl https://gis.hbrc.govt.nz/server/rest/services/HazardPortal/Earthquake_Liquefaction/MapServer/0/query?where=1%3D1&f=json
```

### 2. Contact HBRC GIS Team
**Email:** gis@hbrc.govt.nz or maps@hbrc.govt.nz  
**Phone:** 0833 204 204

**Ask:**
- Is the ArcGIS REST API publicly accessible?
- Do we need to register for API access?
- Are there usage limits or authentication requirements?
- Can they whitelist our application/IP?

### 3. Alternative Approaches

#### Option A: Use HBRC Public Maps Website
Scrape data from: https://hbmaps.hbrc.govt.nz/
- Requires browser automation (Playwright/Puppeteer)
- More complex but guaranteed access

#### Option B: Download Shapefiles/KML
HBRC may provide downloadable hazard layers:
- Check https://gis.hbrc.govt.nz/hazards/
- Request data under Official Information Act
- Store locally and query with spatial library (turf.js)

#### Option C: Manual Verification Workflow
For MVP launch:
- Auto-fetch LINZ Gabrielle data ✅
- Provide direct links to HBRC maps for manual check
- Add "Verify Hazards" button opening HBRC viewer with coordinates

## MVP Impact

### Current Capability (Working)
✅ LINZ Cyclone Gabrielle flood extent  
✅ Parcel identification (via LINZ WFS)  
⏳ Rates data (scraper ready, needs integration)  

### Missing (HBRC Blocked)
❌ Liquefaction susceptibility  
❌ Flood risk zones  
❌ Coastal inundation  
❌ RCEP hazard zones  

## Recommended MVP Strategy

### Phase 1: Launch with LINZ + Manual HBRC (THIS WEEK)
- Automated: LINZ Gabrielle + Rates + Parcel data
- Manual: Provide HBRC map links in report
- Report clearly states: "Liquefaction/flood hazards require manual verification via HBRC maps"

### Phase 2: Automate HBRC (POST-LAUNCH)
- Contact HBRC for API access
- If denied: Implement browser automation scraper
- If shapefiles available: Download and host locally

## Next Actions

**Gerhard:** Can you contact HBRC GIS team to inquire about API access? Mention:
- AI Driven property due diligence service
- Need programmatic access to hazard layers
- Commercial use case (helping property buyers)
- Willing to comply with terms/attribution

**Seb:** 
- [ ] Document exact HBRC URLs being blocked
- [ ] Research HBRC shapefile downloads
- [ ] Build manual verification workflow (map links in reports)
- [ ] Proceed with rates tier integration (unblocked)

---

**Status:** 🟡 PARTIAL BLOCKER - MVP can launch without HBRC automation, but full automation requires resolution.
