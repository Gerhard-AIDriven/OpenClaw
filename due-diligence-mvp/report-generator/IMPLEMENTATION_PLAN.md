# Implementation Plan - Basic Report Generator

**Phase:** 2 (Semi-Automated)  
**Timeline:** Build today (2-3 hours)  
**Test:** First real order

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  generate-report.js                                  │
│                                                      │
│  1. Parse property address                           │
│  2. Fetch LINZ title data (API)                      │
│  3. Scrape council GIS (Puppeteer)                   │
│  4. Prompt user for missing data                     │
│  5. Populate HTML template                           │
│  6. Generate PDF                                     │
│  7. Save to output/                                  │
└─────────────────────────────────────────────────────┘
         │
         ├─→ templates/basic-report.html
         ├─→ config/data-sources.json
         └─→ output/DD-{ID}-basic.pdf
```

---

## Step 1: Get LINZ API Key (5 minutes)

**Action Required:** Gerhard needs to register for free LINZ API key.

1. Go to: https://www.linz.govt.nz/developers
2. Click "Get an API key"
3. Fill in:
   - Name: Gerhard Stimie
   - Email: gerhard@aidriven.biz
   - Organization: AI Driven
   - Use case: Property due diligence reports
4. Submit → Receive API key via email (usually instant)
5. Save key to: `config/linz-api-key.txt`

**Why LINZ?**
- Official property titles
- Ownership info
- Easements, covenants
- Boundaries (Landonline)
- Free for commercial use

---

## Step 2: Create Project Structure

Run these commands:

```bash
cd C:\Users\gstim\.openclaw\workspace\due-diligence-mvp
mkdir report-generator
cd report-generator
mkdir templates config output
```

Files to create:
- `generate-report.js` (main script)
- `templates/basic-report.html` (template)
- `config/data-sources.json` (endpoints)
- `config/linz-api-key.txt` (your key)
- `package.json` (dependencies)

---

## Step 3: Data Collection Strategy

### A. LINZ Data (Automated via API)

**Endpoint:** `https://data.linz.govt.nz/services/api/v1/features/`

**Query Example:**
```javascript
const response = await fetch(
  `https://data.linz.govt.nz/services/api/v1/features/?key=${API_KEY}` +
  `&layer=property-title&filter=address=${encodedAddress}` +
  `&outputFormat=geojson`
);
const data = await response.json();
```

**Returns:**
- Title number (e.g., NA4521/89)
- Owners names
- Land area
- Legal description
- Easements list

### B. Council GIS (Semi-Automated)

**Napier Maps:** https://maps.napier.govt.nz/
**Hastings Maps:** https://hdcmaps.com/

**Method:**
1. Puppeteer opens map in browser
2. Searches for address
3. Clicks on property
4. Extracts visible data:
   - Zoning code
   - Hazard overlays (flood, liquefaction)
   - Capital value
   - Annual rates
5. Screenshots hazard maps (optional)

**Limitation:** Some councils may block automated scraping.  
**Fallback:** Manual copy-paste from open browser windows.

### C. OneRoof Data (Manual for Now)

**URL:** https://www.oneroof.co.nz/

**Process:**
1. Script opens OneRoof search page
2. You manually enter address
3. Copy-paste values into terminal when prompted:
   - Capital value
   - Rates
   - Last sold price/date
   - Rental estimate

**Future:** Automated scraping (check terms of service first).

---

## Step 4: Basic Report Template

**File:** `templates/basic-report.html`

**Sections (7 total):**

1. **Property Identification**
   - Address, suburb, city, postcode
   - Property type (residential/commercial)

2. **Legal Details (LINZ)**
   - Title number
   - Owners
   - Land area
   - Legal description

3. **Natural Hazards (Council GIS)**
   - Flood zone: Yes/No/Partial
   - Liquefaction: Low/Medium/High
   - Coastal erosion: Yes/No
   - Hazard map screenshot (optional)

4. **Zoning & Land Use**
   - District plan zoning
   - Permitted activities
   - Height restrictions
   - Site coverage limits

5. **Valuation & Rates**
   - Capital value (CV)
   - Land value
   - Annual rates
   - Last valuation date

6. **Easements & Encumbrances**
   - List of easements
   - Type (right of way, drainage, etc.)
   - Benefited/burdened properties

7. **Risk Summary & Recommendations**
   - Overall risk rating (1-5)
   - Key findings
   - Recommended next steps (LIM, builder inspection, etc.)

**Disclaimer (Prominent):**
> This is an INFORMATIONAL REPORT only, NOT a legal LIM. Do not use for final settlement decisions. Always obtain a formal LIM and independent inspections before purchasing.

---

## Step 5: PDF Generation (Puppeteer)

**Already installed!** Your `node_modules` has Puppeteer.

**Code:**
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

async function generatePDF(htmlPath, pdfPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
  });
  
  await browser.close();
  console.log('✅ PDF generated:', pdfPath);
}
```

---

## Step 6: User Interaction Flow

**Terminal prompts during generation:**

```
🚀 AI Driven Report Generator - Basic Tier
==========================================

Property: 123 Smith Street, Marewa, Napier

[1/5] Fetching LINZ title data... ✅ Done
  Title: NA4521/89
  Owners: John Smith, Jane Smith
  Area: 658 m²

[2/5] Checking council hazards... ✅ Done
  Flood: No
  Liquefaction: Minor (yellow)
  
[3/5] OneRoof data needed (manual)
  → Opening OneRoof in browser...
  
  Please enter the following from OneRoof.co.nz:
  Capital Value: $ [user types: 685000]
  Annual Rates: $ [user types: 2450]
  
[4/5] Generating HTML report... ✅ Done
  Saved to: output/DD-260806-001-basic.html

[5/5] Converting to PDF... ✅ Done
  Saved to: output/DD-260806-001-basic.pdf

✨ Report ready! 
  Open: output/DD-260806-001-basic.pdf
  
Ready to email to customer.
```

---

## Step 7: Testing Checklist

Before using with real customers:

- [ ] Test with 5 different properties (varied types)
- [ ] Verify LINZ API returns correct data
- [ ] Confirm council GIS scraping works (or manual fallback)
- [ ] Check PDF formatting (no cut-off text)
- [ ] Verify all disclaimers present
- [ ] Test email delivery (send to yourself)
- [ ] Time the process (target: <10 min)

---

## File Templates

### `config/data-sources.json`
```json
{
  "linz": {
    "baseUrl": "https://data.linz.govt.nz/services/api/v1/features/",
    "layers": {
      "title": "property-title",
      "boundaries": "property-boundaries",
      "easements": "easements"
    },
    "apiKeyFile": "config/linz-api-key.txt"
  },
  "councils": {
    "napier": {
      "gisUrl": "https://maps.napier.govt.nz/",
      "searchParam": "address",
      "hazardLayer": "natural-hazards",
      "zoningLayer": "district-plan-zones"
    },
    "hastings": {
      "gisUrl": "https://hdcmaps.com/",
      "searchParam": "property",
      "hazardLayer": "hazards",
      "zoningLayer": "planning"
    }
  },
  "oneroof": {
    "searchUrl": "https://www.oneroof.co.nz/property/"
  }
}
```

### `package.json`
```json
{
  "name": "ai-driven-report-generator",
  "version": "1.0.0",
  "description": "Semi-automated property due diligence reports",
  "main": "generate-report.js",
  "scripts": {
    "generate": "node generate-report.js",
    "test": "node test-sample.js"
  },
  "dependencies": {
    "puppeteer": "^22.0.0",
    "axios": "^1.6.0",
    "dotenv": "^16.0.0"
  }
}
```

---

## Error Handling

**What if:**

1. **LINZ API fails?**
   - Log error
   - Prompt user to manually check LINZ website
   - Continue with other data sources

2. **Council GIS blocks scraping?**
   - Detect block (timeout or CAPTCHA)
   - Fall back to manual mode
   - Open browser for user to copy-paste

3. **OneRoof changes layout?**
   - Manual entry always required (for now)
   - Update selectors in config file

4. **PDF generation fails?**
   - Check Puppeteer installation
   - Verify HTML template is valid
   - Retry with headless: false (visible browser)

---

## Next: Standard & Premium Tiers

After Basic works reliably:

**Standard (+$50):**
- Add investment metrics section
- Rental yield calculations
- Cash flow projections
- Comparable sales (manual for now)

**Premium (+$125):**
- 5-year growth forecast
- Market trend analysis
- Renovation cost estimates
- Adjacent development scan (manual research)
- 15-min consultation call

---

**Ready to build?** Let me know and I'll create all the files! 🚀
