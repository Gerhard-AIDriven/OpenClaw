# Due Diligence MVP - Implementation Plan

**Version:** 2.0 (Aligned with Business Strategy)  
**Last Updated:** 2026-08-08  
**Owner:** Gerhard Stimie

---

## Executive Summary

This document outlines the complete implementation roadmap for the AI Driven Property Due Diligence platform, from current Tier 1 Enhanced capability through to the full three-tier product offering.

**Current Status:** Tier 1 Enhanced is production-ready but missing 4 Basic report features.

**Target:** Full Basic Report feature-complete by 2026-08-29 (3 weeks).

---

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI DRIVEN PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  DUE DILIGENCE   │    │   LIM CONCIERGE  │              │
│  │     REPORTS      │    │     SERVICE      │              │
│  │                  │    │                  │              │
│  │  ┌────────────┐  │    │  • Council form  │              │
│  │  │   BASIC    │  │    │  • Auto-fill     │              │
│  │  │   $75      │  │    │  • Payment gate  │              │
│  │  └────────────┘  │    │  • Report parse  │              │
│  │  ┌────────────┐  │    │  • Hazard extract│              │
│  │  │  STANDARD  │  │    │                  │              │
│  │  │   $125     │  │    │  $420 + $50 fee  │              │
│  │  └────────────┘  │    │  5-10 days       │              │
│  │  ┌────────────┐  │    │                  │              │
│  │  │  PREMIUM   │  │    │                  │              │
│  │  │   $200     │  │    │                  │              │
│  │  └────────────┘  │    │                  │              │
│  │                  │    │                  │              │
│  │  Data Sources:   │    │                  │              │
│  │  • LINZ API      │    │                  │              │
│  │  • Council GIS   │    │                  │              │
│  │  • GNS Science   │    │                  │              │
│  │  • MfE HAIL      │    │                  │              │
│  │  • Council Rates │    │                  │              │
│  │  • QV/CoreLogic  │    │                  │              │
│  └──────────────────┘    └──────────────────┘              │
│                                                              │
│  Future Modules:                                             │
│  • Estate Agent Platform                                     │
│  • SME Consulting Automation                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Product Tiers - Feature Matrix

| Feature | Basic ($75) | Standard ($125) | Premium ($200) |
|---------|-------------|-----------------|----------------|
| **Property ID & Legal** | ✅ | ✅ | ✅ |
| **Title & Ownership** | ✅ | ✅ | ✅ |
| **Easements (formatted)** | ✅ | ✅ | ✅ |
| **Natural Hazards** | ✅ | ✅ | ✅ |
| **HAIL Screen** | ✅ | ✅ | ✅ |
| **Risk Ratings** | ✅ | ✅ | ✅+ |
| **Zoning Overview** | ✅ | ✅ | ✅ |
| **Infrastructure/Services** | ✅ | ✅ | ✅ |
| **Building Consents (10yr)** | ✅ | ✅+ | ✅++ |
| **Rates Information** | ✅ | ✅ | ✅ |
| **Detailed Zoning Analysis** | ❌ | ✅ | ✅ |
| **Development Potential** | ❌ | ✅ | ✅ |
| **Investment Metrics** | ❌ | ✅ | ✅ |
| **Rental Yield (gross/net)** | ❌ | ✅ | ✅ |
| **Cash Flow Projections** | ❌ | ✅ | ✅ |
| **Comparable Sales** | ❌ | ✅ | ✅++ |
| **Market Value Estimate** | ❌ | ✅ | ✅ |
| **5-Year Growth Forecast** | ❌ | ❌ | ✅ |
| **Total Return Projections** | ❌ | ❌ | ✅ |
| **Risk Factor Analysis** | ❌ | ❌ | ✅ |
| **Growth Drivers** | ❌ | ❌ | ✅ |
| **Turnaround Time** | 24-48h | 24-48h | 12-24h |
| **Report Length** | 7 pages | 10-12 pages | 13-14 pages |
| **Consultation Call** | ❌ | ❌ | 15 min |
| **Support Priority** | Standard | Standard | Priority |

✅ = Included | ✅+ = Enhanced | ✅++ = Comprehensive | ❌ = Not included

---

## Implementation Phases

### Phase 0: Current State (as of 2026-08-08)

**Completed:**
- ✅ LINZ title cache system (95,327 Hawke's Bay titles)
- ✅ Spatial query engine (SQLite R*Tree, <0.01s lookup)
- ✅ Natural hazard assessment (Flood, Tsunami, HAIL)
- ✅ Risk rating algorithm
- ✅ HTML report generation with branding
- ✅ PDF generation (wkhtmltopdf)
- ✅ Test validation on real properties

**Gaps Identified:**
- ❌ Zoning overview
- ❌ Infrastructure/services check
- ❌ Building consents summary
- ❌ Rates information
- ⚠️ Easements (data exists, needs formatting)

**Progress:** 60% of Basic Report features complete

---

### Phase 1: Complete Basic Report (Week 1-2: Aug 8-22)

**Objective:** Close all gaps to deliver marketed Basic Report ($75)

#### 1.1 Easements Formatting (1-2 hours)
**Task:** Parse and format existing LINZ easement data

**Implementation:**
- Update `report_generator_enhanced.py` to extract easement fields
- Create table template for easement list
- Classify by type (right of way, drainage, power, etc.)
- Show benefited/burdened properties

**Files to Modify:**
- `report_generator_enhanced.py`
- `templates/basic-report.html`

**Acceptance Criteria:**
- Easements displayed in clear table format
- Type classification working
- Tested on 5+ titles with easements

---

#### 1.2 Rates Information (2-4 hours)
**Task:** Scrape council rate databases for CV, land value, annual rates

**Implementation:**
- Build Puppeteer scraper for Napier/Hastings/CHB council portals
- Extract: Capital Value, Land Value, Improvements Value, Annual Rates
- Cache results to avoid re-scraping
- Fallback to manual entry if scraping fails

**Files to Create:**
- `data_sources/rates_scraper.py`
- `config/council_portals.json`

**Files to Modify:**
- `generate-tier1-report.py` (integrate scraper)
- `report_generator_enhanced.py` (add rates section)

**Acceptance Criteria:**
- Rates retrieved for 90%+ of Hawke's Bay properties
- Accuracy within 5% of official records
- Scraping completes in <10 seconds per property

---

#### 1.3 Zoning Overview (2-4 hours)
**Task:** Extract zoning codes from council GIS and map to plain English

**Implementation:**
- Research council GIS zone layers
- Build zone code → description mapping
- Add permitted activities summary
- Include height restrictions, site coverage limits

**Data Sources:**
- Napier: https://maps.napier.govt.nz/
- Hastings: https://hdcmaps.com/
- CHB: Council portal (TBD)

**Files to Create:**
- `data_sources/zoning_extractor.py`
- `config/zoning_codes.json`

**Acceptance Criteria:**
- Zone code identified for 95%+ properties
- Plain English description accurate
- Permitted activities listed

---

#### 1.4 Building Consents (4-8 hours)
**Task:** Extract consent history from council databases

**Implementation:**
- Research council consent search portals
- Build browser automation (Puppeteer) for consent lookup
- Parse consent list (date, type, value, status)
- Filter to last 10 years
- Handle multi-consent properties

**Fallback Options:**
- If automation too complex: Manual research step
- If data unavailable: Note "Available in full LIM"

**Files to Create:**
- `data_sources/consents_scraper.py`

**Acceptance Criteria:**
- Consents found for 80%+ properties with recent work
- Date range limited to 10 years
- Consent type and value shown

---

#### 1.5 Infrastructure/Services (3-5 hours)
**Task:** Determine water, sewer, stormwater connection status

**Implementation:**
- Investigate council asset database access
- If unavailable: Implement heuristic approach
  - Urban residential = assume connected
  - Rural/lifestyle = note "likely septic, tank water"
  - Flag edge cases for manual review

**Files to Create:**
- `data_sources/infrastructure_checker.py`

**Acceptance Criteria:**
- Connection status shown for all services
- Heuristics documented in report
- Edge cases flagged appropriately

---

**Phase 1 Deliverables:**
- [ ] All 10 Basic Report features implemented
- [ ] Generation time <15 minutes per report
- [ ] Cost to produce <$15
- [ ] Tested on 20+ diverse properties
- [ ] Customer-ready quality

**Decision Point:** Launch Beta Basic at $60 or wait for full launch at $75?

**DECISION MADE (2026-08-08):** ✅ **Option A - Beta Launch**
- Beta launch date: Aug 15, 2026
- Beta price: $60 NZD (20% discount)
- Full launch date: Aug 29, 2026
- Full price: $75 NZD
- Approach: Use manual workarounds for missing features during beta
- Goal: Start revenue flow + gather customer feedback
- Website update: Add "Beta Program" banner and disclaimer

**Ready to build?** Let me know and I'll create all the files! 🚀

---

### Phase 2: Standard Report (Week 3-4: Aug 22 - Sep 5)

**Objective:** Add investment analysis features for Standard tier ($125)

#### 2.1 Investment Metrics Engine (4-6 hours)
**Task:** Calculate rental yield, cash flow, ROI metrics

**Implementation:**
- Gross rental yield formula: `(Annual Rent / Purchase Price) × 100`
- Net rental yield: `((Annual Rent - Expenses) / Purchase Price) × 100`
- Cash flow projection: `Rent - (Mortgage + Rates + Insurance + Maintenance)`
- ROI calculations with different deposit scenarios (20%, 30%, 40%)

**Data Sources:**
- Rental estimates: Trade Me Property, Tenancy Services median rents
- Mortgage rates: Current NZ bank rates (track via API or manual update)
- Insurance: Heuristic based on property value/location
- Maintenance: 1% of property value per year (industry standard)

**Files to Create:**
- `generators/investment_calculator.py`
- `config/mortgage_rates.json` (updateable)

---

#### 2.2 Comparable Sales Analysis (4-8 hours)
**Task:** Find and present recent sales of similar properties

**Implementation:**
- Search radius: 500m-1km from subject property
- Time filter: Last 6-12 months
- Similarity criteria: Bedrooms, bathrooms, land area, property type
- Present: Address, sale price, sale date, key features

**Data Sources:**
- QV sold data (paid API)
- CoreLogic RP Data (paid, professional)
- Trade Me Property sold listings (scraping, ToS risk)
- Manual research (fallback)

**Decision:** Use free data (manual) or paid API (automated)?

**Files to Create:**
- `data_sources/comparable_sales.py`

---

#### 2.3 Development Potential Assessment (3-5 hours)
**Task:** Analyze zoning rules for development opportunities

**Implementation:**
- Subdivision potential (minimum lot size vs. current size)
- Additional dwelling allowance (granny flat, duplex)
- Height restrictions (storeys allowed)
- Site coverage limits (buildable area)
- Setback requirements

**Output:** Simple traffic light system:
- 🟢 High potential (meets all criteria)
- 🟡 Moderate potential (some constraints)
- 🔴 Low potential (significant barriers)

**Files to Modify:**
- `data_sources/zoning_extractor.py` (enhance)
- `report_generator_enhanced.py` (add section)

---

#### 2.4 Market Value Range Estimation (2-4 hours)
**Task:** Provide estimated market value range

**Implementation:**
- Approach 1: Automated Valuation Model (AVM) lite
  - Based on comparable sales
  - Adjust for differences (beds, baths, land area)
- Approach 2: Multiple methods, show range
  - Capital value comparison
  - Recent sales in street/suburb
  - Price per sqm analysis

**Disclaimer:** Prominent notice that this is NOT a valuation

**Files to Create:**
- `generators/valuation_estimator.py`

---

**Phase 2 Deliverables:**
- [ ] Investment calculator working
- [ ] Comparable sales found for 80%+ properties
- [ ] Development potential assessed
- [ ] Market value range provided
- [ ] Standard report template complete (10-12 pages)
- [ ] Tested on 10+ investment properties

---

### Phase 3: Premium Report (Week 5-6: Sep 5-19)

**Objective:** Add forecasting and consulting features for Premium tier ($200)

#### 3.1 5-Year Capital Growth Forecast (6-10 hours)
**Task:** Model future property value based on market trends

**Implementation:**
- Historical growth rates (suburb level, 10-year lookback)
- Market cycle position (RBNZ data, interest rates)
- Supply/demand dynamics (new builds, population growth)
- Infrastructure projects nearby (schools, transport, hospitals)
- Economic drivers (employment, major employers)

**Model:** Conservative/base/optimistic scenarios

**Data Sources:**
- REINZ house price index
- Stats NZ population/census data
- Council long-term plans (infrastructure projects)
- MBIE economic data

**Files to Create:**
- `generators/growth_forecaster.py`
- `config/market_indicators.json`

---

#### 3.2 Total Return Projections (3-5 hours)
**Task:** Combine capital growth + rental return

**Implementation:**
- Annualized return calculation
- Compound growth over 5 years
- Tax implications (bright-line test, depreciation)
- Total return breakdown: Capital gain + Rental profit

**Output:** Year-by-year projection table

**Files to Create:**
- `generators/total_return_calculator.py`

---

#### 3.3 Risk Factor Analysis (4-6 hours)
**Task:** Comprehensive risk scoring beyond natural hazards

**Risk Categories:**
1. **Market Risk:** Vacancy rates, price volatility, oversupply
2. **Regulatory Risk:** Zoning changes, rent control, tax changes
3. **Environmental Risk:** Climate change (sea level rise, flood frequency)
4. **Economic Risk:** Employment concentration, industry decline
5. **Property-Specific Risk:** Age, construction type, maintenance needs

**Scoring:** 1-10 scale per category, weighted average

**Files to Create:**
- `generators/risk_analyzer.py`
- `config/risk_weights.json`

---

#### 3.4 Growth Drivers Assessment (3-5 hours)
**Task:** Identify positive catalysts for area

**Factors:**
- Infrastructure investment (roads, public transport)
- Commercial development (shopping centers, offices)
- School zone changes (high-performing schools)
- Urban regeneration projects
- Lifestyle amenities (parks, cafes, walkability score)

**Output:** List of growth drivers with impact rating (High/Medium/Low)

**Files to Create:**
- `data_sources/growth_drivers.py`

---

#### 3.5 Consultation Workflow (2-3 hours)
**Task:** Schedule and conduct 15-minute client calls

**Implementation:**
- Calendly integration (or similar booking tool)
- Call script/template
- Follow-up email with summary
- Track call outcomes

**Tools:**
- Calendly (free tier): Scheduling
- Zoom/Google Meet: Video calls
- Gmail: Email templates

**Files to Create:**
- `templates/consultation-email-template.txt`
- `scripts/schedule-consultation.py` (Calendly API)

---

**Phase 3 Deliverables:**
- [ ] Growth forecast model validated
- [ ] Total return projections accurate within 20%
- [ ] Risk scores correlate with actual issues
- [ ] Growth drivers identified for all suburbs
- [ ] Consultation booking workflow smooth
- [ ] Premium report template (13-14 pages)
- [ ] Tested on 5+ high-value properties

---

### Phase 4: Web Backend & Automation (Week 7-10: Sep 19 - Oct 17)

**Objective:** Build fully automated web platform for order-to-delivery

#### 4.1 Backend API (8-12 hours)
**Framework:** FastAPI (Python) or Flask

**Endpoints:**
- `POST /api/v1/orders` - Submit new order
- `GET /api/v1/orders/{id}` - Check status
- `POST /api/v1/reports/generate` - Trigger generation
- `GET /api/v1/reports/{id}/download` - Download PDF

**Database:** PostgreSQL or SQLite (start simple)

**Files to Create:**
- `backend/main.py` (FastAPI app)
- `backend/models.py` (database models)
- `backend/routes.py` (API endpoints)
- `backend/tasks.py` (background job processing)

---

#### 4.2 Payment Integration (4-6 hours)
**Option A: PayPal** (current website setup)
- PayPal Checkout buttons
- Webhook for payment confirmation
- Order status update on payment received

**Option B: Stripe** (recommended for scalability)
- Stripe Checkout
- Better developer experience
- Lower fees for larger volumes

**Files to Create:**
- `backend/payment_handler.py`
- `config/payment_providers.json`

---

#### 4.3 Email Delivery (3-5 hours)
**Task:** Automatically email reports to customers

**Implementation:**
- Gmail API (existing OAuth setup)
- Email template with report attached
- Tracking (open rate, download clicks)
- Follow-up sequence (thank you, review request)

**Files to Create:**
- `backend/email_sender.py`
- `templates/email-report-delivery.html`

---

#### 4.4 Cloudflare Pages Deployment (4-6 hours)
**Task:** Deploy website and backend

**Steps:**
1. Build static site (HTML/CSS/JS)
2. Configure Cloudflare Pages
3. Set up custom domain (aidriven.biz)
4. SSL certificate (automatic via Cloudflare)
5. Backend hosting (Cloudflare Workers or separate VPS)

**Files to Create:**
- `wrangler.toml` (Cloudflare config)
- `.github/workflows/deploy.yml` (CI/CD)

---

**Phase 4 Deliverables:**
- [ ] Website form submits to backend
- [ ] Payment processed successfully
- [ ] Report auto-generated on payment
- [ ] PDF emailed to customer
- [ ] Order tracking dashboard
- [ ] Live on aidriven.biz domain

---

### Phase 5: LIM Concierge Service (Parallel Track, Week 4-8)

**Objective:** Offer full LIM application service

#### 5.1 Browser Automation Script (6-10 hours)
**Task:** Auto-fill Napier Council LIM form

**Implementation:**
- Use `browser-automation` skill
- Steps 1-4 automated (property search, contact details, options, summary)
- Pause at Step 5 (payment gateway)
- Capture confirmation page

**Files to Create:**
- `lim-automation/napier_lim_bot.py`
- `lim-automation/config/council_portals.json`

---

#### 5.2 Authorization Form Template (2-3 hours)
**Task:** Legal authorization to act as agent

**Content:**
- Client details
- Property details
- Authorization clause
- Privacy consent
- Signature (digital OK)

**Legal Review:** Recommended before launch

**Files to Create:**
- `legal/lim-authorization-form.pdf`
- `legal/terms-and-conditions.md`

---

#### 5.3 LIM Parser (4-6 hours)
**Task:** Extract structured data from LIM PDF

**Implementation:**
- PDF text extraction (PyPDF2 or pdfplumber)
- Section parsing (hazards, consents, notices)
- Structured JSON output
- Merge with Tier 1 report data

**Files to Create:**
- `lim-automation/lim_parser.py`
- `templates/lim-executive-summary.html`

---

**Phase 5 Deliverables:**
- [ ] LIM submission automated (90%)
- [ ] Authorization form ready
- [ ] LIM parser extracts key data
- [ ] Executive summary generated
- [ ] Bundle pricing implemented

---

## Testing & Quality Assurance

### Test Property Portfolio

Maintain a diverse set of test properties:

| Property ID | Address | Type | Purpose |
|-------------|---------|------|---------|
| TEST-001 | 31 Douglas McLean Ave, Marewa | Residential | Baseline (low risk) |
| TEST-002 | 16 Ferguson Ave, Westshore | Coastal | Tsunami hazard case |
| TEST-003 | [TBD] | Rural/Lifestyle | Infrastructure heuristics |
| TEST-004 | [TBD] | Commercial | Zoning complexity |
| TEST-005 | [TBD] | Apartment/Unit | Cross-lease/easements |
| TEST-006 | [TBD] | New Development | Consent history |
| TEST-007 | [TBD] | Heritage Building | Special zoning |
| TEST-008 | [TBD] | Flood Zone Property | Gabrielle flood area |

### QA Checklist (Per Report Tier)

**Basic Report:**
- [ ] All 10 sections present
- [ ] Data accuracy spot-checked (vs. official sources)
- [ ] PDF formatting clean (no cut-off text/images)
- [ ] Disclaimers prominent
- [ ] Generation time logged (<15 min target)

**Standard Report:**
- [ ] Investment math verified (independent calculation)
- [ ] Comparables are truly comparable (similar beds/baths/area)
- [ ] Development assessment aligns with council rules
- [ ] Market value range reasonable (vs. CV, recent sales)

**Premium Report:**
- [ ] Growth forecast methodology documented
- [ ] Risk scores validated against known issues
- [ ] Growth drivers are specific (not generic)
- [ ] Consultation call completed and documented

---

## Documentation Requirements

### Customer-Facing
- [ ] Terms of Service
- [ ] Privacy Policy (Privacy Act 2020 compliant)
- [ ] Sample Report (redacted)
- [ ] FAQ page
- [ ] Pricing page (clear feature matrix)

### Internal
- [ ] Standard Operating Procedures (SOPs)
- [ ] Data source documentation
- [ ] Error handling runbook
- [ ] Customer service scripts
- [ ] Quality assurance checklist

### Technical
- [ ] API documentation (if external developers)
- [ ] Database schema
- [ ] Deployment guide
- [ ] Backup/recovery procedures
- [ ] Security audit results

---

## Success Metrics by Phase

| Phase | Metric | Target | Measurement |
|-------|--------|--------|-------------|
| Phase 1 | Basic Report Features Complete | 10/10 | Feature checklist |
| Phase 1 | Generation Time | <15 min | Time tracking |
| Phase 1 | Cost Per Report | <$15 | Labor + overhead |
| Phase 2 | Investment Math Accuracy | ±5% | Independent verification |
| Phase 2 | Comparables Found Rate | >80% | Test portfolio |
| Phase 3 | Forecast Accuracy (backtested) | ±20% | Historical data |
| Phase 3 | Customer Satisfaction | >4.5/5 stars | Post-call survey |
| Phase 4 | Web Conversion Rate | >3% | Google Analytics |
| Phase 4 | Payment Success Rate | >95% | Payment provider stats |
| Phase 4 | Email Delivery Rate | >99% | Email service stats |
| Phase 5 | LIM Automation Rate | >90% | Manual steps required |
| Phase 5 | Bundle Take Rate | >30% | Orders with LIM add-on |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Council API changes/blocks scraping | Medium | High | Diversify sources, build relationships |
| Data accuracy lawsuit | Low | High | E&O insurance, clear disclaimers |
| Competitor launches similar product | Medium | Medium | First-mover advantage, brand building |
| Market adoption slower than expected | Medium | Medium | Lean ops, pivot to B2B, consulting revenue |
| Regulatory changes (LIM rules) | Low | Medium | Monitor legislation, adapt quickly |
| Key person risk (Gerhard only) | High | High | Document processes, hire VA in Y2 |

---

## Budget & Resources

### One-Time Costs
- LINZ API setup: $0 (free)
- wkhtmltopdf: $0 (open source)
- Domain/hosting setup: $50-100
- Legal review (T&Cs, privacy): $500-1,000
- Insurance (professional indemnity): $500-1,000/year
- **Total:** ~$1,000-2,000 NZD

### Recurring Costs (Monthly)
- Hosting (Cloudflare/domains): $20-50
- API costs (QV/CoreLogic if used): $0-200
- Software subscriptions: $50-100
- Insurance: $100-200
- **Total:** ~$200-550/month

### Revenue Share (Per Report)
- Payment processing: 2-3%
- Variable costs: $5-15
- **Gross Margin:** 80-90%

---

## Timeline Summary

```
Aug 2026          Sep 2026          Oct 2026
W1  W2  W3  W4    W1  W2  W3  W4    W1  W2  W3  W4
│   │   │   │     │   │   │   │     │   │   │   │
├───┤               Phase 1: Basic    │   │   │   │
│P0│              (Close gaps)        │   │   │   │
└───┘                                 │   │   │   │
    ├───┤           Phase 2: Standard │   │   │   │
    │P1│            (Investment)      │   │   │   │
    └───┘                             │   │   │   │
        ├───┤       Phase 3: Premium  │   │   │   │
        │P2│        (Forecasting)     │   │   │   │
        └───┘                         │   │   │   │
            ├───────────┤ Phase 4: Web│   │   │   │
            │   P3      │(Backend)    │   │   │   │
            └───────────┘             │   │   │   │
                ├───┤ Phase 5: LIM    │   │   │   │
                │P4 │(Concierge)      │   │   │   │
                └───┘                 │   │   │   │
                                      │   │   │   │
                                      └───┴───┴───┘
                                          Launch!
```

**Key Milestones:**
- **Aug 22:** Phase 1 complete (Basic ready)
- **Sep 5:** Phase 2 complete (Standard ready)
- **Sep 19:** Phase 3 complete (Premium ready)
- **Oct 17:** Phase 4 complete (Web live)
- **Oct 31:** Phase 5 complete (LIM service ready)

---

## Governance

### Weekly Reviews (Every Monday)
- Progress vs. plan
- Blockers identified
- Priorities for week
- Budget check

### Monthly Strategy Reviews (Last Friday)
- Metric performance
- Market feedback
- Pivot decisions
- Resource allocation

### Quarterly Board (Advisory)
- Gerhard + 2-3 advisors
- Strategic direction
- Major investments
- Partnership decisions

---

## Change Management

**This document is living.** Updates require:

1. **Minor changes** (typos, clarifications): Gerhard approval
2. **Scope changes** (feature additions/removals): Advisory review
3. **Timeline changes** (>2 week slippage): Root cause analysis + revised plan
4. **Budget changes** (>20% variance): Justification + approval

**Version Control:**
- v1.0: 2026-08-08 (Initial aligned version)
- v1.1: [TBD] (First update)

---

**Next Actions:**

1. ✅ **Status:** Read existing documentation
2. ✅ **Analysis:** Complete gap analysis
3. ✅ **Strategy:** Align with business goals
4. ⏳ **Decision:** Gerhard approves plan
5. ⏳ **Execution:** Begin Phase 1, Task 1.1 (Easements formatting)

---

*Last Updated: 2026-08-08*  
*Version: 2.0 (Strategy-Aligned)*  
*Owner: Gerhard Stimie*  
*Status: Ready for Approval*
