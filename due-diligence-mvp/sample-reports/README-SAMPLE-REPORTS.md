# Sample Property Due Diligence Reports

**Purpose:** These 5 sample reports demonstrate the look, feel, and depth of information provided in each package tier.

**Usage:**
- Show to prospects during sales conversations
- Embed in email outreach
- Display on website (with watermarks if needed)
- Use in social media posts ("Here's what a report looks like...")

---

## Sample Report Files

### 1. **Sample-Basic-Report.pdf** (or .html)
**Property:** 42 Marewa Road, Marewa, Napier  
**Package:** Basic ($75)  
**Key Features Demonstrated:**
- Clean, professional formatting
- AI Driven branding (dark theme, orange/purple accents)
- All 7 sections populated with realistic fake data
- Prominent disclaimers throughout
- Risk rating: 2/5 (Low-Medium)
- Clear recommendations section

**Use Case:** Show first-home buyers what they get at entry level

---

### 2. **Sample-Standard-Report.pdf** (or .html)
**Property:** 18 Thompson Road, Greenmeadows, Napier  
**Package:** Standard ($125)  
**Key Features Demonstrated:**
- Everything in Basic PLUS:
- Investment metrics section (Section 3A)
- Rental yield calculations (gross: 5.2%, net: 3.8%)
- Cash flow projections with mortgage scenario
- 5-year capital growth forecast
- Development potential assessment

**Use Case:** Show investors the analytical depth

---

### 3. **Sample-Premium-Report.pdf** (or .html)
**Property:** 156 Gloucester Street, Taradale, Napier  
**Package:** Premium ($200)  
**Key Features Demonstrated:**
- Everything in Standard PLUS:
- Comparable sales analysis (Section 3B)
- 5 recent sales table with comparisons
- Market statistics (median, days on market)
- Estimated market value range ($875k-$925k)
- Confidence level assessment
- Professional consultation call offer

**Use Case:** Show serious buyers/investors the full white-glove treatment

---

### 4. **Sample-High-Risk-Report.pdf** (or .html)
**Property:** 23 Riverbank Avenue, Bay View, Napier  
**Package:** Standard ($125)  
**Key Features Demonstrated:**
- How we handle properties with red flags
- Multiple hazard overlays (flood + liquefaction)
- HAIL contamination alert (previous service station)
- Strong warnings and recommendations
- Risk rating: 4/5 (High)
- Clear guidance on next steps (order LIM, specialist reports)

**Use Case:** Demonstrate we don't sugarcoat - we protect buyers from bad deals

---

### 5. **Sample-Development-Opportunity.pdf** (or .html)
**Property:** 89 Station Road, Havelock North  
**Package:** Premium ($200)  
**Key Features Demonstrated:**
- Mixed zoning (Residential + Business)
- High development potential (duplex feasible)
- Infrastructure capacity confirmed
- Comparables show development premium
- Referral to surveyor/planner recommended
- Risk rating: 3/5 (Medium - opportunity + complexity)

**Use Case:** Show developers/investors how we identify opportunities

---

## How to Generate Sample PDFs

### Option A: Manual (Quick MVP)
1. Open the HTML template files in Chrome/Edge
2. Replace template variables with sample data (see below)
3. Press Ctrl+P → Save as PDF
4. Name files according to convention above

### Option B: Automated (Node.js Script)
```bash
node generate-sample-reports.js
```
(To be created - will auto-populate templates with sample data)

---

## Sample Data Values

### Property 1: 42 Marewa Road (Basic)
```
address: "42 Marewa Road"
suburb: "Marewa"
city: "Napier"
postcode: "4112"
titleNumber: "NA4521/89"
landArea: "658 m²"
capitalValue: "$685,000"
annualRates: "$2,450"
riskRating: "2/5 (Low-Medium)"
primaryZoning: "Residential - Medium Density"
floodHazard: "No flood hazard identified"
liquefaction: "Minor risk (yellow zone)"
```

### Property 2: 18 Thompson Road (Standard)
```
address: "18 Thompson Road"
suburb: "Greenmeadows"
city: "Napier"
purchasePrice: "750,000"
weeklyRent: "620"
grossYield: "5.2%"
netYield: "3.8%"
weeklyCashFlow: "+$45"
riskRating: "2/5 (Low)"
developmentPotential: "Granny flat feasible (subject to consent)"
```

### Property 3: 156 Gloucester Street (Premium)
```
address: "156 Gloucester Street"
suburb: "Taradale"
city: "Napier"
estimatedValueLow: "875,000"
estimatedValueHigh: "925,000"
confidenceLevel: "High (8 comparable sales in 2km radius)"
medianPrice: "$895,000"
daysOnMarket: "32 days"
priceTrend: "+4.2% over last 6 months"
riskRating: "1/5 (Low)"
```

### Property 4: 23 Riverbank Avenue (High Risk)
```
address: "23 Riverbank Avenue"
suburb: "Bay View"
city: "Napier"
floodHazard: "100-year flood zone (partial)"
liquefaction: "High risk (red zone)"
hailStatus: "YES - Previous service station (1978-1995)"
contaminationAlert: "Potential soil contamination from petroleum products"
riskRating: "4/5 (High)"
recommendation: "DO NOT PROCEED without specialist geotechnical and contamination reports"
```

### Property 5: 89 Station Road (Development)
```
address: "89 Station Road"
suburb: "Havelock North"
primaryZoning: "Mixed Use (Residential + Business)"
overlayZones: "Town Centre Overlay"
developmentPotential: "Duplex or small commercial feasible"
siteCoverage: "Up to 60% site coverage permitted"
heightRestriction: "10.5m (3 stories max)"
riskRating: "3/5 (Medium - opportunity + consent complexity)"
```

---

## Watermarking (Optional)

If sharing publicly (website, social media), consider adding watermarks:

**HTML/CSS Method:**
```css
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 8rem;
  color: rgba(247,147,30,0.08);
  pointer-events: none;
  z-index: 9999;
  white-space: nowrap;
}
```

**Text:** "SAMPLE REPORT - NOT FOR RELIANCE"

---

## Next Steps

1. **Generate all 5 sample PDFs** using the data above
2. **Upload to Google Drive/Dropbox** for easy sharing
3. **Create short links** (bit.ly) for each sample
4. **Add to email signatures** ("See a sample report → [link]")
5. **Embed in website** sales page

---

**Pro Tip:** When showing samples to prospects, say:
> "This is an actual report we generated for [similar property type]. Yours will follow the same format but with data specific to the address you're considering. Want to see what one would look like for a property you're currently evaluating?"

Then offer to generate a **free mini-report** (just the hazard + zoning summary) as a teaser.
