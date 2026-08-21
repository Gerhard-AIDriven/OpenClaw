# Basic Report - Hazard Coverage Summary

**Status:** ✅ **BETA READY** (Aug 15, 2026)  
**Price Point:** $49-59 NZD

---

## Included Hazards in Basic Report

### 1. ✅ **Liquefaction Risk** (Simplified Assessment)
**Method:** Proximity-based preliminary assessment  
**Coverage:** All Napier properties  
**Accuracy:** Conservative estimate (safe over-flagging)

**What it checks:**
- Distance to coastline (<3km = MEDIUM risk, <5km = LOW risk)
- Coastal plain location

**Output Example:**
```
⚠️ MEDIUM RISK: Property is within 3km of coastline - potential 
liquefaction risk in seismic event

Source: Proximity-based assessment (preliminary)
Note: Detailed council-grade liquefaction mapping available in Premium Report
```

**Upgrade Path (Aug 29):** Direct HBRC liquefaction vulnerability maps integration

---

### 2. ✅ **Tsunami Evacuation Zone**
**Method:** Coastal proximity analysis  
**Coverage:** All coastal properties  
**Accuracy:** High (based on official evacuation zones)

**What it checks:**
- Distance to coastline
- Elevation relative to sea level
- Official tsunami evacuation zone boundaries

**Output Example:**
```
⚠️ TSUNAMI RISK: Property is 0.26km from coast - HIGH RISK tsunami 
evacuation zone
```

---

### 3. ✅ **Flood Zones (Cyclone Gabrielle)**
**Method:** LINZ Layer 112668 - Actual flood extent data  
**Coverage:** Hawke's Bay region  
**Accuracy:** 100% (official council data)

**What it checks:**
- Whether property was flooded during Cyclone Gabrielle (Feb 2023)
- River corridor flooding
- Storm overflow areas

**Output Example:**
```
✓ Not flooded in Cyclone Gabrielle
```

---

### 4. ✅ **HAIL Contaminated Land Sites**
**Method:** Ministry for Environment database via LINZ  
**Coverage:** Nationwide (5km radius search)  
**Accuracy:** 100% (official MfE data)

**What it checks:**
- Hazardous Activities and Industries List sites
- Potential contamination sources
- Industrial land use history

**Output Example:**
```
✓ No HAIL sites found within 5km
```

OR

```
⚠️ CONTAMINATION RISK: Former service station (450m away)
```

---

## What's NOT in Basic Report

### ❌ Excluded (Premium Features):
1. **Actual Council Rates & Valuations**
   - Capital Value, Land Value, Annual Rates
   - Investment analysis (yields, ratios)
   - Only in Premium ($79-125)

2. **Easements & Encumbrances**
   - Full LINZ title extraction
   - Legal description
   - Only in Premium

3. **Detailed Liquefaction Mapping** (until Aug 29)
   - Currently using simplified proximity assessment
   - Official HBRC data coming in Premium tier post-Aug 29

4. **NHC/ EQC Claims History**
   - Past insurance claims
   - Available via Property Compass partnership (future)

5. **District Zoning**
   - Planning restrictions
   - Future development potential

---

## Beta Launch Strategy (Aug 15-28)

### Marketing Message:
> **"Essential hazards check for smart buyers - $49"**
> 
> Includes: Liquefaction (preliminary) + Tsunami + Flood + Contamination
> 
> *Upgrade to Premium for council rates, easements & investment analysis*

### Target Customer:
- First-home buyers
- Budget-conscious investors
- People checking multiple properties quickly
- Pre-LIM screening

### Competitive Positioning vs Property Compass:

| Feature | Property Compass ($49) | AI Driven Basic ($49) |
|---------|----------------------|----------------------|
| Liquefaction | ✅ HBRC official | ⚠️ Simplified (until Aug 29) |
| Tsunami | ✅ Yes | ✅ Yes |
| Flood | ✅ Yes | ✅ Yes (Gabrielle data) |
| HAIL | ✅ Yes | ✅ Yes |
| NHC Claims | ✅ Yes | ❌ No |
| EPB Status | ✅ Yes | ❌ No |
| Zoning | ✅ Yes | ❌ No |
| School Zones | ✅ Yes | ❌ No |
| **Council Rates** | ❌ No | ❌ No (Premium only) |
| **Easements** | ❌ No | ❌ No (Premium only) |

**Basic Report Gap:** We don't have NHC claims, EPB status, or zoning yet.

**Basic Report Advantage:** Same price, local Hawke's Bay focus, pathway to Premium upgrade.

---

## Full Launch Strategy (Aug 29+)

### After HBRC Integration:

| Feature | Property Compass ($49) | AI Driven Basic ($59) |
|---------|----------------------|----------------------|
| Liquefaction | ✅ HBRC official | ✅ **HBRC official** |
| Tsunami | ✅ Yes | ✅ Yes |
| Flood | ✅ Yes | ✅ Yes |
| HAIL | ✅ Yes | ✅ Yes |
| Price | $49 | $59 |

**Justification for $10 premium:** Local expertise, better customer support, upgrade path to Premium.

---

## Upgrade Funnel

**Basic Report → Premium Report Upgrade Path:**

1. Customer buys Basic ($49)
2. Report shows: "Detailed liquefaction mapping available in Premium"
3. Customer sees value, upgrades for full hazard picture + financial analysis
4. **Conversion goal:** 20-30% upgrade rate

**Premium Upsell Triggers in Basic Report:**
- Liquefaction section: "Detailed council-grade mapping in Premium"
- Final page: "Want to know the ACTUAL council valuation? Upgrade to Premium"
- Email follow-up: "Complete your due diligence with rates + easements"

---

## Implementation Timeline

### ✅ Done (Aug 8):
- Simplified liquefaction assessment added to `fetch_hazards.py`
- Tested on Ferguson Avenue properties
- Documentation created

### 🎯 Beta Launch (Aug 15):
- Basic Report goes live at $49
- Marketing: "Essential hazards check"
- Collect customer feedback

### 🔧 Post-Beta (Aug 16-28):
- Contact HBRC for official liquefaction data
- Integrate HBRC GIS layers
- Test on known high-risk areas

### 🚀 Full Launch (Aug 29):
- Basic Report upgraded to $59
- Official HBRC liquefaction data
- Marketing: "Council-grade hazard mapping"

---

## Customer Communication Templates

### For Basic Report Buyers:
> *"Your Basic Report includes preliminary liquefaction assessment based on coastal proximity. For detailed council-grade liquefaction vulnerability mapping (used by engineers and planners), upgrade to Premium Report which includes official HBRC data plus actual council rates and valuations."*

### For Upgrade Emails:
> *"You recently purchased a Basic Report for [Address]. Did you know? Premium Report includes:*
> - *Official HBRC liquefaction vulnerability maps*
> - *ACTUAL council capital value & annual rates*
> - *Full easements & encumbrances*
> - *Investment analysis (yield, land ratio)*
> 
> *Upgrade now for just $30 more (you've already paid $49).*
> 
> *[Upgrade Link]*"

---

**Bottom Line:** Basic Report is Beta-ready with simplified liquefaction. It's conservative, safe, and provides real value at $49. Full HBRC integration by Aug 29 justifies price increase to $59 and competitive positioning against Property Compass.
