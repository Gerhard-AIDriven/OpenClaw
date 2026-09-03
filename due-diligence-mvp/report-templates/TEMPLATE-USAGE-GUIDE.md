# Property Due Diligence Report - Template Usage Guide

**Version:** 1.0  
**Created:** 2026-08-04  
**Owner:** AI Driven (Gerhard Stimie)

---

## Overview

You have three template files for different report packages:

| File | Package | Pages | Use Case |
|------|---------|-------|----------|
| `basic-report-template.html` | Basic ($75) | 7 pages | Essential screening |
| `basic-report-template.html` + `standard-report-addendum.html` | Standard ($125) | 8-9 pages | Investment analysis |
| `basic-report-template.html` + `standard-report-addendum.html` (full) | Premium ($200) | 10-12 pages | Comprehensive due diligence |

---

## How to Generate Reports

### Method 1: Manual (MVP Phase - Weeks 1-2)

**Step-by-Step:**

1. **Collect Data from APIs:**
   ```bash
   # Query LINZ API for property details
   curl "https://data.linz.govt.nz/api/v1/queries/..." \
     -H "Authorization: Bearer YOUR_API_KEY"
   
   # Query Napier GIS for zoning/hazards
   curl "https://maps.napier.govt.nz/arcgis/rest/services/..." \
     -d "geometry={...}&f=json"
   ```

2. **Copy the HTML Template:**
   ```bash
   cp basic-report-template.html reports/report-123-main-st.html
   ```

3. **Replace Template Variables:**
   - Open the HTML file in VS Code or similar
   - Use Find & Replace (Ctrl+H) for each variable:
     - `{{address}}` → "123 Main Street"
     - `{{suburb}}` → "Marewa"
     - `{{titleNumber}}` → "NA1234/56"
     - etc.

   **All Template Variables:**
   ```
   {{reportId}}, {{reportDate}}, {{packageType}}, {{fullAddress}}
   {{propertyType}}, {{legalDescription}}, {{parcelId}}, {{landArea}}
   {{coordinates}}, {{linzDataDate}}, {{finding1}}, {{finding2}}
   {{finding3}}, {{finding4}}, {{flagsList}}, {{riskRating}}
   {{streetAddress}}, {{city}}, {{postcode}}, {{tenureType}}
   {{registeredOwners}}, {{ownershipShare}}, {{titleIssueDate}}
   {{easements}}, {{covenants}}, {{mortgages}}, {{otherInterests}}
   {{titleSearchDate}}, {{councilName}}, {{districtPlan}}
   {{primaryZoning}}, {{zoningCode}}, {{overlayZones}}
   {{heightRestriction}}, {{siteCoverage}}, {{permittedActivities}}
   {{restrictedActivities}}, {{prohibitedActivities}}
   {{developmentPotential}}, {{floodHazard}}, {{floodRisk}}, {{floodBadge}}
   {{coastalErosion}}, {{coastalRisk}}, {{coastalBadge}}
   {{liquefaction}}, {{liquefactionRisk}}, {{liquefactionBadge}}
   {{landslide}}, {{landslideRisk}}, {{landslideBadge}}
   {{tsunami}}, {{tsunamiRisk}}, {{tsunamiBadge}}
   {{volcanic}}, {{volcanicRisk}}, {{volcanicBadge}}
   {{hazardDetails}}, {{hazardAlertType}}, {{hazardIcon}}
   {{hazardTitle}}, {{hazardDataDate}}, {{waterSupply}}
   {{wastewater}}, {{stormwater}}, {{waterMeter}}, {{serviceCapacity}}
   {{electricityProvider}}, {{gasProvider}}, {{telecomProviders}}
   {{rubbishCollection}}, {{connectionNotes}}
   {{hailStatus}}, {{hailRisk}}, {{hailBadge}}, {{hailCategory}}
   {{knownContamination}}, {{previousLandUse}}, {{contaminationDetails}}
   {{contaminationAlertType}}, {{contaminationIcon}}
   {{contaminationTitle}}, {{hailHistory}}
   {{consentCount}}, {{consents}}, {{ratingUnitNumber}}
   {{capitalValue}}, {{landValue}}, {{improvementValue}}
   {{valuationDate}}, {{annualRates}}, {{ratesCategory}}
   {{ratesArrears}}, {{arrearsBadge}}, {{arrearsStatus}}
   {{consentNumbers}}, {{lowPriorityActions}}, {{mediumPriorityActions}}
   {{criticalActions}}
   ```

4. **For Standard/Premium Packages:**
   - Copy relevant sections from `standard-report-addendum.html`
   - Insert AFTER Page 3 (before Page 4)
   - Replace investment/comparable variables

5. **Convert to PDF:**
   - Open HTML in Chrome/Edge
   - Press Ctrl+P (Print)
   - Destination: "Save as PDF"
   - Settings:
     - Paper size: A4
     - Margins: Default
     - Background graphics: ✓ Enabled
     - Headers and footers: ✗ Disabled
   - Click Save

6. **Email to Client:**
   - Attach PDF
   - Use delivery email template (see below)

**Time Estimate:** 30-45 minutes per report (manual MVP)

---

### Method 2: Semi-Automated (Weeks 3-4)

**Tools Needed:**
- Node.js script to fetch API data
- Handlebars.js or similar templating engine
- Puppeteer for PDF generation

**Basic Workflow:**

```javascript
// generate-report.js
const fs = require('fs');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

// 1. Fetch data from APIs
const linzData = await fetchLinzData(address);
const councilData = await fetchCouncilGIS(address);
const ratesData = await fetchRatesData(address);

// 2. Combine all data
const reportData = {
  reportId: generateReportId(),
  reportDate: new Date().toISOString(),
  packageType: 'Standard',
  ...linzData,
  ...councilData,
  ...ratesData,
  // Add calculated fields
  riskRating: calculateRiskScore(linzData, councilData),
  flagsList: generateFlagsList(councilData)
};

// 3. Load and compile template
const templateSource = fs.readFileSync('basic-report-template.html', 'utf8');
const template = handlebars.compile(templateSource);
const html = template(reportData);

// 4. Generate PDF
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.pdf({
  path: `reports/${reportData.reportId}.pdf`,
  format: 'A4',
  printBackground: true
});
await browser.close();

console.log(`Report generated: ${reportData.reportId}.pdf`);
```

**Time Estimate:** 5-10 minutes per report (mostly verification)

---

### Method 3: Fully Automated (Month 2+)

**Architecture:**
```
[Form Submission] 
       ↓
[Webhook → Node.js Backend]
       ↓
[Parallel API Calls: LINZ + Council + Rates]
       ↓
[Data Aggregation & Risk Scoring]
       ↓
[Handlebars Template Rendering]
       ↓
[Puppeteer PDF Generation]
       ↓
[Upload to S3/Cloudflare R2]
       ↓
[Email PDF Link via SendGrid]
       ↓
[Update CRM/Database]
```

**Time Estimate:** <2 minutes per report (fully automated)

---

## Email Delivery Templates

### Basic Package Delivery Email

**Subject:** Your Property Due Diligence Report is Ready 📊

```
Hi [Client Name],

Great news! Your Property Due Diligence Report for [Address] is ready.

📎 DOWNLOAD YOUR REPORT: [Link to PDF]

WHAT'S INCLUDED:
✓ Legal property details (title, boundaries, ownership)
✓ Zoning confirmation from Napier City Council
✓ Natural hazard check (flood, erosion, liquefaction)
✓ Infrastructure connections
✓ Contaminated land register check
✓ Current rates and valuation data

IMPORTANT REMINDER:
This is an INFORMATIONAL REPORT only, NOT a formal LIM. 
Do not rely on this for final settlement decisions.

NEXT STEPS:
1. Review the report carefully
2. Note any flags in Section 9 (Recommendations)
3. If you're proceeding with purchase, order a formal LIM
4. Book a building inspection
5. Contact your solicitor to review legal matters

QUESTIONS?
Reply to this email or call me on 021 XXX XXX. I'm happy to walk through the findings.

Cheers,
Gerhard Stimie
AI Driven
gerhard@aidriven.biz
021 XXX XXX

P.S. If you found this report helpful, I'd really appreciate a referral to friends or colleagues looking to buy property!
```

---

### Standard Package Delivery Email

**Subject:** Your Property Due Diligence Report (Standard) is Ready 📊

```
Hi [Client Name],

Your Standard Property Due Diligence Report for [Address] is complete!

📎 DOWNLOAD YOUR REPORT: [Link to PDF]

WHAT'S INCLUDED (Everything in Basic PLUS):
✓ Detailed investment metrics and rental yield analysis
✓ Development potential assessment
✓ Cash flow projections (based on your purchase price)
✓ Extended recommendations section

KEY FINDINGS AT A GLANCE:
• [Finding 1 - e.g., "No flood hazard identified"]
• [Finding 2 - e.g., "Zoning permits dual occupancy"]
• [Finding 3 - e.g., "Estimated rental yield: 5.2% gross"]
• [Flag if any - e.g., "One building consent from 2018 requires status verification"]

INVESTMENT SUMMARY:
Based on your purchase price of $[XXX,XXX]:
• Estimated weekly rent: $XXX
• Gross rental yield: X.X%
• Weekly cash flow (with 20% deposit): $[+/-XXX]

⚠️ IMPORTANT:
This is NOT a formal LIM. Always obtain:
- Full LIM from council before settlement
- Professional building inspection
- Legal advice from your solicitor

NEXT STEPS:
1. Review Sections 3A (Investment Metrics) and 9 (Recommendations)
2. Pay special attention to any flagged items
3. If you want to discuss the findings, book your complimentary 15-min call: [Calendly Link]
4. Proceed with formal LIM and building inspection

NEED HELP INTERPRETING THIS?
I'm here to help! Reply to this email or call 021 XXX XXX to schedule a time to talk through the report.

Cheers,
Gerhard Stimie
AI Driven
gerhard@aidriven.biz
021 XXX XXX

P.S. Standard package includes a free 15-minute consultation call. Book here: [Calendly Link]
```

---

### Premium Package Delivery Email

**Subject:** Your Premium Property Due Diligence Report + Market Analysis is Ready 📊

```
Hi [Client Name],

Your comprehensive Premium Property Due Diligence Report for [Address] is ready!

📎 DOWNLOAD YOUR REPORT: [Link to PDF]

WHAT'S INCLUDED (Complete Package):
✓ Everything in Basic + Standard, PLUS:
✓ Comparable sales analysis (5 recent sales in your area)
✓ Estimated market value range
✓ 5-year capital growth projection
✓ Detailed investment scenario modeling
✓ Priority support and consultation call

EXECUTIVE SUMMARY:
• Overall Risk Rating: [X/5] ([Low/Medium/High])
• Estimated Market Value: $[XXX,XXX] - $[XXX,XXX]
• Rental Yield: [X.X]% gross / [X.X]% net
• Key Opportunity: [e.g., "Development potential for granny flat"]
• Key Risk: [e.g., "Flood zone overlay requires further investigation"]

COMPARABLE MARKET ANALYSIS:
Recent sales in [Suburb] suggest:
• Median sale price: $[XXX,XXX]
• Average days on market: [XX] days
• Market tempo: [Buyer's/Balanced/Seller's] market
• Price trend: [Increasing/Stable/Decreasing] over last 6 months

YOUR CONSULTATION CALL:
As part of the Premium package, I've reserved time for a detailed walkthrough:

📅 BOOK YOUR CALL: [Calendly Link]
(Or reply with your preferred time - I'm flexible!)

We'll cover:
- Report findings and what they mean for you
- Investment strategy specific to this property
- Answers to any questions
- Next steps recommendation

⚠️ CRITICAL DISCLAIMER:
This is NOT a formal LIM and does NOT provide legal protection. Before settlement, you MUST obtain:
1. Formal LIM from Napier City Council
2. Professional building inspection
3. Registered valuation (for mortgage)
4. Legal review by your solicitor

RECOMMENDED PROFESSIONALS:
If you need referrals:
• Building Inspector: [Name, Phone]
• Solicitor: [Name, Phone]
• Mortgage Adviser: [Name, Phone]

WHAT NOW?
1. Read through the full report (especially Sections 3A, 3B, and 9)
2. Book your consultation call using the link above
3. Share the report with your solicitor and adviser
4. Order formal LIM immediately (I can help coordinate this)
5. Schedule building inspection

I'm genuinely excited about this property for you because [personalized note based on their situation]. Let's chat through the details!

Warm regards,
Gerhard Stimie
AI Driven
gerhard@aidriven.biz
021 XXX XXX

P.S. Premium clients get priority support - text/call me directly if anything urgent comes up while reviewing the report.
```

---

## Quality Assurance Checklist

Before sending ANY report to a client:

- [ ] All template variables replaced (no `{{...}}` remaining)
- [ ] Address matches client request exactly
- [ ] Report ID is unique and logged
- [ ] Date is current
- [ ] Package type correct (Basic/Standard/Premium)
- [ ] All data sources cited correctly
- [ ] Disclaimer banners present and prominent
- [ ] Risk rating calculated and justified
- [ ] Flags/recommendations are specific to this property
- [ ] Contact details are correct
- [ ] PDF renders properly (test print first report)
- [ ] File name follows convention: `YYYYMMDD-[ReportID]-[Address].pdf`
- [ ] Email subject line personalized
- [ ] Download link tested (if using cloud storage)
- [ ] Client name spelled correctly
- [ ] Any promised follow-ups scheduled in calendar

---

## Common Issues & Solutions

### Issue: Template Variable Not Replacing
**Cause:** Typo in variable name or missing from data object  
**Solution:** Double-check exact spelling (case-sensitive). Use this list:
[paste full variable list from above]

### Issue: PDF Formatting Broken
**Cause:** Browser print settings incorrect  
**Solution:** 
- Use Chrome or Edge (best CSS print support)
- Enable "Background graphics" in print dialog
- Set margins to "Default" or "None"
- Paper size: A4

### Issue: Data Missing from API
**Cause:** Property not in system, API down, or access denied  
**Solution:**
- Check API status/dashboard
- Try alternative data source
- Flag in report: "Data unavailable from [source] - recommend manual verification"
- Offer partial refund if critical data missing

### Issue: Client Asks for Refund
**Common Reasons:**
- Expected full LIM (didn't read disclaimer)
- Data didn't match their expectations
- Report took longer than promised

**Prevention:**
- Bold disclaimers in confirmation email
- Clear delivery timeframes
- Over-communicate during process

**Resolution:**
- Listen to concern
- Explain limitations clearly
- Offer partial refund or credit if justified
- Document for process improvement

---

## Pricing & Payment Tracking

Create a Google Sheet with these columns:

| Date | Report ID | Client Name | Package | Price | Payment Status | Delivery Date | Time Spent | Profit |
|------|-----------|-------------|---------|-------|----------------|---------------|------------|--------|
| 2026-08-05 | DDR-001 | John Smith | Standard | $125 | Paid | 2026-08-05 | 35 min | $118 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

**Formulas:**
- Profit = Price - (Time Spent in hours × $50/hr) - Payment fees (~2%)
- Running total at bottom

**Monthly Targets:**
- Reports delivered: 20-30
- Average package value: $125+
- Customer satisfaction: 4.5/5+
- Repeat/referral rate: 25%+

---

## Next Steps for Automation

Once you've manually processed 10-20 reports:

1. **Document Pain Points:** What took longest? What errors occurred?
2. **Build API Integration Scripts:** Node.js/Python to auto-fetch data
3. **Create Web Form Backend:** Connect form submissions to report generator
4. **Set Up Cloud Storage:** AWS S3 or Cloudflare R2 for PDF hosting
5. **Automate Email Delivery:** SendGrid or AWS SES integration
6. **Build Client Portal:** Simple web app to download past reports
7. **Add Payment Gateway:** Stripe integration for instant checkout

**Estimated Timeline:**
- Weeks 1-2: Manual MVP (learn the process)
- Weeks 3-4: Semi-automated (scripts for data fetching)
- Month 2: Fully automated pipeline
- Month 3: Scale marketing, aim for 50+ reports/month

---

**Questions?** Reach out to the AI Driven workspace memory or update this guide as you learn!
