# AI Driven - Property Due Diligence Reports

**Website:** https://aidriven.biz  
**Status:** 🟡 MVP Ready for Beta Testing  
**Last Updated:** 2026-08-16

---

## 🚀 Quick Start

### Local Development
```bash
cd C:\Users\gstim\.openclaw\workspace\aidriven-website
npm install
npm start
```

### Test Report Generation
```bash
node api/generate-report.js
```

---

## 📁 Project Structure

```
aidriven-website/
├── index.html                    # Landing page (SEO optimized)
├── package.json                  # Dependencies
├── wrangler.toml                 # Cloudflare Workers config
│
├── lib/                          # Shared libraries
│   ├── linz-fetcher.js           # LINZ WFS API client
│   ├── hazard-fetcher.js         # HBRC + Cyclone Gabrielle hazards
│   └── rates-extractor.js        # Napier Council rates scraper
│
├── api/                          # Cloudflare Workers (serverless functions)
│   ├── generate-report.js        # POST /api/generate-report
│   ├── whatsapp-webhook.js       # POST /webhook/whatsapp
│   └── _routes.json              # Cloudflare routing config
│
└── reports/                      # Generated reports (auto-created)
    └── {reportId}/
        ├── report.html           # Viewable report
        └── report.json           # Structured data
```

---

## 🔌 API Endpoints

### Generate Report (Web Form)
**Endpoint:** `POST /api/generate-report`  
**Body:**
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
  "viewUrl": "/reports/RPT-1786870256803/report.html",
  "downloadUrl": "/reports/RPT-1786870256803/report.json"
}
```

### WhatsApp Webhook
**Endpoint:** `POST /webhook/whatsapp`  
**Purpose:** Receive Meta WhatsApp messages  
**Auth:** Verified via `WHATSAPP_VERIFY_TOKEN`

---

## ☁️ Deploy to Cloudflare

### Prerequisites
1. Cloudflare account (free tier works)
2. Domain connected to Cloudflare (aidriven.biz)
3. Node.js 18+ installed

### Installation
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to project
cd C:\Users\gstim\.openclaw\workspace\aidriven-website

# Initialize (if first time)
wrangler init --name ai-driven-reports
```

### Set Secrets
```bash
wrangler secret put WHATSAPP_ACCESS_TOKEN
wrangler secret put WHATSAPP_PHONE_NUMBER_ID
wrangler secret put WHATSAPP_VERIFY_TOKEN
```

### Deploy
```bash
# Deploy to Cloudflare Pages
wrangler pages deploy .

# Or deploy Workers
wrangler deploy
```

### Custom Domain
In Cloudflare Dashboard:
1. Go to Workers & Pages → ai-driven-reports
2. Settings → Custom Domains
3. Add `aidriven.biz` and `www.aidriven.biz`

---

## 📊 Data Sources

### LINZ Data Service
- **API:** WFS 2.0
- **Key:** `b2e35aafd4e848e9b0265f1caf575255`
- **Layers:** Parcels (51571), Title Estate (52068), Gabrielle Flood (112668)
- **Status:** ✅ Working

### HBRC Hazards
- **API:** ArcGIS REST
- **URL:** https://gis.hbrc.govt.nz/server/rest/services/HazardPortal
- **Status:** 🔴 Firewall blocked (awaiting API access)
- **Workaround:** Manual verification links in reports

### Napier City Council Rates
- **Method:** Browser automation (Playwright)
- **URL:** https://www.napier.govt.nz/services/properties-and-rates/my-property/?rid={RID}
- **Status:** ✅ Working (Python version more reliable)

---

## 💰 Pricing

| Tier | Price | Features | Status |
|------|-------|----------|--------|
| **Basic** | $49-79 | CV, Land Value, Annual Rates, Gabrielle check | Planned |
| **Standard** | $149 | Full rates breakdown + all Basic features | **MVP Launch** |
| **Premium** | $299+ | Historical trends + full HBRC automation | Planned |

---

## 🐛 Known Issues

1. **HBRC API Blocked** - Awaiting firewall whitelist approval
2. **Rates Extractor Timeout** - Node.js version sometimes times out (use Python fallback)
3. **LINZ WFS 400 Errors** - Occasional bad requests (retry logic needed)

See `DEPLOYMENT-GUIDE.md` in `automation/whatsapp-property-report/` for details.

---

## 📞 Support

**Email:** gerhard@aidriven.biz  
**WhatsApp:** +27 66 027 8366  

---

## 📝 License

Proprietary - AI Driven © 2026
