# WhatsApp + Web Form Merge Plan

## Objective
Unify the WhatsApp automation and web form MVP to use a **single report generation engine**, eliminating duplication and ensuring consistency across both channels.

---

## Current State Analysis

### Web Form MVP (`due-diligence-mvp/`)
**Strengths:**
- ✅ Complete LINZ API integration (titles endpoint)
- ✅ Council GIS scraper (Napier/Hastings)
- ✅ OneRoof valuation scraping
- ✅ Comprehensive data model (legal, hazards, zoning, valuation)
- ✅ Professional HTML/PDF report generation
- ✅ Order ID tracking (DD-YYMMDD-XXX format)
- ✅ Google Sheets integration for CRM

**Limitations:**
- ❌ Requires manual browser interaction (OneRoof search)
- ❌ No automated delivery mechanism
- ❌ Payment flow not integrated with report generation
- ❌ Standalone script (not API-accessible)

### WhatsApp Automation (`whatsapp/`)
**Strengths:**
- ✅ Fully automated conversational intake
- ✅ Cloudflare Worker + KV state management
- ✅ Auto-deployment to Cloudflare Pages (GitHub integration)
- ✅ Instant report link delivery via WhatsApp
- ✅ Production-ready polling system

**Limitations:**
- ❌ Report template is basic (placeholder data only)
- ❌ No LINZ API integration yet
- ❌ No council data fetching
- ❌ Separate codebase from MVP

---

## Integration Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  Web Form       │         │  WhatsApp        │
│  (index.html)   │         │  (Worker v3)     │
└───────┬─────────┘         └────────┬─────────┘
        │                            │
        │ HTTP POST                  │ KV Queue Entry
        │                            │
        ▼                            ▼
┌─────────────────────────────────────────────────┐
│         UNIFIED REPORT GENERATION ENGINE        │
│         (Shared Module - See Below)             │
├─────────────────────────────────────────────────┤
│  1. Parse address & validate                    │
│  2. Fetch LINZ title data (API)                 │
│  3. Scrape council GIS (Puppeteer)              │
│  4. Fetch OneRoof valuation (Puppeteer)         │
│  5. Generate HTML report (template)             │
│  6. Save to aidriven-website/reports/           │
│  7. Git commit & push                           │
│  8. Wait 30s for Cloudflare deployment          │
│  9. Return report URL                           │
└─────────────────────────────────────────────────┘
        │                            │
        │ JSON response              │ WhatsApp message
        │ (web form)                 │ (automated)
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│ Payment Page    │         │ Customer receives│
│ or Email        │         │ report link      │
└─────────────────┘         └──────────────────┘
```

---

## Implementation Steps

### Phase 1: Extract Shared Report Engine ⭐ **PRIORITY**
**File:** `automation/whatsapp-property-report/report-engine.js`

Create a new shared module that both systems can call:

```javascript
// report-engine.js
const { fetchLinZData } = require('./due-diligence-mvp/report-generator/linz-fetcher');
const { scrapeCouncilGIS } = require('./due-diligence-mvp/report-generator/council-scraper');
const { fetchOneRoofValuation } = require('./due-diligence-mvp/report-generator/oneroof-fetcher');
const { generateReportHTML } = require('./whatsapp/report-template-new');

async function generatePropertyReport(address, packageType, context = {}) {
  // 1. Parse address
  const parsed = parseAddress(address);
  
  // 2. Fetch LINZ data
  const linzData = await fetchLinZData(parsed.street, context.linzApiKey);
  
  // 3. Fetch council data
  const councilData = await scrapeCouncilGIS(parsed.city, parsed.address);
  
  // 4. Fetch valuation (skip for Basic package if needed)
  const valuationData = packageType !== 'basic' 
    ? await fetchOneRoofValuation(parsed.address) 
    : null;
  
  // 5. Merge all data
  const reportData = {
    ...linzData,
    ...councilData,
    ...valuationData,
    packageType,
    generatedAt: new Date().toISOString()
  };
  
  // 6. Generate HTML
  const html = generateReportHTML(reportData);
  
  // 7. Save file
  const filename = saveReport(html, address, packageType);
  
  // 8. Git commit & push
  await commitToGit(filename);
  
  // 9. Wait for deployment
  await sleep(30000);
  
  // 10. Return URL
  return `https://aidriven.biz/reports/${filename}`;
}

module.exports = { generatePropertyReport };
```

**Benefits:**
- Single source of truth for report logic
- Both web form and WhatsApp use identical data sources
- Easier to maintain and update
- Consistent customer experience

---

### Phase 2: Update WhatsApp Poll Script
**File:** `whatsapp/poll-whatsapp-requests-v2.js`

Replace the current simple template generation with:

```javascript
const { generatePropertyReport } = require('../automation/whatsapp-property-report/report-engine');

// Inside processRequest function:
try {
  const reportUrl = await generatePropertyReport(
    request.address,
    request.package,
    { linzApiKey: process.env.LINZ_API_KEY }
  );
  
  // Send WhatsApp message with link
  await sendWhatsAppMessage(request.phone, reportUrl);
  
} catch (error) {
  console.error('Report generation failed:', error);
  // Handle error (notify admin, retry, etc.)
}
```

**Remove:**
- Old `report-template-new.js` direct calls (or keep as fallback)
- Manual data placeholders

---

### Phase 3: Update Web Form Backend
**File:** `due-diligence-mvp/index.html` (form submission handler)

Replace the Google Sheets-only submission with:

```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  try {
    // Option A: Immediate report generation (premium customers)
    if (data.package === 'premium') {
      const reportUrl = await generatePropertyReport(
        `${data.address}, ${data.suburb}, ${data.city}`,
        data.package,
        { linzApiKey: LINZ_API_KEY }
      );
      
      // Redirect to payment page with report URL
      window.location.href = `/payment?report=${encodeURIComponent(reportUrl)}&amount=200`;
    } 
    // Option B: Queue for manual processing (basic/standard)
    else {
      await submitToGoogleSheet(data, GOOGLE_SCRIPT_URL);
      showSuccessMessage('Order received! We\'ll process your report within 24 hours.');
    }
    
  } catch (error) {
    showError('Failed to process order. Please contact us directly.');
  }
});
```

---

### Phase 4: LINZ API Key Management
**File:** `.env` or Cloudflare Environment Variables

**Current Locations:**
- MVP: `due-diligence-mvp/config/linz-api-key.txt` (file-based)
- WhatsApp: Not yet configured

**Unified Solution:**
1. Store LINZ API key in Cloudflare Worker environment variables
2. Create `.env.example` for local development
3. Add to `.gitignore` (never commit secrets)

```bash
# .env (local development)
LINZ_API_KEY=your_key_here
CLOUDFLARE_API_TOKEN=cf_xxxxx
GITHUB_TOKEN=ghp_xxxxx
```

---

### Phase 5: Data Model Alignment

**MVP Data Structure:**
```javascript
{
  titleNumber: "HB1234/56",
  owners: "John Smith",
  landArea: "850 m²",
  legalDescription: "Lot 1 DP 12345",
  easements: "None",
  capitalValue: 685000,
  landValue: 485000,
  annualRates: 2450,
  floodHazard: "No",
  liquefactionRisk: "Low",
  zoningCode: "R1",
  riskRating: 2
}
```

**WhatsApp Current Structure:**
```javascript
{
  address: "16 Ferguson Avenue",
  suburb: "Napier South",
  package: "basic"
}
```

**Action:** Ensure WhatsApp report template accepts the full MVP data structure when available, with graceful fallbacks for missing fields.

---

### Phase 6: Testing Strategy

1. **Unit Tests** (shared engine):
   - Address parsing
   - LINZ API response handling
   - Error cases (API down, no results)

2. **Integration Tests**:
   - Web form → Report generation → Email delivery
   - WhatsApp → Report generation → Link delivery

3. **E2E Tests**:
   - Full flow with real property address
   - Verify Cloudflare deployment success
   - Check report link accessibility

---

## File Organization

```
workspace/
├── automation/
│   └── whatsapp-property-report/
│       ├── MERGE-PLAN.md (this file)
│       ├── report-engine.js ⭐ NEW (shared logic)
│       ├── linz-fetcher.js (extracted from MVP)
│       ├── council-scraper.js (extracted from MVP)
│       ├── oneroof-fetcher.js (extracted from MVP)
│       ├── worker-v3-conversational.js
│       └── poll-whatsapp-requests-v2.js (updated)
│
├── due-diligence-mvp/
│   ├── index.html (updated form handler)
│   └── report-generator/
│       ├── generate-report.js (keep for CLI usage)
│       └── [extract modules to automation/]
│
├── whatsapp/
│   ├── report-template-new.js (update to accept full data model)
│   └── [other files]
│
└── aidriven-website/
    └── reports/ (generated reports)
```

---

## Migration Checklist

- [ ] **Phase 1:** Extract LINZ fetcher to shared module
- [ ] **Phase 1:** Extract council scraper to shared module
- [ ] **Phase 1:** Extract OneRoof fetcher to shared module
- [ ] **Phase 1:** Create unified `report-engine.js`
- [ ] **Phase 2:** Update WhatsApp poll script to use new engine
- [ ] **Phase 3:** Update web form submission handler
- [ ] **Phase 4:** Configure environment variables (LINZ API key)
- [ ] **Phase 5:** Align data models between systems
- [ ] **Phase 6:** Run end-to-end test (WhatsApp + Web)
- [ ] **Documentation:** Update README with new architecture

---

## Benefits of Merger

1. **Single Source of Truth:** One report engine, two entry points
2. **Consistency:** Same data quality for web + WhatsApp customers
3. **Maintainability:** Fix bugs once, benefit everywhere
4. **Scalability:** Easy to add new channels (email, API partners)
5. **Professional:** Real LINZ data justifies paid pricing tiers

---

## Next Actions (This Weekend)

1. **Saturday Morning:** Extract LINZ API logic from MVP
2. **Saturday Afternoon:** Build shared `report-engine.js`
3. **Sunday Morning:** Update WhatsApp poll script
4. **Sunday Afternoon:** End-to-end testing with real property

**Estimated Time:** 6-8 hours total
**Risk Level:** Low (existing code works, just refactoring)
**Impact:** High (unlocks paid tier launch with real data)

---

## Questions to Resolve

1. **LINZ API Key:** Do we have a production key, or need to register?
2. **Rate Limits:** How many LINZ API calls per day are allowed on free tier?
3. **Error Handling:** What happens if LINZ is down during report generation?
4. **Fallback Strategy:** Should we queue requests for manual processing if automation fails?

---

*Created: 2026-08-15*
*Status: Ready for implementation*
