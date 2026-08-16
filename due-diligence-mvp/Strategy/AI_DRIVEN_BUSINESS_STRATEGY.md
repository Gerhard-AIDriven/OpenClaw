# AI Driven Business Strategy

**Version:** 1.0  
**Date:** 2026-08-08  
**Owner:** Gerhard Stimie, Founder

---

## Executive Summary

**AI Driven** provides automated property due diligence and compliance solutions for New Zealand's real estate sector. We leverage open-source AI models and automation frameworks to deliver professional reports at a fraction of traditional cost and time.

**Mission:** Practical AI for real businesses — starting with property due diligence.

**Vision:** Become the trusted first-step due diligence provider for NZ property transactions, expanding into broader compliance and business automation services.

---

## Core Business Model

### Deployment Philosophy

**"AI solutions, deployed where privacy and practicality demand"**

| Scenario | Deployment Model | Rationale |
|----------|------------------|-----------|
| Estate agency franchise | **On-prem at agency** | Customer PII, transaction data stays in-house |
| Individual property buyer | **SaaS (light tier)** or **one-off service** | Lower volume, less sensitive data |
| Property investor (portfolio) | **On-prem or private cloud** | Multiple properties, ongoing monitoring |
| Insurance/law firm partnership | **API integration to their systems** | They control client data; we provide engine |
| SME consulting clients | **Hybrid** (sensitive = on-prem, general = SaaS) | Case-by-case based on data sensitivity |

### Technology Stack

**Primary:**
- OpenClaw framework (orchestration)
- Local/free AI models (Qwen via Ollama Pro, Gemma)
- Python for data processing
- SQLite with spatial indexing (R*Tree)
- HTML/PDF report generation

**Secondary (as needed):**
- Cloud APIs (Anthropic, OpenAI) for backup
- Browser automation (Puppeteer) for data collection
- Flask/FastAPI for web backends
- Cloudflare Pages for hosting

---

## Product Portfolio

### 1. Property Due Diligence Reports (Flagship)

**Status:** ✅ Production Ready (Tier 1 Enhanced)

Three-tier offering serving different customer segments:

#### Basic Report — $75 NZD
**Target:** Pre-offer screening, curious buyers, initial research

**Includes:**
- Property identification & legal details
- Title ownership & easements (LINZ)
- Zoning overview
- Natural hazards assessment (Flood, Tsunami, HAIL)
- Infrastructure & services check
- Building consents summary (10 yrs)
- Rates information
- 7-page professional PDF
- 24-48 hour turnaround

**Current Status:** ⚠️ **Gaps Identified**
- ✅ LINZ title data: Complete
- ❌ Zoning overview: Not implemented
- ❌ Infrastructure/services: Not implemented
- ❌ Building consents: Not implemented
- ❌ Rates info: Not implemented

**Next Steps:** Implement missing data sources to match marketed offering.

---

#### Standard Report — $125 NZD
**Target:** Serious investors, property professionals, detailed analysis

**Includes:** Everything in Basic, plus:
- Detailed zoning analysis
- Development potential assessment
- Investment metrics & financials
- Rental yield calculations (gross & net)
- Cash flow projections
- Comparable sales analysis
- Market value range estimation
- 10-12 page professional PDF
- 24-48 hour turnaround

**Current Status:** 🚧 **Not Started**
- Requires investment calculation engine
- Needs comparable sales data source
- Rental estimate API integration needed

---

#### Premium Report — $200 NZD
**Target:** High-stakes purchases, portfolio investors, full due diligence

**Includes:** Everything in Standard, plus:
- 5-year capital growth forecast
- Total return projections
- Risk factor analysis
- Growth drivers assessment
- Priority 12-24 hour turnaround
- 13-14 page professional PDF
- 15-minute consultation call
- Email support priority

**Current Status:** 🚧 **Not Started**
- Requires market forecasting model
- Growth driver database needed
- Consultation workflow to be defined

---

### 2. LIM Concierge Service (In Development)

**Status:** 🚧 Research Complete, Automation Pending

**Service Model:**
- Submit LIM applications on behalf of clients
- Act as applicant's agent (with authorization)
- Receive LIM report, parse and analyze
- Deliver executive summary + full report to client
- Optional: Hazard interpretation consultation

**Pricing:**
- Base fee: $50-75 NZD (service fee, excludes council LIM fee)
- Bundle with Tier 1 report: $150-200 NZD total

**Workflow:**
1. Client engagement → authorization form signed
2. Submit LIM via council portal (browser automation)
3. LIM received → parsed for hazard data
4. Executive summary generated
5. Full package delivered to client

**Current Gaps:**
- Browser automation script not built
- Authorization form template needed
- LIM parser (PDF/text extraction) not implemented
- Email delivery workflow pending

---

### 3. Estate Agent Platform (Future)

**Status:** 💡 Conceptual

**Integrated Solution for Agencies:**
- Property listing management
- Pre-listing due diligence (auto-generated)
- LIM request automation
- Buyer inquiry qualification
- Lead scoring & routing
- Vendor pack generation

**Deployment:** On-prem at agency (data sovereignty)

**Pricing:** 
- Setup: $2,000-5,000 NZD
- Monthly: $300-800 NZD per office
- Per-report fees optional

---

### 4. SME AI Consulting (Parallel Track)

**Status:** 💡 Exploratory

**Services:**
- Process automation audits
- Custom workflow automation
- Document processing pipelines
- Customer service chatbots
- Data analysis & reporting

**Target:** NZ SMEs (10-100 employees)

**Engagement Model:**
1. Discovery workshop (paid)
2. Opportunity mapping
3. Pilot project (fixed price)
4. Rollout & training (retainer)

---

## Market Positioning

### Primary Market: Property Buyers & Investors

**Pain Points:**
- LIMs are slow (5-10 days) and expensive ($300-450)
- Manual research across multiple systems is time-consuming
- Need quick screening before committing to formal due diligence
- Hazard information is scattered and hard to interpret

**Our Solution:**
- 24-48 hour turnaround
- $75-200 price point (fraction of LIM cost)
- Single consolidated report
- Clear risk ratings and recommendations

**USP:** "Free sites tell you what the property IS. We tell you what could GO WRONG."

---

### Secondary Market: Property Professionals

**Segments:**
- Quantity Surveyors (depreciation schedules)
- Real Estate Agents (pre-listing packs)
- Valuers (supporting documentation)
- Building Consultants (pre-inspection research)

**Value Prop:**
- Save 3+ hours per property
- High-margin service add-on
- Investment metrics built-in
- Bulk pricing available

---

## Competitive Landscape

### Direct Competitors
- **OneRoof/QV:** Free property data, but NO hazard overlays or risk assessments
- **Council LIMs:** Official but slow/expensive, not suitable for screening
- **Private building inspectors:** Focus on physical condition, not data aggregation

### Competitive Advantages
1. **Speed:** 24-48 hours vs. 5-10 days for LIM
2. **Price:** $75-200 vs. $300-450 for LIM
3. **Hazard Focus:** Explicit risk ratings, not just raw data
4. **Professional Formatting:** Branded, easy-to-understand reports
5. **Flexibility:** Three tiers for different needs/budgets

---

## Go-to-Market Strategy

### Phase 1: Validation (Months 1-3)
- Launch Basic Report in Hawke's Bay
- Target: 10-20 paying customers
- Channels: Facebook Marketplace, Trade Me, local investor groups
- Goal: Prove demand, refine process

### Phase 2: Scale Basic (Months 4-6)
- Expand to Standard/Premium tiers
- Build web backend for automated ordering
- Integrate payment gateway (PayPal/Stripe)
- Target: 50+ reports/month

### Phase 3: Professional Partnerships (Months 7-12)
- Approach QS firms, real estate agencies
- Offer bulk pricing, white-label options
- Develop API for integration
- Target: 3-5 agency partnerships

### Phase 4: Geographic Expansion (Year 2)
- Expand beyond Hawke's Bay
- Auckland, Wellington, Canterbury
- Regional customization (different councils, hazards)

### Phase 5: Product Diversification (Year 2+)
- LIM Concierge service launch
- Estate agent platform pilot
- SME consulting practice growth

---

## Revenue Projections (Conservative)

| Year | Reports/Month | Avg Price | Monthly Rev | Annual Rev |
|------|---------------|-----------|-------------|------------|
| Y1 Q1 | 10 | $95 | $950 | $11,400 |
| Y1 Q2 | 25 | $105 | $2,625 | $31,500 |
| Y1 Q3 | 50 | $115 | $5,750 | $69,000 |
| Y1 Q4 | 80 | $120 | $9,600 | $115,200 |
| Y2 | 150 | $125 | $18,750 | $225,000 |

**Assumptions:**
- Mix of Basic/Standard/Premium (weighted avg price increases over time)
- Organic growth + word of mouth
- No major marketing spend until Y2
- LIM service adds 20-30% revenue from Y2

---

## Cost Structure

### Fixed Costs (Monthly)
- Domain/hosting: $20-50 NZD
- API costs (LINZ, etc.): $0-100 NZD (mostly free tiers)
- Software subscriptions: $50-100 NZD
- Insurance (professional indemnity): $100-200 NZD
- **Total Fixed:** ~$200-450/month

### Variable Costs (Per Report)
- Payment processing: 2-3% ($1.50-6)
- Report generation time: ~15-30 min (opportunity cost)
- Customer support: ~10 min per report
- **Total Variable:** ~$5-15/report (excluding labor)

### Margins
- **Gross Margin:** 80-90% (very high — mostly labor + tech)
- **Break-even:** ~5-10 reports/month

---

## Risk Management

### Key Risks

1. **Data Accuracy Liability**
   - **Mitigation:** Clear disclaimers, E&O insurance, never claim to replace LIM
   
2. **Council Data Access Changes**
   - **Mitigation:** Diversify sources, build relationships, monitor API changes
   
3. **Competitor Response**
   - **Mitigation:** First-mover advantage, brand building, continuous improvement
   
4. **Regulatory Changes**
   - **Mitigation:** Stay compliant, legal review of disclaimers, adapt quickly
   
5. **Market Adoption Slower Than Expected**
   - **Mitigation:** Lean operations, pivot to B2B if B2C slow, consulting revenue buffer

---

## Success Metrics

### Leading Indicators
- Website traffic (unique visitors, time on page)
- Form completion rate (% who start vs. finish order)
- Inquiry volume (emails, calls)
- Social media engagement

### Lagging Indicators
- Reports sold per month
- Revenue growth rate
- Customer acquisition cost (CAC)
- Customer lifetime value (LTV)
- Net Promoter Score (NPS)

### Targets (Year 1)
- 500+ reports sold
- $60,000+ revenue
- NPS > 50
- CAC < $30
- LTV:CAC ratio > 3:1

---

## Team & Roles

### Current
- **Gerhard Stimie:** Founder, Operations, Sales, Analysis

### Future Hires (Y2+)
1. **Technical Contractor** (part-time)
   - Backend development
   - API integrations
   - Automation maintenance

2. **Virtual Assistant** (part-time)
   - Customer support
   - Report quality checks
   - Administrative tasks

3. **Sales/Partnerships Manager** (commission-based)
   - Agency partnerships
   - B2B sales
   - Marketing campaigns

---

## Exit Strategies / Long-Term Vision

### Option 1: Lifestyle Business
- Sustainable $150-250k/year revenue
- 1-2 part-time staff
- Owner-operated
- Focus on work-life balance

### Option 2: Scale & Sell
- Grow to $1M+ revenue
- Build management team
- Sell to larger prop-tech company (5-7 year horizon)
- Potential acquirers: OneRoof, QV, Realestate.co.nz, large agencies

### Option 3: Franchise Model
- License technology to other regions
- Training + support package
- Revenue share model
- Rapid geographic expansion

---

## Immediate Next Steps (This Quarter)

1. **Complete Basic Report Feature Set**
   - Add zoning data
   - Add infrastructure/services check
   - Add building consent history
   - Add rates information

2. **Launch Web Backend**
   - Form submission → automated report generation
   - Email delivery
   - Payment integration

3. **First 10 Paying Customers**
   - Validate pricing
   - Gather testimonials
   - Refine process based on feedback

4. **Document Processes**
   - Standard operating procedures
   - Quality assurance checklist
   - Customer service scripts

---

## Guiding Principles

1. **Privacy First:** Client data stays in NZ, on-prem when sensitive
2. **Transparency:** Clear about limitations, never oversell
3. **Quality Over Speed:** Better to delay than deliver inaccurate report
4. **Customer Education:** Help clients understand what report can/can't do
5. **Continuous Improvement:** Every report teaches us something
6. **Compliance:** Stay within legal boundaries, respect data sovereignty

---

**Last Updated:** 2026-08-08  
**Next Review:** 2026-09-08 (monthly review cycle)
