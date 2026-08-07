# Due Diligence Report Generator - Phase 2

**Status:** Ready to implement  
**Tier:** Basic Report ($75)  
**Generation Time:** ~10 minutes (mostly verification)  
**Date:** 2026-08-06

---

## How It Works

```
1. Run script with property address
   ↓
2. Script auto-fetches from LINZ + Council GIS
   ↓
3. You verify data + fill any gaps (5-10 min)
   ↓
4. Script generates HTML report
   ↓
5. Script converts to PDF (Puppeteer)
   ↓
6. Email PDF to customer
```

---

## Quick Start

### Step 1: Install Dependencies (Already Done!)
Your `node_modules` already has Puppeteer installed. ✅

### Step 2: Run the Generator

```bash
cd due-diligence-mvp\report-generator
node generate-report.js "123 Smith Street, Marewa, Napier"
```

### Step 3: Verify Data
Script will open browser windows for:
- LINZ title search
- Council GIS (hazards, zoning)
- OneRoof (valuation)

You copy-paste any missing data into the terminal prompts.

### Step 4: Generate PDF
Script auto-generates:
- `reports/DD-{ORDER-ID}-basic.html`
- `reports/DD-{ORDER-ID}-basic.pdf`

### Step 5: Email to Customer
Attach PDF, send with your delivery email template.

---

## Files Created

| File | Purpose |
|------|---------|
| `generate-report.js` | Main generator script |
| `templates/basic-report.html` | Basic report HTML template |
| `config/data-sources.json` | API endpoints + selectors |
| `output/` | Generated reports (HTML + PDF) |

---

## Data Sources (Free APIs)

### 1. LINZ Data Service
- **URL:** https://data.linz.govt.nz/
- **API:** REST API (free, requires API key)
- **Data:** Title info, ownership, easements, boundaries
- **Get API Key:** https://www.linz.govt.nz/developers

### 2. Napier Council GIS
- **URL:** https://maps.napier.govt.nz/
- **Access:** Web interface (no public API yet)
- **Data:** Hazards, zoning, rates, building consents
- **Method:** Browser automation (Puppeteer)

### 3. Hastings Council GIS
- **URL:** https://hdcmaps.com/
- **Access:** Web interface
- **Data:** Same as Napier
- **Method:** Browser automation

### 4. OneRoof.co.nz
- **URL:** https://www.oneroof.co.nz/
- **Access:** Web scraping (check terms)
- **Data:** Capital value, rates, rental estimates
- **Method:** Manual copy-paste for now

---

## Next Steps After Basic Works

1. Add Standard Report template (+ investment metrics)
2. Add Premium Report template (+ growth forecasts)
3. Add adjacent property development scan
4. Full automation (no manual verification needed)

---

**Ready to build?** See `IMPLEMENTATION_PLAN.md` for technical specs.
