# Due Diligence MVP Project - To-Do List

**Status:** In Progress  
**Last Updated:** 2026-08-05  
**Project Owner:** AI Driven (Gerhard Stimie)

---

## Context

**Product:** Property Due Diligence Report (preliminary property intelligence for screening)  
**Target Users:** Real estate agents, property buyers, investors, sellers  
**Differentiation:** Faster and cheaper than formal LIM ($75-$300 vs $300-$450), more detailed than Trade Me insights  
**Key Feature:** NOT a legal LIM substitute - informational only

**Reference Doc:** `research/due-diligence-report-input-requirements.md` (created 2026-08-04)

---

## Completed ✅

- [x] Input requirements document created (2026-08-04)
  - Essential inputs defined (Address, Suburb, City, Postcode)
  - Recommended + optional enhancement inputs specified
  - 4 intake methods documented (Web Form, Email, Phone/WhatsApp, Platform Integration)
  - Input validation rules drafted
  - Edge cases documented (rural, multi-unit, new subdivisions, cross-boundary)
  - Privacy Act 2020 compliance requirements outlined
  - 3 pricing tiers defined ($75/$125/$200-$300)
  - Competitive comparison completed
  
- [x] Sample report prepared and sent to Keegan Swanepoel (2026-08-05)
- [x] Awaiting reply from Keegan Swanepoel

- [x] Google Form setup guide created (2026-08-05)
  - Complete step-by-step instructions in `GOOGLE_FORM_SETUP.md`
  - Includes Stripe product setup, Zapier automation, email templates
  - Ready for 20-minute implementation

- [x] **GOOGLE FORM PUBLISHED** (2026-08-05) ✅
  - Form created with all sections/questions
  - Branding configured (AI Driven logo header 800x200px)
  - Google Sheets response tracking active
  - **Live link:** https://forms.gle/MnVipK8ZWPfBi54C7

---

## Pending / Next Steps

### Immediate (Awaiting Feedback)
- [ ] Receive feedback/response from Keegan Swanepoel
- [ ] Refine sample report based on feedback

### MVP Build Phase
- [x] ~~BUILD GOOGLE FORM~~ (COMPLETED 2026-08-05)
- [x] ✅ Set up Stripe payment links (all 3 packages)
  - [x] ✅ Basic Report ($75) - `https://buy.stripe.com/9B65kD95P1Z0875bEog3601`
  - [x] ✅ Standard Report ($125) - `https://buy.stripe.com/14A7sL81LgTU3QP6k4g3602`
  - [x] ✅ Premium Report ($200) - `https://buy.stripe.com/14A14n5TD5bcafdgYIg3603`
  - ⚠️ **Note:** Stripe account frozen pending NZ proof of address — links may not process payments until verified
  - **Contingency:** PayPal backup recommended (see `PAYMENT_ISSUE.md`)
- [ ] Configure Zapier automation (form → email + payment link) — *Optional, can do manually for now*
- [ ] Create input validation logic
  - LINZ Address Points API integration
  - Auto-detect council district
  - Handle edge cases gracefully
- [ ] Design report templates (Tier 1, 2, 3 versions)
  - Consistent AI Driven branding
  - Clear disclaimers prominent
- [ ] Set up payment processing
  - Stripe integration for web form
  - Manual invoicing option for agents
  - GST handling

### Testing & Launch
- [ ] Test end-to-end flow with 5-10 properties
- [ ] Verify API calls succeed
- [ ] Check report accuracy against real LIMs
- [ ] Get feedback from beta users (agents, investors)
- [ ] Refine questions/process based on feedback
- [ ] Launch to market

---

## Key Decisions Made

- **Product Name:** "Property Due Diligence Report" (not "LIM-Lite")
- **Pricing:** 3-tier model ($75 Basic, $125 Standard, $200-$300 Premium)
- **Turnaround:** Instant (automated) to 4 hours depending on tier
- **Legal Position:** Informational only - NOT a substitute for formal LIM, legal advice, building inspection, or valuation

---

## Notes

- **Contact:** Keegan Swanepoel
- **First contact:** Email sent 2026-08-05 with sample report
- **Next action:** Await response, then follow up if no reply within 3-5 days
- **Data Sources:** LINZ titles, council GIS APIs (Napier, Hastings, etc.), rates databases

## Google forms link
- **Link** https://forms.gle/MnVipK8ZWPfBi54C7