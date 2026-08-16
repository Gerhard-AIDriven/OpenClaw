# LIM Data Aggregation Analysis: LINZ + Napier Council APIs

**Date:** 2026-08-04  
**Objective:** Determine what property data can be aggregated from public APIs without requiring a formal LIM application

---

## Executive Summary

Based on investigation of available APIs, **significant portions of LIM-equivalent data can be aggregated programmatically** without a LIM application. However, critical legal and compliancecertain categories remain inaccessible without council approval.

---

## Available Data Sources

### 1. LINZ Data Service (via Koordinates Platform)

**Access Method:** 
- Hosted at https://data.linz.govt.nz/
- Powered by Koordinates platform (https://koordinates.com/)
- API requires authentication (API key required)
- All datasets exposed as REST APIs, Esri REST endpoints, and OGC services

**Available Property-Related Datasets:**

#### ✅ Property Ownership & Boundaries Category
- **NZ Parcels** - Legal property boundaries, parcel IDs
- **Titles & Owners** - Certificate of title data, ownership information
- **Land Administrative Areas** - Legal land divisions
- **Survey Data** - Survey plans, boundary marks

#### ✅ Roads and Addresses Category
- **Address Points** - Geocoded address locations (Layer ID: 53608)
- **Full AIMS Street Address** - Complete addressing data
- **Roads** - Road centerlines, road names
- **Street and Places Index** - Official place naming

#### ✅ Topographic Category
- **Building Outlines** - Footprint polygons for structures
- **Imagery** - Aerial photography (basemap available)
- **Historic Imagery** - Temporal aerial records

**API Capabilities:**
- Auto-provisioned REST APIs for every dataset
- Token-managed access control
- Supports vector tiles, raster tiles, cloud-optimized formats
- Version control for spatial data (Kart - Git-style branching)

---

### 2. Napier City Council GIS

**Access Method:**
- ArcGIS Server backend (https://maps.napier.govt.nz/arcgis/rest/services)
- Standard Esri REST API interface
- Public-facing "My Property" portal exists but specific API endpoints need discovery

**Likely Available Layers** (based on standard council GIS deployments):
- Property parcels with rates roll numbers
- Zoning districts (Residential, Commercial, Industrial, etc.)
- Flood hazard zones
- Coastal erosion zones
- Contaminated land registers
- Heritage building overlays
- District Plan zoning maps
- Infrastructure layers (water, wastewater, stormwater)
- Building consent locations (may be aggregated/anonymous)

**Confirmed Portal Features:**
- "My Property" search tool
- "Property Information" pages
- "Rates Database" (public rates search)
- "LIM Application" online form
- "Request a Property File" service

---

## Pricing Breakdown: Free vs Paid

### ✅ FREE Data Sources:

#### LINZ Data Service (via data.linz.govt.nz)
- **Cost:** FREE for most datasets
- **License:** Creative Commons Attribution 4.0 (CC BY 4.0)
- **Requirements:** Just attribute LINZ as source
- **API Access:** Free API key from Koordinates platform
  - Free tier: 500 API queries/month, 1GB storage
  - Suitable for: Testing, low-volume personal use
- **Download Formats:** Shapefile, CSV, GeoJSON, KML, DWG - all free
- **Key Free Datasets:**
  - NZ Address Points (Layer 53608)
  - NZ Parcels (property boundaries)
  - NZ Titles (ownership info)
  - Building Outlines
  - Topographic data

#### Napier Council Public Portal
- **Cost:** FREE
- **Access:** Web browser, no login required
- **Available:**
  - "My Property" search tool
  - Rates Database (property values, rates amounts)
  - Interactive GIS map viewer
  - Basic zoning information (visual only)
- **Limitations:**
  - No bulk download capability
  - Must query one property at a time
  - No API access documented publicly

---

### 💰 PAID Data Sources:

#### Koordinates Platform (API Access to LINZ Data)
**Free Tier:**
- 500 API queries/month
- 1GB vector storage
- 6GB raster storage
- Sufficient for: ~15-25 property reports/month

**Paid Plans (if you exceed free tier):**
- **AI Pro User:** $15 USD/month (~$25 NZD)
  - 10,000 API queries/month
  - 4GB vector storage
  - Suitable for: ~300-500 property reports/month
  
- **Team Plan:** $99 USD/month (~$165 NZD)
  - 100,000 API queries/month
  - 20GB vector storage
  - 2 paid seats included
  - Suitable for: ~3,000-5,000 property reports/month

**Overage Rates (if you exceed plan limits):**
- Query API requests: ~$1.72 USD per 10,000
- Esri REST queries: ~$8.36 USD per 10,000
- Data exports: ~$1.90 USD per GB

#### Napier Council - Formal LIM Application
- **Cost:** ~$300-$450 NZD per property (standard service)
- **Turnaround:** 5-10 working days
- **Expedited:** May be available for extra fee
- **What You Get:** Legally protected report under Building Act 2004

#### Napier Council - Property File Request
- **Cost:** ~$50-$150 NZD (varies by file size/format)
- **Content:** Building consent documents, plans, certificates
- **Turnaround:** 5-15 working days

---

### 💡 The $50-$100 Price Point Explained:

The **$50-$100** I mentioned is for a **commercial "LIM-Lite" service** you could offer to clients, NOT your cost. Here's the economics:

**Your Cost Per Property Report (at scale):**
- LINZ API (Koordinates Team plan): ~$0.03-$0.05 per property
- Napier GIS scraping (your development time): ~$0.02 per property
- Napier Rates Database (free): $0.00
- **Total variable cost:** ~$0.05-$0.10 per property

**Fixed Monthly Costs:**
- Koordinates AI Pro plan: $25 NZD/month (or free if under limits)
- Your development/maintenance time: varies
- **Break-even:** ~10-20 reports/month on free tier

**Revenue Model:**
- Charge clients: $50-$100 per "LIM-Lite" report
- Your margin: ~95%+ after covering API costs
- Value proposition: 70-80% of LIM content at 20-30% of the price

**Why Would Clients Pay $50-$100?**
- Cheaper than full LIM ($300-$450)
- Instant delivery vs 5-10 days waiting
- Good enough for initial screening
- Can screen 5-10 properties for cost of 1 full LIM

**Important Legal Note:**
You MUST disclose that this is NOT a legally protected LIM report and cannot be used for:
- Final settlement decisions
- Bank/mortgage requirements
- Insurance underwriting
- Legal due diligence

This is why pricing at $50-$100 (not $300) - it's an **informational product**, not a **legal product**.

---

## What CAN Be Aggregated (No LIM Required)

### From LINZ:
| Data Category | Specific Fields | LIM Equivalent Section |
|--------------|----------------|----------------------|
| **Legal Description** | Parcel ID, Title Number, Legal Area | Section 1: Property Details |
| **Ownership** | Owner names (from titles), tenure type | Section 1: Property Details |
| **Boundaries** | Boundary coordinates, easements, covenants | Section 1 + Section 8: Encumbrances |
| **Address** | Full address, geocode, valuation number | Section 1: Property Details |
| **Building Footprints** | Structure outlines, approximate age | Partial Section 2: Buildings |
| **Flood Zones (National)** | Regional flood mapping | Section 5: Natural Hazards (partial) |

### From Napier Council GIS (Expected):
| Data Category | Specific Fields | LIM Equivalent Section |
|--------------|----------------|----------------------|
| **Zoning** | District Plan zone, permitted activities | Section 3: Planning/Zoning |
| **Overlays** | Heritage, character, special purpose zones | Section 3: Planning/Zoning |
| **Hazards** | Flood zones, coastal hazards, liquefaction risk | Section 5: Natural Hazards |
| **Infrastructure** | Water/sewer connections, stormwater zones | Section 6: Services |
| **Contamination** | HAIL sites (Hazardous Activities & Industries List) | Section 7: Contamination |
| **Rates** | Capital value, land value, rating unit | Not in LIM (supplementary) |
| **Consents (Aggregated)** | Location of consents (not details) | Partial Section 2: Buildings |

### From Napier Rates Database:
- Current capital value and land value
- Annual rates amount
- Property classification (residential, commercial, etc.)
- Valuation date

---

## What CANNOT Be Aggregated (Requires LIM)

### Critical Missing Data:

| Data Category | Why Unavailable | Risk if Missing |
|--------------|----------------|-----------------|
| **Building Consents (Details)** | Privacy/ownership - requires property-specific request | Unknown unconsented work, compliance issues |
| **Code Compliance Certificates** | Not published publicly | Cannot verify legal completion of buildings |
| **Outstanding Notices** | Legal process data - not public | Hidden liabilities (e.g., repair orders) |
| **Private Drainage Plans** | As-built records held privately | Unknown drainage issues |
| **Contaminant History (Detailed)** | Some historical records not digitized | Environmental liability risk |
| **Utility Connections (Detailed)** | Some providers don't share connection points | Service availability uncertainty |
| **Road Proposals** | Future planning - may be confidential | Potential compulsory acquisition risk |
| **Earthquake Prone Status** | MBIE database - separate system | Structural safety unknown |
| **Insurance Zone Data** | Insurer-specific risk models | Financing/insurance complications |

### Legal Limitations:
1. **LGOIMA Restrictions**: Certain council records only released under Local Government Official Information and Meetings Act request
2. **Privacy Act**: Ownership details may be limited for private individuals
3. **Copyright**: LINZ data has licensing requirements (CC BY 4.0 typically)
4. **Data Currency**: API data may lag behind official register updates

---

## Technical Implementation Approach

### Recommended Architecture:

```
[Property Address/Input]
        ↓
[LINZ API] → Parcel ID, Title, Boundaries, Owner
        ↓
[Napier GIS API] → Zoning, Hazards, Overlays, Infrastructure
        ↓
[Rates Database] → Valuation, Rates Info
        ↓
[Aggregation Engine] → Combine + Deduplicate + Validate
        ↓
[Output: LIM-Lite Report]
```

### API Integration Requirements:

**LINZ:**
- Obtain API key from Koordinates platform
- Implement OAuth2 or token-based authentication
- Cache responses to respect rate limits
- Handle pagination for large datasets

**Napier Council:**
- Discover ArcGIS REST endpoint structure
- Test query capabilities (identify, find, query operations)
- Check for authentication requirements (some layers may be public)
- Implement spatial queries (point-in-polygon for zoning/hazards)

### Estimated Coverage:

**By Data Volume:** ~60-70% of LIM content accessible via APIs  
**By Legal Reliance:** ~40-50% (missing critical compliance certificates)  
**By Risk Mitigation:** ~50-60% (good for initial due diligence, not final settlement)

---

## Use Cases

### Suitable for API-Based Aggregation:
✅ Initial property screening (portfolio analysis)  
✅ Investment feasibility studies  
✅ Pre-offer due diligence  
✅ Market research and comparables  
✅ Automated valuation models (AVM) enhancement  

### NOT Suitable (Full LIM Required):
❌ Final pre-settlement due diligence  
❌ Purchasing without conditions  
❌ Development feasibility (need consent history)  
❌ Insurance assessment (need full hazard disclosure)  
❌ Bank/mortgage requirements (lenders require full LIM)  

---

## Recommendations

### Immediate Actions:
1. **Test Napier GIS API Endpoints** - Query `https://maps.napier.govt.nz/arcgis/rest/services` to enumerate available layers
2. **Apply for LINZ API Key** - Free tier available for development/testing
3. **Build Proof of Concept** - Aggregate data for 5-10 test properties in Napier
4. **Compare Against Real LIM** - Purchase 1-2 actual LIM reports to validate coverage gaps

### Business Model Opportunity:
**"LIM-Lite" Service:** Offer automated preliminary reports at lower cost (~$50-100 vs $300+ for full LIM) for:
- Property investors screening multiple deals
- Real estate agents preparing marketing packs
- Buyers making initial offers (conditional on full LIM)

**Disclaimer Required:** Must clearly state this is NOT a substitute for a formal LIM and does not provide legal protection under the Building Act.

---

## Next Steps

1. Enumerate Napier GIS layers via ArcGIS REST API
2. Document exact API endpoints and query syntax
3. Build sample aggregation script
4. Quantify coverage gaps with real LIM comparison
5. Develop commercial offering (if viable)

---

**Sources:**
- LINZ Data Service: https://data.linz.govt.nz/
- Koordinates Platform: https://koordinates.com/
- Napier Council Property Services: https://www.napier.govt.nz/services/maps-and-property/
- New Zealand Building Act 2004 (LIM provisions)
