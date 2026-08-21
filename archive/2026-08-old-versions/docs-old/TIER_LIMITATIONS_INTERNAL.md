# Due Diligence Report - Tier Limitations (Internal Reference)

**Document Purpose:** Internal guide for what each report tier includes/excludes. Use this to:
- Answer customer questions about tier differences
- Decide what to highlight in marketing vs. disclaimers
- Train team on data source limitations
- Avoid legal/compliance issues

**Last Updated:** 2026-08-07  
**Status:** Beta – pending beta testing feedback

---

## Tier Overview

| Feature | Basic ($75) | Standard ($125) | Premium ($200-300) |
|---------|-------------|-----------------|---------------------|
| **Turnaround Time** | Instant (automated) | 1-2 hours | 4 hours (manual review) |
| **Target Customer** | Quick screening, curious buyers | Serious buyers, investors | Pre-purchase due diligence |
| **Profit Margin** | ~85% (fully automated) | ~75% (some manual checks) | ~60% (significant manual work) |

---

## Data Source Matrix

### ✅ FREE Data Sources (Available to All Tiers)

| Data Source | What It Provides | Limitations | Update Frequency |
|-------------|------------------|-------------|------------------|
| **LINZ Title (free viewer)** | Title ref, legal desc, area, owner count, issue date | ❌ No owner names, no encumbrances, no mortgages | Real-time |
| **OneRoof.co.nz** | AVM estimate, RV breakdown, recent sales, suburb stats | ⚠️ Estimate only (not valuation), sales data may lag | Daily/Weekly |
| **Google Maps Static API** | Location map with property marker | ⚠️ Requires API key ($200/mo free credit), static image only | Real-time |
| **LINZ Data Service (free tier)** | Building outlines, basic boundaries | ⚠️ API limits (1000 calls/day), some layers require auth | Real-time |
| **QV.co.nz (public pages)** | Sales history, RV data | ⚠️ Limited detail without subscription | Monthly |

### 💰 PAID Data Sources (Standard/Premium Only)

| Data Source | Cost | What It Provides | Best For |
|-------------|------|------------------|----------|
| **LINZ Title Register (official)** | $12/title | Owner names, transfer dates, all instruments, mortgages, caveats | Standard+ |
| **Council LIM** | $300-450 | Full council files, consents, hazards, zoning, rates, code compliance | Premium (resell) |
| **Council GIS API Access** | Varies (some free) | Flood zones, zoning overlays, district plans | Standard/Premium |
| **QV Subscription** | ~$100/mo | Detailed sales history, ownership trends, market analytics | Premium (bulk orders) |
| **CoreLogic NZ** | Custom pricing | Comprehensive property data, risk reports, valuations | Enterprise only |

---

## Tier-by-Tier Breakdown

### 🥉 TIER 1: BASIC ($75)

#### Includes ✅
1. **Property Identification**
   - Full address (from user input)
   - Coordinates (geocoded from address)
   - Suburb, city, postcode

2. **Legal Summary (Free LINZ Data)**
   - Title reference number
   - Legal description (Lot/DP)
   - Land area (m²)
   - Title type (Freehold/Unit/Cross Lease)
   - Issue date
   - Number of current owners
   - Guarantee status

3. **Valuation Data**
   - OneRoof automated estimate
   - Confidence rating (High/Medium/Low)
   - Council RV (land + improvements breakdown)
   - Valuation range (low-high estimate)

4. **Sales History**
   - Most recent sale date & price (per OneRoof/QV public data)
   - Suburb average sale price context
   - Sales vs RV ratio for suburb

5. **Maps & Visuals**
   - Google Maps static location map
   - Building outline footprint (if available via LINZ)

6. **Market Context**
   - Suburb sales trends (last 12 months)
   - Active listings count
   - Market temperature indicator (buyer's/seller's market)

7. **Executive Summary**
   - 2-3 paragraph overview
   - Key metrics table
   - Quick assessment/recommendation

#### Excludes ❌
- Current owner names
- Mortgages, caveats, or liens
- Easements, covenants, encumbrances
- Flood zone or hazard mapping
- Zoning or land use rules
- Building consent history
- Rates information
- School zones
- Physical inspection

#### Ideal Customer Profile
- First-home buyers doing initial screening
- Investors filtering multiple properties
- Curious homeowners checking their own property value
- Real estate agents preparing listing appraisals
- People who want "more than Trade Me, less than LIM"

#### Legal/Compliance Notes
⚠️ **Must include disclaimer:** "This is an informational report only, not a LIM or legal advice."  
⚠️ **Cannot claim:** "Comprehensive due diligence" or "LIM substitute"  
✅ **Can claim:** "Fast property screening," "Preliminary intelligence," "More detailed than Trade Me insights"

---

### 🥈 TIER 2: STANDARD ($125)

#### Includes Everything in Basic, PLUS ✅
1. **Full Title Register** ($12 cost)
   - Current registered owner names
   - Transfer registration date
   - Purchase price (from transfer instrument)
   - All instruments registered against title

2. **Encumbrance Summary**
   - List of easements (type, benefited party)
   - Covenants (brief description)
   - Caveats (if any lodged)
   - Mortgages (lender name only, not amount)

3. **Basic Council Data** (via free GIS APIs where available)
   - Zoning designation (e.g., "Residential - Single Dwelling")
   - Flood zone indicator (Low/Medium/High risk)
   - District Plan link for full rules

4. **Enhanced Sales History**
   - Last 3-5 sales (if data available)
   - Sale prices adjusted for inflation (optional)
   - Days on market for recent sales

5. **Rates Information** (if council provides public access)
   - Current RV for rates purposes
   - Annual rates amount
   - Payment status (current/arrears – if public)

#### Excludes ❌
- Full building consent history (requires paid council search)
- Code Compliance Certificates
- Detailed hazard assessments (erosion, contamination, slippage)
- Physical property inspection
- Valuation for lending purposes

#### Ideal Customer Profile
- Serious buyers ready to make an offer
- Investors needing ownership verification
- Lawyers doing preliminary title checks
- Buyers in competitive markets (need fast intel before auction)

#### Profit Margins
- Revenue: $125
- Costs: ~$12 (LINZ register) + ~$3 (API costs) = ~$15
- **Gross Margin: ~$110 (88%)**
- Time investment: 10-15 minutes (mostly automated)

---

### 🥇 TIER 3: PREMIUM ($200-300)

#### Includes Everything in Standard, PLUS ✅
1. **Full LIM Equivalent** (we order actual LIM from council, resell markup)
   - All building consents (last 10+ years)
   - Code Compliance Certificates
   - Property file history
   - Council correspondence
   - Weep hole drainage, plumbing, electrical records

2. **Comprehensive Hazard Assessment**
   - Flood risk (1%, 2%, 5% AEP scenarios)
   - Coastal erosion risk (if applicable)
   - Landslide/slippage susceptibility
   - Contamination history (previous land uses)
   - Tsunami zone (if coastal)

3. **Detailed Zoning & Planning Analysis**
   - Permitted activities (as-of-right)
   - Restricted discretionary activities
   - Height limits, yard setbacks, site coverage rules
   - Future zoning changes (proposed plan changes)
   - Heritage or character overlay restrictions

4. **School Zone Verification**
   - Primary school zones (in/out of zone)
   - Secondary school zones
   - School decile ratings
   - Distance to nearest schools

5. **Infrastructure & Services**
   - Water supply type (town water, tank, bore)
   - Sewerage system (connected, septic)
   - Stormwater management
   - Internet availability (fibre, copper, wireless)
   - Power capacity (single/three phase)

6. **Comparative Market Analysis (CMA)**
   - 5-10 comparable recent sales
   - Price per m² analysis
   - Days on market comparison
   - Rental yield estimate (if investment property)

7. **Professional Review & Commentary**
   - Manual review by property expert
   - Red flag summary (top 3-5 concerns)
   - Recommended next steps (prioritized list)
   - Q&A support (30-minute phone consultation)

#### Excludes ❌
- Physical building inspection (refer to qualified inspector)
- Registered valuation for bank lending (refer to registered valuer)
- Legal advice (refer to property lawyer)
- Toxicology or environmental testing (specialist service)

#### Ideal Customer Profile
- Pre-auction buyers (need complete picture fast)
- Out-of-town investors (can't do local legwork)
- Developers assessing potential
- High-net-worth individuals (value time over cost)
- Overseas buyers (NZ property investment)

#### Profit Margins
- Revenue: $200-300 (depending on complexity)
- Costs: ~$12 (LINZ) + ~$300-450 (LIM) + ~$10 (other data) = ~$322-472
- **Wait... this model doesn't work!** ❌

**PROBLEM:** We can't resell LIMs profitably at this price point. Councils charge $300-450, and we're charging $200-300 total.

**SOLUTION OPTIONS:**
1. **Don't include actual LIM** – instead, provide "LIM-equivalent analysis" using free council GIS + planning maps (more manual research, lower cost)
2. **Increase Premium price to $450-500** – still undercuts council LIM turnaround time
3. **Offer LIM ordering as add-on service** ($50 service fee on top of council cost)
4. **Partner with LIM expeditor** – bulk discount from councils?

**RECOMMENDED APPROACH:** Option 1 + 3
- Premium report includes comprehensive research using FREE council data sources (GIS, planning maps, annual plans)
- Offer "Official LIM Order Service" as $50 add-on (we handle paperwork, client pays council direct)
- Position Premium as "everything except the actual LIM document" – faster and cheaper than council LIM, but client can still order LIM separately if needed

---

## Data Quality & Reliability Ratings

| Data Source | Reliability | Latency | Coverage | Cost |
|-------------|-------------|---------|----------|------|
| **LINZ Title Register** | ⭐⭐⭐⭐⭐ Official | Real-time | 100% NZ | $12 |
| **LINZ Free Viewer** | ⭐⭐⭐⭐⭐ Official | Real-time | 100% NZ | Free |
| **Council RV** | ⭐⭐⭐⭐ Official | 3-year cycle | 100% NZ | Free |
| **OneRoof AVM** | ⭐⭐⭐ Algorithmic | Daily | ~90% NZ | Free |
| **QV Sales Data** | ⭐⭐⭐⭐ Verified | Monthly | ~95% NZ | Paid |
| **Council GIS (Flood/Zoning)** | ⭐⭐⭐⭐ Official | Varies | ~70% NZ | Free-Paid |
| **Google Maps** | ⭐⭐⭐⭐ Reliable | Real-time | 100% NZ | Freemium |
| **Building Outlines (LINZ)** | ⭐⭐⭐ Good | Real-time | ~80% urban | Free |

---

## Common Edge Cases & How to Handle

### 1. **Rural Properties (No Street Address)**
- **Challenge:** Geocoding fails, no building outlines
- **Solution:** Use LINZ parcel map coordinates, note "rural property – limited digital data"
- **Tier Impact:** Basic may be insufficient; recommend Standard minimum

### 2. **Unit Titles / Apartments**
- **Challenge:** Multiple titles (unit + common areas), complex ownership
- **Solution:** Identify unit title, note shared ownership %, link to body corporate rules
- **Tier Impact:** Standard minimum (need full title register)

### 3. **Cross Lease Properties**
- **Challenge:** Shared land ownership, exclusive use areas, building footprint restrictions
- **Solution:** Flag as cross lease, explain implications, recommend lawyer review
- **Tier Impact:** Premium recommended (complex ownership structure)

### 4. **New Subdivisions (Recent Titles)**
- **Challenge:** No sales history, new RVs not issued yet, incomplete GIS data
- **Solution:** Note "new subdivision – limited historical data", use parent title info
- **Tier Impact:** Basic OK, but set expectations clearly

### 5. **Properties with Multiple Titles**
- **Challenge:** Which title is the "main" one? (like 31 Douglas McLean Ave example)
- **Solution:** Use most recent freehold title with largest area, note related titles
- **Tier Impact:** Basic OK for main title, Standard for full picture

### 6. **Māori Land / Māori Freehold Land**
- **Challenge:** Different ownership rules, restricted alienation, Māori Land Court jurisdiction
- **Solution:** Flag as Māori land, recommend specialist legal advice
- **Tier Impact:** Not suitable for Basic – recommend lawyer referral

### 7. **Leasehold Properties**
- **Challenge:** Land owned by third party (council, trust, iwi), ground rent, lease expiry
- **Solution:** Identify leasehold, show ground rent, lease term remaining, rental review dates
- **Tier Impact:** Standard minimum (need full lease details)

---

## Marketing vs. Legal Disclaimers

### ✅ What We CAN Say in Marketing

**Basic ($75):**
- "Fast property screening in minutes"
- "More detailed than Trade Me insights"
- "See what the professionals see"
- "Know before you offer"
- "Includes legal title summary, valuation estimates, and sales history"

**Standard ($125):**
- "Full ownership verification"
- "See who owns the property and what's registered on the title"
- "Check for easements and covenants before you buy"
- "Essential for auction buyers"

**Premium ($200-300):**
- "Comprehensive pre-purchase due diligence"
- "Everything you need except a physical inspection"
- "Save hours of research and council visits"
- "Professional analysis with red-flag summary"

### ⚠️ What We MUST Say in Disclaimers

**All Reports:**
- "This report is for informational purposes only"
- "Not a substitute for a formal LIM from council"
- "Not a building inspection or structural assessment"
- "Not a registered valuation for lending"
- "Always verify critical information through official channels"
- "AI Driven accepts no liability for purchase decisions based on this report"

**Basic Reports (Additional):**
- "Does not include current owner names or full title register"
- "Does not check for floods, hazards, or zoning restrictions"
- "Upgrade to Standard or Premium for complete due diligence"

---

## Competitor Comparison

| Provider | Product | Price | Turnaround | vs. Our Basic |
|----------|---------|-------|------------|---------------|
| **Trade Me Property Insights** | Free online report | Free | Instant | ❌ Less detail, no title data |
| **OneRoof.co.nz** | Free property report | Free | Instant | ⚠️ Similar AVM, no title/legal |
| **QV.co.nz** | Property Report | ~$30-50 | Instant | ⚠️ Better sales history, no title |
| **Love Property** | Property Report | ~$40 | Instant | ⚠️ Nice design, similar data gaps |
| **Council LIM** | Official LIM | $300-450 | 5-10 working days | ✅ More comprehensive, slower, expensive |
| **Our Basic** | Due Diligence Report | $75 | Instant | ✅ Sweet spot: price + speed + detail |
| **Our Standard** | Due Diligence Report | $125 | 1-2 hours | ✅ Best value for serious buyers |
| **Our Premium** | Due Diligence Report | $200-300 | 4 hours | ✅ Fastest comprehensive option |

**Our Competitive Advantage:**
1. **Speed:** Instant to 4 hours vs. 5-10 days for LIM
2. **Price:** $75-300 vs. $300-450 for LIM
3. **Convenience:** Online order, PDF delivery, no council visits
4. **Clarity:** Plain English summaries, not bureaucratic jargon
5. **Flexibility:** 3 tiers to match different buyer needs/budgets

---

## Next Steps for Template Development

- [ ] Create HTML/PDF version of Basic template (for actual delivery)
- [ ] Build automated data pipeline (LINZ API → report generation)
- [ ] Test with 5-10 real properties (validate data accuracy)
- [ ] Get beta feedback from Keegan Swanepoel and other agents
- [ ] Refine disclaimers based on legal review
- [ ] Build Standard and Premium templates
- [ ] Create marketing materials (website, social media, agent brochures)

---

**END OF INTERNAL LIMITATIONS LOG**

*This is a living document – update as we learn from beta testing and customer feedback.*
