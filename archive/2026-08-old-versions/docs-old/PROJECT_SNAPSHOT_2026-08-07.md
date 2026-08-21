# Due Diligence MVP - Project Snapshot
**Date:** 2026-08-07, 10:04 GMT+2  
**Status:** Template Development Phase ✅  
**Next Milestone:** Beta Testing & HTML/PDF Generation

---

## 🎯 Project Overview

**Product:** Property Due Diligence Report (pre-purchase screening intelligence)  
**Business:** AI Driven (aidriven.biz)  
**Target Market:** NZ property buyers, investors, real estate agents  
**Value Proposition:** Faster & cheaper than LIM ($75-300 vs $300-450), more detailed than Trade Me insights

---

## ✅ COMPLETED TO DATE

### 1. **Business Foundation**
- [x] 3-tier pricing model defined ($75 Basic, $125 Standard, $200-300 Premium)
- [x] Google Form published for order intake: https://forms.gle/MnVipK8ZWPfBi54C7
- [x] Stripe payment links created (all 3 tiers)
  - ⚠️ Stripe account frozen pending NZ proof of address (PayPal backup recommended)
- [x] Sample report sent to Keegan Swanepoel (awaiting feedback)

### 2. **Property Research Dataset**
**Test Property:** 31 Douglas McLean Avenue, Marewa, Napier
- [x] OneRoof valuation data logged
  - Estimate: $615K (High Accuracy)
  - RV: $610K (Land $465K + Improvements $145K)
  - Sold 2026 for $610K
  - Coordinates: -39.50067520, 176.9039088
- [x] LINZ title data logged
  - Title: HBE2/765 (Lot 88 DP 8162, 803m²)
  - Freehold, 2 owners, issued 1972-11-22
  - Related titles identified (HBJ4/164, HB138/197)

### 3. **Report Templates**
- [x] **Tier 1 Basic Report Template** created (Markdown)
  - File: `report-templates/tier1-basic-report-template.md`
  - Length: 9,469 bytes
  - Includes: Executive summary, property details, location map, valuation, sales history, title summary, limitations, recommendations
  - Uses 31 Douglas McLean Ave as sample property
  
- [x] **Internal Tier Limitations Log** created
  - File: `TIER_LIMITATIONS_INTERNAL.md`
  - Length: 15,448 bytes
  - Includes: Data source matrix, tier breakdowns, edge cases, marketing vs. legal disclaimers, competitor analysis, profit margins
  - **Key Finding:** Premium tier pricing issue identified (can't resell LIMs profitably at $200-300)

---

## 📊 KEY DECISIONS MADE

### Product Design
- **Name:** "Property Due Diligence Report" (not "LIM-Lite")
- **Positioning:** Informational only, NOT a LIM substitute
- **Sales History Section:** Added to Basic tier (high value for agents)
- **Maps in Basic:** Google Maps static + LINZ building outlines (free sources)
- **Limitations Transparency:** Internal log separates what we CAN say vs. MUST disclose

### Pricing Strategy
- **Basic ($75):** Fully automated, ~85% margin, instant delivery
- **Standard ($125):** Includes paid LINZ register ($12), ~88% margin, 1-2 hour turnaround
- **Premium ($200-300):** **PRICING ISSUE** - needs resolution
  - Problem: Council LIMs cost $300-450, can't resell profitably at this price
  - Proposed solution: Provide "LIM-equivalent research" using free council data + offer LIM ordering as $50 add-on service
  - Alternative: Increase Premium to $450-500 (still undercuts council on speed)

### Data Sources
| Tier | Primary Sources | Cost to Us |
|------|-----------------|------------|
| Basic | LINZ free viewer, OneRoof, Google Maps, LINZ building outlines | ~$0-3 |
| Standard | Basic + LINZ official title register ($12) | ~$15 |
| Premium | Standard + free council GIS/planning maps + manual research | ~$25-50 |

---

## 🗂️ FILE STRUCTURE

```
due-diligence-mvp/
├── TODO.md (master task list)
├── PROJECT_SNAPSHOT_2026-08-07.md ← THIS FILE
├── TIER_LIMITATIONS_INTERNAL.md (internal reference)
│
├── property-research/
│   ├── 31-douglas-mclean-ave-marewa-oneroof-data.md
│   └── 31-douglas-mclean-ave-marewa-linz-title.md
│
├── report-templates/
│   └── tier1-basic-report-template.md ✅ COMPLETE
│   ├── tier2-standard-report-template.md (pending)
│   └── tier3-premium-report-template.md (pending)
│
├── outreach/
│   └── (Keegan Swanepoel correspondence)
│
├── sample-reports/
│   └── (sent to Keegan 2026-08-05)
│
├── report-generator/
│   └── (automated PDF generation system - in development)
│
└── [Config files: Google Form, Stripe, PayPal, etc.]
```

---

## 🚧 PENDING / NEXT STEPS

### Immediate (This Week)
- [ ] **Resolve Premium tier pricing strategy** (recommendation: keep at $200-300, offer LIM as add-on)
- [ ] **Build HTML version of Basic template** (convert Markdown → professional HTML/PDF)
- [ ] **Test PDF generation** with 31 Douglas McLean Ave data
- [ ] **Update TODO.md** with current progress
- [ ] **Follow up with Keegan Swanepoel** (if no response by 2026-08-08)

### Short-Term (Next 2 Weeks)
- [ ] Create Standard ($125) template
- [ ] Create Premium ($200-300) template
- [ ] Build automated data pipeline (LINZ API → report generator)
- [ ] Test with 5-10 real properties (validate accuracy)
- [ ] Get beta feedback from 3-5 agents/investors
- [ ] Refine disclaimers based on legal review (if needed)

### Medium-Term (Next Month)
- [ ] Launch website (aidriven.biz on Cloudflare Pages)
- [ ] Set up Zapier automation (form → email + payment link)
- [ ] Create marketing materials (social media, agent brochures)
- [ ] Integrate additional data sources (council GIS APIs, school zones)
- [ ] Build input validation logic (LINZ Address Points API)

---

## 💡 KEY LEARNINGS

### Technical
1. **Message Size Limits:** Large uploads (multiple images + context) get truncated. Solution: Send 2 images at a time with context attached.
2. **Title vs. Sale Date:** LINZ title reference numbers are permanent (like VIN). Only registered owners change on sale. Free LINZ viewer shows owner count but not names.
3. **Data Source Gaps:** Free data gets you 80% there. Paid LINZ register ($12) unlocks ownership details. Council LIMs ($300-450) don't fit our Premium pricing model.

### Business
1. **Agent Appeal:** Sales history section is high-value for real estate agents (potential bulk customers).
2. **Sweet Spot:** Basic tier at $75 hits the gap between "free Trade Me insights" and "$300+ LIM" – perfect for initial screening.
3. **Premium Tier Challenge:** Can't compete with councils on LIM pricing. Better to position as "fast comprehensive research + optional LIM ordering service."

### Legal/Compliance
1. **Disclaimer Language:** Critical to state "informational only, not a LIM substitute" prominently.
2. **Tier Transparency:** Must clearly disclose what each tier excludes (especially Basic: no owner names, no encumbrances).
3. **Edge Cases:** Rural, unit titles, cross lease, Māori land, and leasehold properties need special handling (often require Standard/Premium minimum).

---

## 📈 METRICS & PROGRESS

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Templates Created | 3 | 1 (Basic) | 🟡 33% |
| Test Properties Researched | 5-10 | 1 (31 Douglas McLean Ave) | 🔴 10-20% |
| Beta Feedback Received | 3-5 agents | 0 (awaiting Keegan) | 🔴 0% |
| Automated Pipeline | Yes | No | 🔴 0% |
| Revenue Generated | $500-1000/mo | $0 | 🔴 0% |

---

## 🎯 SUCCESS CRITERIA

### MVP Launch Criteria (Ready to Go Live When):
- [x] At least 1 complete template (Basic) ✅
- [ ] All 3 templates complete (Basic, Standard, Premium)
- [ ] PDF generation working (automated or semi-automated)
- [ ] Payment processing functional (Stripe unfrozen OR PayPal active)
- [ ] 5+ test reports generated (validating data accuracy)
- [ ] 3+ beta users provide positive feedback
- [ ] Clear disclaimers reviewed and approved

### 6-Month Goals:
- 50-100 reports sold per month
- $5,000-10,000 monthly revenue
- 85%+ gross margins (automated delivery)
- 5+ real estate agency partnerships
- Expansion to additional NZ regions (starting with Hawke's Bay, expanding nationwide)

---

## 🔗 RELATED FILES

- **Main TODO:** `TODO.md`
- **Google Form Setup:** `GOOGLE_FORM_SETUP.md`
- **Payment Links:** `STRIPE_PAYMENT_LINKS.md`, `PAYPAL_SETUP.md`
- **Payment Issue:** `PAYMENT_ISSUE.md` (Stripe freeze details)
- **Property Research:** 
  - `property-research/31-douglas-mclean-ave-marewa-oneroof-data.md`
  - `property-research/31-douglas-mclean-ave-marewa-linz-title.md`
- **Templates:**
  - `report-templates/tier1-basic-report-template.md`
  - `TIER_LIMITATIONS_INTERNAL.md`

---

## 📝 NOTES FOR FUTURE-SELF

### If Picking Up This Project After a Break:
1. **Read this snapshot first** – it's the current state
2. **Check TODO.md** for active tasks
3. **Review TIER_LIMITATIONS_INTERNAL.md** for business logic
4. **Test property:** 31 Douglas McLean Ave has complete data for testing
5. **Priority fix:** Resolve Premium tier pricing model
6. **Beta contact:** Keegan Swanepoel (follow up if >5 days since last contact)

### Open Questions:
- Should Premium tier include actual LIM ordering service, or just "LIM-equivalent research"?
- What's the optimal price point for Premium? ($200, $250, $300, $450?)
- Do we need lawyer review of disclaimers before launch?
- Should we offer bulk discounts for real estate agencies?

---

**Last Updated:** 2026-08-07, 10:04 GMT+2  
**Next Snapshot:** After beta testing begins or major milestone reached

---

*This snapshot is designed to be overwritten/updated weekly or when major milestones are hit. Keep it current so future-you (or team members) can pick up where we left off.*
