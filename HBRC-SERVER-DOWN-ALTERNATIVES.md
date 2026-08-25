# 🚨 HBRC Maps Server Down - Alternative Strategy

**Date:** 2026-08-16 12:05 GMT+2  
**Status:** CRITICAL - All HBRC public maps offline  
**Error:** Cloudflare 523 "Origin is unreachable"  
**Affected:** `hbmaps.hbrc.govt.nz` (entire domain)

---

## ❌ WHAT'S NOT WORKING

All HBRC map links are failing:
- Main hazards map: `https://hbmaps.hbrc.govt.nz/?lat=-39.4928&lon=176.912` ❌
- Liquefaction layer: `.../layer=Earthquake_Liquefaction` ❌
- Flooding layer: `.../layer=Flooding` ❌
- Coastal inundation: `.../layer=Coastal_Inundation` ❌
- Tsunami zones: `.../layer=Tsunami` ❌

**This is NOT our code** - HBRC's entire public mapping infrastructure is offline.

---

## ✅ WHAT STILL WORKS

### 1. LINZ Cyclone Gabrielle Flood Layer ✅
- **Layer ID:** 112668
- **Status:** FULLY OPERATIONAL
- **Data:** Satellite radar flood extent (Feb 2023)
- **Accuracy:** High - real satellite data
- **Our Integration:** Working perfectly

### 2. LINZ Parcel & Title Data ✅
- **Status:** FULLY OPERATIONAL
- **Data:** Legal descriptions, ownership, boundaries
- **Our Integration:** Working perfectly

---

## 🎯 REVISED BETA STRATEGY OPTIONS

### Option A: Launch with Gabrielle Data Only (RECOMMENDED)
**Positioning:** "Cyclone Gabrielle Flood Check + LINZ Title Report"

**What You Offer:**
✅ LINZ parcel & title data (legal description, tenure, area)  
✅ Cyclone Gabrielle flood assessment (satellite data)  
⚠️ Clear disclaimer: "Other hazard layers temporarily unavailable due to HBRC system outage"

**Pricing:**
- Basic Tier: $79 NZD (Gabrielle flood check only)
- Standard Tier: $129 NZD (Gabrielle + rates breakdown)

**Beta Messaging:**
> "Due to Hawke's Bay Regional Council mapping system outage, our beta reports currently include Cyclone Gabrielle flood data (the most critical recent event). Full hazard suite will be added when HBRC systems are restored."

**Pros:**
- Can launch Monday as planned
- Transparent about limitation
- Gabrielle data is MOST VALUABLE for Hawke's Bay buyers
- Lower price point attractive for beta

**Cons:**
- Not full hazard suite
- Need to monitor HBRC restoration

---

### Option B: Delay Launch Until HBRC Restored
**Wait for:** HBRC maps to come back online

**Monitoring:**
```bash
# Check every few hours
curl -I https://hbmaps.hbrc.govt.nz
# Look for HTTP 200 instead of 523 error
```

**Pros:**
- Full hazard suite as planned
- No compromise on offering

**Cons:**
- Launch delayed indefinitely
- HBRC may take days/weeks to restore
- Missing market opportunity

---

### Option C: Research Alternative Hazard Data Sources

#### Potential Alternatives:

**1. GNS Science - GeoNet**
- Earthquake hazard data
- Landslide susceptibility
- URL: `https://www.geonet.org.nz/`
- API: May have open data portal

**2. NIWA Climate Data**
- Historical flood data
- Coastal hazard modeling
- URL: `https://niwa.co.nz/`

**3. MfE Data Service (Ministry for the Environment)**
- National flood maps
- Coastal hazard zones
- URL: `https://data.mfe.govt.nz/`

**4. EQC (Earthquake Commission)**
- Natural hazard insurance data
- Risk assessments by region

**Research Tasks:**
- [ ] Check GNS Science GeoNet API
- [ ] Search MfE data portal for flood layers
- [ ] Contact NIWA for hazard data access
- [ ] Research QV (Quotable Value) hazard integration

**Timeline:** 2-3 days research minimum

---

## 💡 RECOMMENDED ACTION PLAN

### Immediate (Today - Sunday)

**1. Document HBRC Outage**
- Screenshot error messages
- Note timestamp of first failure
- Check HBRC social media for announcements

**2. Test HBRC Status Page**
```bash
# Try main HBRC website
curl -I https://www.hbrc.govt.nz

# Try ArcGIS server directly
curl -I https://gis.hbrc.govt.nz/server/

# Check if it's just maps or everything
```

**3. Email HBRC GIS Team (Follow-up)**
Subject: URGENT: hbmaps.hbrc.govt.nz Unreachable - System-Wide Outage?

> Hi HBRC GIS Team,
> 
> I'm trying to access the public hazards maps at hbmaps.hbrc.govt.nz but receiving Cloudflare Error 523 "Origin is unreachable".
> 
> Is this a known outage? Do you have an ETA for restoration?
> 
> This affects property owners trying to verify hazard information.
> 
> Regards,  
> Gerhard Stimie  
> AI Driven

**4. Prepare Beta Launch with Gabrielle-Only Data**
- Update landing page messaging
- Adjust pricing tiers
- Prepare disclaimer text

### Monday Morning

**Decision Point:** Check HBRC status at 8:00 AM

**If HBRC Still Down:**
- Launch beta with Gabrielle-only data (Option A)
- Clear communication about temporary limitation
- Focus on Gabrielle flood as PRIMARY concern for Hawke's Bay

**If HBRC Restored:**
- Proceed with original full launch plan
- Test all manual verification links
- Include full hazard suite

---

## 📝 UPDATED BETA OFFERING (If HBRC Stays Down)

### AI Driven Property Reports - Beta Launch

**Tier 1: Gabrielle Flood Check - $79 NZD**
```
✅ LINZ Cyclone Gabrielle flood assessment
✅ Satellite radar data (Feb 2023)
✅ Property intersection analysis
✅ Flood polygon count & proximity
⚠️ Other hazards: Temporarily unavailable (HBRC outage)
```

**Tier 2: Standard Due Diligence - $129 NZD**
```
✅ Everything in Tier 1
✅ LINZ parcel & title data
✅ Napier Council rates breakdown
✅ Legal description verification
⚠️ Other hazards: Temporarily unavailable (HBRC outage)
```

**Clear Disclaimer:**
> "Hawke's Bay Regional Council mapping systems are currently offline (as of 2026-08-16). Our reports currently include the critical Cyclone Gabrielle flood layer from LINZ. Full hazard suite (liquefaction, flooding, coastal, tsunami) will be added automatically when HBRC systems are restored. Beta customers receive free upgrade when available."

---

## 🎯 MY STRONG RECOMMENDATION

**Launch Monday with Option A (Gabrielle-Only) IF:**

1. HBRC maps still down Monday 8 AM
2. You position it transparently as "temporary limitation"
3. You price it attractively ($79/$129 vs $149/$199)
4. You promise free upgrade when HBRC restored

**Why?**
- Gabrielle flood is THE #1 concern for Hawke's Bay buyers post-2023
- LINZ data is ACCURATE and RELIABLE
- Customers get REAL VALUE even without other layers
- Market validation > perfect product
- Revenue starts flowing during beta

**But DO NOT launch if:**
- You're uncomfortable with the limitation
- You want full hazard suite before ANY customer sees it
- You think HBRC will be up Monday (check Sunday night)

---

## 🔍 NEXT STEPS (Your Call, Gerhard)

**Option 1:** Check HBRC status now
```bash
curl -I https://hbmaps.hbrc.govt.nz
```

**Option 2:** Research alternative data sources tonight
- GNS Science GeoNet
- MfE data portal
- NIWA climate data

**Option 3:** Prepare revised beta landing page
- Update feature list
- Add outage notice
- Adjust pricing

**Option 4:** Wait until Monday morning to decide

**What's your preference?** 🤔
