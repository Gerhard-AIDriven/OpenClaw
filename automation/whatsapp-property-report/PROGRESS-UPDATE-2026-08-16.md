# Due Diligence Platform — Progress Update

**Date:** 2026-08-16  
**Session:** Morning research + design work  
**Status:** Foundation laid, ready for Gerhard's LINZ research

---

## ✅ Completed This Session

### 1. **Research Documentation Created**

#### LINZ WFS Integration (`LINZ-WFS-RESEARCH.md`)
- Documented current API key: `b2e35aafd4e848e9b0265f1caf575255`
- Confirmed WFS endpoint exists at `/services/wfs` (returns 401 = needs auth)
- Tested multiple authentication methods (all failed with 401)
- Identified OGC WFS standard request formats
- Listed next steps for Gerhard to research at office

**Key Finding:** The WFS endpoint is there but we need the correct auth method. Gerhard will investigate at office.

#### Council GIS Integration (`COUNCIL-GIS-RESEARCH.md`)
- Defined data requirements: liquefaction, flood, rates, interactive maps
- Identified potential sources:
  - Napier City Council GIS
  - Hastings District Council GIS
  - Hawke's Bay Regional Council (flood maps)
  - GNS Science (hazards)
  - LINZ base layers
- Outlined technical approaches:
  - Option A: Direct API/WMS access (best)
  - Option B: Web scraping (fallback)
  - Option C: Manual lookup (immediate launch)
  - Option D: Hybrid (recommended)

**Strategy:** Start with manual lookup for immediate launch, build automation in parallel.

---

### 2. **Website Front Page Designed**

Created `aidriven-website/index-new.html` — professional "Coming Soon" landing page:

**Features:**
- ✅ Modern dark theme with AI Driven branding (orange/purple gradients)
- ✅ "Coming Soon" badge with subtle animation
- ✅ Compelling hero section with value proposition
- ✅ Email capture form for launch notifications
  - Collects: name, email, interest category
  - Offers: founding member 50% discount, free sample report
- ✅ Features preview grid (6 key benefits)
- ✅ About section with Gerhard's story + photo
- ✅ Professional footer with contact info
- ✅ Mobile responsive design
- ✅ Success message on form submission

**Design Philosophy:**
- Builds anticipation (not apologetic about being in startup mode)
- Clear value prop from first screen
- Captures early interest (email list building)
- Professional enough to instill confidence
- Honest about timeline ("Coming Soon")

**Next Steps for Website:**
1. Review design with Gerhard
2. Replace current `index.html` with new version (or A/B test)
3. Integrate form submission backend (Google Sheets? Email? CRM?)
4. Add link to sample report PDF once generated
5. Consider adding FAQ section

---

### 3. **Existing Skills Audit**

Found highly relevant skills in workspace:

#### `napier-lim-browser-automation`
- Automates Napier Council LIM application via browser
- Fills property search, contact details, options
- Stops before payment (manual completion)
- **Relevance:** Shows we can automate council interactions

#### `napier-lim-submission`
- Collects LIM data via conversational interface
- Submits to local real estate API
- Stores confirmation JSON
- **Relevance:** Pattern for our due diligence intake

#### `real-estate-query`
- Queries local property database API
- Returns listings based on natural language
- **Relevance:** Database interaction pattern

**Insight:** We have proven patterns for:
- Browser automation of council systems
- Conversational data collection
- API integration with property databases

These skills demonstrate technical capability that transfers directly to the due diligence platform.

---

## 📋 Current File Structure

```
workspace/
├── aidriven-website/
│   ├── index.html (current live version)
│   ├── index-new.html ✨ NEW: Coming Soon landing page
│   ├── logo.png
│   ├── GWS Profile pic - small.jpg
│   └── reports/ (generated test reports)
│
├── automation/whatsapp-property-report/
│   ├── report-engine.js (unified engine)
│   ├── linz-fetcher.js (needs WFS fix)
│   ├── council-scraper.js (needs enhancement)
│   ├── oneroof-fetcher.js (placeholder)
│   ├── test-engine.js
│   ├── PRODUCTION-READY.md ✅
│   ├── LINZ-WFS-RESEARCH.md ✨ NEW
│   └── COUNCIL-GIS-RESEARCH.md ✨ NEW
│
├── whatsapp/
│   ├── poll-whatsapp-requests-v3.js (active cron job)
│   ├── worker-v3-conversational.js
│   ├── report-template-v2.js
│   └── ...
│
├── due-diligence-mvp/
│   ├── index.html (MVP demo page)
│   └── config/linz-api-key.txt
│
└── skills/
    ├── napier-lim-browser-automation/
    ├── napier-lim-submission/
    └── real-estate-query/
```

---

## 🎯 What's Waiting on Gerhard

### 1. **LINZ WFS Research (At Office)**
When you're on the LINZ Data Service site:

**Look for:**
- WFS endpoint URL (probably `/services/wfs` or `/geoserver/...`)
- Authentication method (API key format, OAuth, Basic Auth?)
- Available layer names (typeNames for GetFeature requests)
- Example GetFeature queries
- Filter syntax (CQL_FILTER, bbox, etc.)

**Quick Test URL** (replace `***` with your actual key):
```
https://data.linz.govt.nz/services/wfs?service=WFS&version=2.0.0&request=GetCapabilities&key=***
```

If it works, you'll see XML with all available layers. Screenshot or copy that!

---

## 🔍 Next Research Tasks (I Can Do Autonomously)

While you're at work, I can investigate:

### 1. **Napier City Council GIS**
- Search for interactive map viewer
- Look for WMS/WFS endpoints
- Check for property search by address
- Find liquefaction/flood hazard layers

### 2. **Hastings District Council**
- Same approach as Napier

### 3. **Hawke's Bay Regional Council**
- Focus on flood maps
- Environmental hazard layers
- May have best open data portal

### 4. **GNS Science Hazards**
- Liquefaction susceptibility maps
- Downloadable datasets
- WMS services

### 5. **Payment Gateway Options**
- Stripe (NZ support, easy integration)
- PayFast (SA/NZ cross-border)
- Crypto options (BTC, USDT)
- Compare fees, setup time, complexity

---

## 💡 Strategic Recommendations

### Immediate Launch Path (This Week)
1. **Manual LINZ lookup** (~2 min per property)
   - You look up title data on LINZ website
   - System auto-generates rest of report
   - Launch with real data, not demo fallback

2. **Launch notification page goes live**
   - Start building email list immediately
   - Founding member discounts create urgency
   - Gauge interest before full launch

3. **Test with friendly users**
   - 3-5 beta testers (friends, colleagues)
   - Real properties, real decisions
   - Collect feedback, iterate quickly

### Full Automation Path (2-4 Weeks)
1. LINZ WFS integration working
2. Council hazard data automated
3. Rates scraping functional
4. Interactive maps embedded
5. Payment gateway integrated
6. Full self-service flow

**Recommendation:** Do both in parallel. Launch manual now, automate as we go.

---

## 📊 Priority Matrix

| Feature | Impact | Effort | Priority | Timeline |
|---|---|---|---|---|
| LINZ WFS Integration | High | Medium | 🔴 HIGH | Pending your research |
| Council Liquefaction Data | High | Medium-High | 🔴 HIGH | This week |
| Rates + Services Breakdown | High | Medium | 🔴 HIGH | This week |
| Payment Gateway | High | Low-Medium | 🟡 MEDIUM | Next week |
| Interactive Map Embed | Medium-High | Medium | 🟡 MEDIUM | Next week |
| Website Front Page | Medium | Low (done!) | 🟢 DONE | Ready to deploy |
| Email Capture Backend | Medium | Low | 🟡 MEDIUM | This week |

---

## 🎬 Action Items for When You're Back

### Quick Wins (30-60 min)
1. Review new front page design (`index-new.html`)
2. Decide: replace current or keep MVP page?
3. Set up email capture backend (Google Sheet? Formspree?)
4. Generate one sample PDF report for the "View Sample" button

### Medium Tasks (2-4 hours)
1. Implement LINZ WFS integration (once you have specs)
2. Research council GIS endpoints
3. Build rates scraper for one council (test case)
4. Design interactive map component

### Strategic Decisions
1. Launch timing: ASAP (manual) vs. wait (automated)?
2. Payment provider choice: Stripe vs. PayFast vs. crypto?
3. Pricing validation: $75/$125/$200 or adjust?
4. Target audience focus: investors vs. homebuyers vs. professionals?

---

## 🧠 Key Insights from Today

1. **We're closer than it feels** — the core engine works, we just need better data sources
2. **Manual launch is viable** — 2 min per property is sustainable for early customers
3. **Existing skills prove capability** — we've automated council systems before
4. **Front page builds credibility** — professional design reduces "startup risk" perception
5. **Email list = validation** — if people sign up, we know there's demand

---

## 📞 Questions for Gerhard

When you're back from work:

1. **LINZ Research:** What did you find? Endpoint URL? Auth method? Layer names?
2. **Council Priorities:** Which council should I research first (Napier, Hastings, HBRC)?
3. **Front Page:** Keep the new design or stick with MVP page?
4. **Launch Strategy:** Manual launch this week, or wait for full automation?
5. **Payment Preference:** Stripe (easiest), PayFast (SA-friendly), or crypto?

---

*Progress update by Seb | AI Driven | 2026-08-16 05:57*
