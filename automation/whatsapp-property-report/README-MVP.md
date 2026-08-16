# AI Driven - Property Due Diligence MVP

**Status:** 🟡 READY FOR BETA TESTING (Standard Tier - $149 NZD)  
**Date:** 2026-08-16  
**MVP Readiness:** 85% (HBRC automation pending API access)

---

## 🎯 What's Working NOW

### ✅ Automated Components
1. **LINZ Parcel & Title Data** - WFS API integration
2. **Cyclone Gabrielle Flood Detection** - LINZ Layer 112668
3. **Napier Council Rates Extraction** - Python scraper (Playwright)
4. **Report Engine** - JSON + HTML generation
5. **WhatsApp Webhook** - Meta API integration ready
6. **Web Form Handler** - Express API endpoint

### ⏳ Manual Components (Pending HBRC API Access)
1. **Liquefaction Assessment** - Manual verification via HBRC map links
2. **Flood Zone Classification** - Manual verification via HBRC map links
3. **Coastal Hazard Zones** - Manual verification via HBRC map links
4. **Tsunami Evacuation Zones** - Manual verification via HBRC map links

**Workaround:** Reports include clickable HBRC map links centered on property coordinates.

---

## 📊 Report Tiers

### **Standard Tier - $149 NZD** (MVP Launch Tier)

**Includes:**
- ✅ LINZ parcel identification & legal description
- ✅ Title estate data (when available)
- ✅ Cyclone Gabrielle flood impact assessment
- ✅ Napier Council rates breakdown (if RID provided):
  - Capital Value
  - Land Value
  - Improvements Value
  - Annual Rates Total
  - Full services breakdown (General Rate, UAGC, Water, Stormwater, Fire, Refuse, Sewerage, Transportation, Recycling, Resilience)
- ✅ HBRC manual verification links (clickable maps)
- ✅ Professional HTML report (PDF-ready)

**Delivery:** 
- WhatsApp: Summary + report link
- Web: Direct HTML view + JSON download

---

## 🚀 Quick Start

### Prerequisites
```bash
cd C:\Users\gstim\.openclaw\workspace\automation\whatsapp-property-report
npm install
```

### Test Full Report Generation
```bash
node test-full-report.js
```

This generates:
- `sample-report.json` - Complete structured data
- `sample-report.html` - Professional formatted report

Open `sample-report.html` in browser to preview.

---

## 🔌 Integration Endpoints

### WhatsApp Webhook

**File:** `whatsapp-webhook.js`  
**Port:** 3000  
**Endpoint:** `POST /webhook/whatsapp`

**Setup:**
1. Set environment variables:
   ```bash
   $env:WHATSAPP_VERIFY_TOKEN="ai-driven-verify-2026"
   $env:WHATSAPP_ACCESS_TOKEN="your-meta-access-token"
   $env:WHATSAPP_PHONE_NUMBER_ID="1200711009799782"
   ```

2. Start server:
   ```bash
   node whatsapp-webhook.js
   ```

3. Configure Meta webhook URL:
   ```
   https://your-domain.com/webhook/whatsapp
   ```

**Message Format:**
```
Address: 18 Ferguson Avenue, Napier
RID: 138159-107977
Coords: -39.4928, 176.9120
```

**Response:**
- "Generating report..." message
- Summary with risk rating, CV, rates
- Link to full HTML report

---

### Web Form Handler

**File:** `web-form-handler.js`  
**Port:** 3001  
**Endpoint:** `POST /api/generate-report`

**Request:**
```json
{
  "address": "18 Ferguson Avenue, Napier",
  "lat": -39.4928,
  "lon": 176.9120,
  "rid": "138159-107977",
  "email": "customer@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "RPT-1786870256803",
  "tier": "STANDARD",
  "price": "NZD $149",
  "summary": {
    "address": "18 Ferguson Avenue, Napier",
    "riskRating": "High",
    "gabrielleAffected": true,
    "ratesAvailable": true
  },
  "viewUrl": "https://aidriven.biz/reports/RPT-1786870256803/report.html",
  "downloadUrl": "https://aidriven.biz/reports/RPT-1786870256803/report.json"
}
```

**Start server:**
```bash
node web-form-handler.js
```

---

## 📁 File Structure

```
automation/whatsapp-property-report/
├── linz-fetcher.js              # LINZ WFS parcel/title fetcher
├── hazard-fetcher.js            # HBRC + LINZ hazard data (Gabrielle working, HBRC blocked)
├── rates-extractor.js           # Node.js rates extractor (Playwright - currently timing out)
├── report-engine.js             # Main report orchestration
├── whatsapp-webhook.js          # WhatsApp Meta API handler
├── web-form-handler.js          # Web form API endpoint
├── test-full-report.js          # End-to-end test script
├── sample-report.html           # Generated sample report
├── sample-report.json           # Generated sample JSON
└── README-MVP.md                # This file
```

---

## 🐛 Known Issues

### 1. HBRC API Firewall Block
**Issue:** All HBRC ArcGIS REST API calls timeout (ETIMEDOUT)  
**Cause:** Firewall blocking external HTTPS access to port 443  
**Status:** Email sent to HBRC GIS team - awaiting response  
**Workaround:** Manual verification links included in reports  

### 2. Napier Council Website Timeout
**Issue:** Playwright scraper sometimes times out (30s)  
**Cause:** Council website slow or rate-limiting automated requests  
**Workaround:** Python scraper works more reliably than Node.js version  

### 3. LINZ WFS 400 Errors
**Issue:** Occasional 400 Bad Request from LINZ WFS  
**Cause:** Query parameter formatting issues  
**Status:** Needs debugging of WFS GetFeature request  

---

## 🎯 Next Steps

### Immediate (Today)
- [x] Generate first complete sample report ✅
- [ ] Fix LINZ WFS 400 error
- [ ] Test WhatsApp webhook with real Meta account
- [ ] Deploy web form handler to Cloudflare Workers

### Short-term (This Week)
- [ ] Await HBRC API access approval
- [ ] Integrate HBRC layers once unblocked
- [ ] Add PDF generation (html-pdf or Puppeteer)
- [ ] Set up Cloudflare Pages hosting
- [ ] Connect domain (aidriven.biz)

### Medium-term (Next Week)
- [ ] Implement payment gateway (Stripe/PayPal)
- [ ] Add user authentication
- [ ] Build report history/dashboard
- [ ] Create marketing landing page
- [ ] Soft launch beta (5-10 test users)

---

## 💰 Pricing Strategy

| Tier | Price | Features | Target Customer |
|------|-------|----------|-----------------|
| **Basic** | $49-79 | CV, Land Value, Annual Rates, Gabrielle check | Quick pre-auction checks |
| **Standard** | $149-199 | Full rates breakdown, all Basic features + HBRC manual links | **MVP Launch Tier** - Serious buyers |
| **Premium** | $299+ | Historical trends, comparables, enhanced hazards (once HBRC automated) | Investors, due diligence firms |

**MVP Focus:** Standard tier only ($149) until HBRC automation complete.

---

## 📞 Support

**Email:** gerhard@aidriven.biz  
**WhatsApp:** +27 66 027 8366  
**Website:** https://aidriven.biz

---

## 📝 License

Proprietary - AI Driven © 2026
