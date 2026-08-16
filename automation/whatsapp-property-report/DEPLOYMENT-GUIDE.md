# Property Report MVP - Deployment Guide

**Date:** 2026-08-16  
**Target:** Cloudflare Pages + Workers  
**Domain:** aidriven.biz

---

## 📁 CURRENT FILE LOCATIONS (Scattered!)

### Automation Folder (Current Working Directory)
```
C:\Users\gstim\.openclaw\workspace\automation\whatsapp-property-report\
├── linz-fetcher.js              ✅ LINZ WFS API client
├── hazard-fetcher.js            ✅ HBRC + Gabrielle hazards
├── rates-extractor.js           ⚠️ Node.js version (timeout issues)
├── report-engine.js             ✅ Main report orchestration
├── whatsapp-webhook.js          ✅ WhatsApp Meta webhook
├── web-form-handler.js          ✅ Web form API handler
├── test-full-report.js          ✅ End-to-end test script
├── sample-report.html           ✅ Generated sample report
├── sample-report.json           ✅ Generated sample JSON
├── README-MVP.md                ✅ Documentation
├── WORKFLOW-SUMMARY.md          ✅ Business overview
├── package.json                 ✅ Dependencies (axios, xml2js, playwright)
└── DEPLOYMENT-GUIDE.md          ✅ THIS FILE
```

### Due Diligence MVP Folder (Python Scrapers)
```
C:\Users\gstim\.openclaw\workspace\due-diligence-mvp\
├── napier_rates_extractor.py    ✅ Python rates scraper (MORE RELIABLE)
├── napier_full_scraper.py       ✅ Full council scraper
└── [many other Python scripts]  ⚠️ Legacy/experimental
```

### Website Folder (Deployment Target)
```
C:\Users\gstim\.openclaw\workspace\aidriven-website\
├── index-new.html               ✅ Landing page (SEO optimized)
├── SEO-CHECKLIST.md             ✅ SEO tasks
├── SEO-STRATEGY.md              ✅ Keyword strategy
└── [NEEDS: API handlers, report generator]
```

---

## 🎯 DEPLOYMENT ARCHITECTURE

### Cloudflare Pages (Static Frontend)
**Purpose:** Host landing page + generated reports  
**Source:** `aidriven-website/` folder  
**Files to deploy:**
- `index-new.html` → `/` (landing page)
- `reports/{reportId}/report.html` → Dynamic reports
- `reports/{reportId}/report.json` → Data downloads

### Cloudflare Workers (Serverless Backend)
**Purpose:** API endpoints for report generation  
**Functions needed:**

#### Worker 1: Report Generator (`report-worker`)
**Route:** `POST /api/generate-report`  
**Code source:** `web-form-handler.js` + `report-engine.js` + fetchers  
**Dependencies:** axios, xml2js  
**Environment variables:**
- `LINZ_API_KEY=b2e35aafd4e848e9b0265f1caf575255`
- `PYTHON_ENABLED=false` (Cloudflare doesn't support Python)

#### Worker 2: WhatsApp Webhook (`whatsapp-worker`)
**Route:** `POST /webhook/whatsapp`  
**Code source:** `whatsapp-webhook.js` + `report-engine.js`  
**Environment variables:**
- `WHATSAPP_ACCESS_TOKEN=...`
- `WHATSAPP_PHONE_NUMBER_ID=1200711009799782`
- `WHATSAPP_VERIFY_TOKEN=ai-driven-verify-2026`

---

## ⚠️ CRITICAL ISSUES TO SOLVE

### 1. Python Scraper Dependency
**Problem:** `napier_rates_extractor.py` works great but Cloudflare Workers **doesn't support Python**  
**Solutions:**

**Option A: Fix Node.js Rates Extractor** (RECOMMENDED)
- Debug timeout issues in `rates-extractor.js`
- Increase timeout, add retry logic
- Test against Napier Council website
- **Pros:** Pure JavaScript, works on Cloudflare
- **Cons:** Need to solve current timeout problems

**Option B: External Python Service** 
- Deploy Python scraper to separate service (Railway, Render, Fly.io)
- Call via HTTP API from Cloudflare Workers
- **Pros:** Keep working Python code
- **Cons:** Extra cost (~$5-20/mo), added complexity

**Option C: Static Rates Cache**
- Pre-scrape common Napier properties weekly
- Store in Cloudflare KV or JSON file
- **Pros:** No runtime scraping
- **Cons:** Data goes stale, limited coverage

**🎯 RECOMMENDATION:** Option A - Fix Node.js extractor tonight

### 2. Playwright Browser Automation
**Problem:** Playwright requires Chromium browser (heavy, ~200MB)  
**Cloudflare Limitation:** Workers have 50MB bundle size limit  
**Solution:** Use `@cloudflare/puppeteer` or switch to lighter HTTP scraping

### 3. File Storage
**Problem:** Reports need persistent storage  
**Solution:** Cloudflare KV (key-value store) or R2 (object storage)
- KV: Store JSON reports ($5/mo for 100K reads/day)
- R2: Store HTML reports ($0 for first 10GB/month)

---

## 🚀 DEPLOYMENT STEPS

### Phase 1: Consolidate Files (TONIGHT - 15 mins)

```powershell
# Create deployment structure
cd C:\Users\gstim\.openclaw\workspace
mkdir aidriven-website\api
mkdir aidriven-website\lib
mkdir aidriven-website\reports

# Copy core files
Copy-Item automation\whatsapp-property-report\linz-fetcher.js aidriven-website\lib\
Copy-Item automation\whatsapp-property-report\hazard-fetcher.js aidriven-website\lib\
Copy-Item automation\whatsapp-property-report\report-engine.js aidriven-website\api\
Copy-Item automation\whatsapp-property-report\web-form-handler.js aidriven-website\api\generate-report.js
Copy-Item automation\whatsapp-property-report\whatsapp-webhook.js aidriven-website\api\whatsapp-webhook.js

# Copy landing page (if not already there)
# Already in aidriven-website/index-new.html ✅
```

### Phase 2: Fix Node.js Rates Extractor (TONIGHT - 20 mins)
- Debug `rates-extractor.js` timeout
- Test against Napier Council
- Copy to `aidriven-website\lib\rates-extractor.js`

### Phase 3: Create Cloudflare Worker Scripts (TONIGHT - 30 mins)
- Adapt `web-form-handler.js` for Workers format
- Add Cloudflare KV binding for report storage
- Test locally with Wrangler CLI

### Phase 4: Deploy to Cloudflare (MONDAY - 30 mins)
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Initialize project
cd aidriven-website
wrangler init --name ai-driven-reports

# Configure wrangler.toml
# Deploy
wrangler pages deploy .
```

---

## 📋 CENTRALIZED STRUCTURE (Target)

```
C:\Users\gstim\.openclaw\workspace\aidriven-website\
│
├── index.html                    # Rename index-new.html → index.html
├── favicon.ico
├── assets/                       # CSS, JS, images
│   ├── styles.css
│   └── logo.svg
│
├── lib/                          # Shared libraries
│   ├── linz-fetcher.js
│   ├── hazard-fetcher.js
│   ├── rates-extractor.js        ← FIX THIS TONIGHT
│   └── report-generator.js       ← Combined report engine
│
├── api/                          # Cloudflare Workers
│   ├── generate-report.js        ← Web form handler
│   ├── whatsapp-webhook.js       ← WhatsApp handler
│   └── _routes.json              ← Cloudflare routing config
│
├── reports/                      # Generated reports (auto-created)
│   └── {reportId}/
│       ├── report.html
│       └── report.json
│
├── wrangler.toml                 # Cloudflare config
├── package.json                  # Dependencies
└── README.md                     # Deployment docs
```

---

## 🔧 IMMEDIATE ACTION PLAN

### Right Now (Next 30 mins):
1. ✅ Create centralized folder structure
2. ✅ Copy all working components to `aidriven-website/`
3. ✅ Fix Node.js rates extractor (debug timeout)
4. ✅ Test end-to-end from new location

### Tonight (Optional):
5. ⏳ Set up Cloudflare account (if not done)
6. ⏳ Install Wrangler CLI
7. ⏳ Create initial Worker deployment

### Monday Morning:
8. ⏳ Await HBRC email response
9. ⏳ Deploy landing page to Cloudflare Pages
10. ⏳ Deploy API Workers
11. ⏳ Connect aidriven.biz domain
12. ⏳ Test live with real WhatsApp message

---

## 💡 KEY INSIGHT

**Don't wait for perfection!** We can:
- Deploy with manual HBRC verification links (working now)
- Add HBRC automation later when API access approved
- Start with Node.js rates extractor (fix bugs live)
- Iterate based on real user feedback

**MVP = Minimum VIABLE Product**, not perfect product. Launch, learn, improve! 🚀

---

**Shall I consolidate everything into `aidriven-website/` right now?** This will take ~10 mins and get us deployment-ready!
