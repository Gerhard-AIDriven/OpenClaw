# Due Diligence Platform — Priority TODO List

**Last Updated:** 2026-08-16 14:55 GMT+2  
**Status:** 🔴 = Critical | 🟡 = Important | 🟢 = Nice to Have  
**🎉 BIG NEWS:** LINZ WFS Integration SOLVED!

---

## 🚀 BREAKTHROUGH UPDATE (2026-08-16 Afternoon)

### ✅ LINZ WFS Integration: WORKING!

**What we achieved:**
- Discovered correct WFS authentication method (path parameter format)
- Successfully retrieved WFS Capabilities document
- Identified key property data layers
- **Tested GetFeature requests — getting real data!**

**Working endpoint:**
```
https://data.linz.govt.nz/services;key=b2e35aafd4e848e9b0265f1caf575255/wfs
```

**Key layers identified & tested:**
1. ✅ **NZ Parcels** (layer-51571) - Legal descriptions, boundaries, areas
   - Sample: "Part Town Section 487 Napier", 905 m², Hawkes Bay district
2. ✅ **Title Estate** (table-52068) - Ownership data
   - Sample: Title 747475, FSIM type, 1/24 share
3. **Title-Parcel Association** (table-51569) - Links titles to parcels

**Next step:** Implement `linz-fetcher.js` with working endpoint

---

## 🔴 CRITICAL (This Week) — Implementation Focus

### 1. LINZ WFS Implementation ⏩ READY TO CODE
**Owner:** Seb  
**Timeline:** Today/Tomorrow  
**Priority:** 🔴 BLOCKER REMOVED!

**What's needed:**
- [x] Gerhard researched LINZ Data Service at office ✅
- [x] Found correct WFS endpoint URL ✅
- [x] Identified authentication method (path parameter) ✅
- [x] Got layer names for property titles ✅
- [x] Tested GetCapabilities request ✅
- [x] Tested GetFeature on NZ Parcels ✅
- [x] Tested GetFeature on Title Estate ✅
- [ ] **Seb implements working LINZ fetcher**
  - Rewrite `linz-fetcher.js` with correct endpoint
  - Test on real properties (Napier addresses)
  - Integrate with report engine
  - Handle edge cases (multiple titles, unit titles)

**Files to update:**
- `automation/whatsapp-property-report/linz-fetcher.js` ← MAIN TASK
- `automation/whatsapp-property-report/report-engine.js`
- `automation/whatsapp-property-report/LINZ-WFS-RESEARCH.md` ← Already updated

**Documentation:** See `LINZ-WFS-RESEARCH.md` for full details and sample requests

---

### 2. Council Hazard Data (Liquefaction + Flood)
**Owner:** Seb (research) → Gerhard (decision) → Seb (implementation)  
**Timeline:** This week  
**Priority:** 🔴 CRITICAL

**What's needed:**
- [ ] Research Napier City Council GIS layers
  - Liquefaction susceptibility maps
  - Flood hazard zones
  - Zoning districts
- [ ] Research Hawke's Bay Regional Council
  - River flood maps
  - Surface water flooding
  - Environmental hazards
- [ ] Research GNS Science data
  - National liquefaction maps
  - Earthquake hazard layers
- [ ] Decide integration approach:
  - Option A: Direct API/WMS access (best)
  - Option B: Web scraping (fallback)
  - Option C: Manual lookup template (immediate)
- [ ] Implement hazard fetcher module

**Files to create:**
- `automation/whatsapp-property-report/hazard-fetcher.js`
- `automation/whatsapp-property-report/council-scraper.js` (enhanced)

**Blocker:** None — ready to start research

---

### 3. Rates Data Enhancement
**Owner:** Seb  
**Timeline:** After LINZ + Hazards complete  
**Priority:** 🔴 IMPORTANT

**Current status:** ✅ Scraper works (built Aug 8)  
**What's needed:**
- [ ] Test existing scraper still works
- [ ] Add full rates breakdown extraction (water, waste, stormwater, etc.)
- [ ] Integrate with report engine
- [ ] Optional: Set up cron job for regular updates

**Files to use:**
- `due-diligence-mvp/napier_full_scraper.py` (already exists)
- `due-diligence-mvp/napier_rates_extractor.py` (already exists)

---

## 🟡 IMPORTANT (Next Week)

### 4. Interactive Map Integration
**Owner:** Seb  
**Timeline:** Week of Aug 19  
**Priority:** 🟡 IMPORTANT

**What's needed:**
- [ ] Design map component (Leaflet vs. embedded council viewer)
- [ ] Integrate hazard overlay layers
- [ ] Add property boundary display
- [ ] Test on sample properties

**Files to create:**
- `whatsapp/interactive-map.html`
- Update `whatsapp/report-template-v3.js`

---

### 5. Payment Gateway Setup
**Owner:** Gerhard (decision) → Seb (implementation)  
**Timeline:** Week of Aug 19  
**Priority:** 🟡 IMPORTANT

**Decision needed:** Choose provider
- Stripe (recommended — easiest for NZ)
- PayFast (SA/NZ cross-border)
- Crypto (BTC/USDT)

**What's needed:**
- [ ] Gerhard chooses provider
- [ ] Seb builds integration
- [ ] Test payment flow
- [ ] Connect to report delivery (release PDF after payment)

---

### 6. Website Front Page Deployment
**Owner:** Gerhard (review) → Seb (deploy)  
**Timeline:** This week  
**Priority:** 🟡 IMPORTANT

**Current status:** ✅ New landing page designed (`index-new.html`)

**What's needed:**
- [ ] Gerhard reviews design
- [ ] Deploy as new homepage
- [ ] Set up email capture backend (Google Sheet recommended)
- [ ] Create og-image.jpg for social sharing
- [ ] Compress images (logo.png, profile photo)
- [ ] Submit to Google Search Console
- [ ] Create Google Business Profile

**SEO:** ✅ Already optimized in index-new.html

---

### 7. Sample Report PDF
**Owner:** Seb  
**Timeline:** This week  
**Priority:** 🟡 IMPORTANT

**What's needed:**
- [ ] Generate polished sample report (with real LINZ data!)
- [ ] Remove customer-specific info
- [ ] Export as PDF
- [ ] Upload to website
- [ ] Link from front page "View Sample" button

---

## 🟢 NICE TO HAVE (Month 2)

### 8. Multi-Council Support
**Owner:** Seb  
**Timeline:** After beta validation  
**Priority:** 🟢 NICE TO HAVE

**What's needed:**
- [ ] Hastings District Council scraper
- [ ] Central Hawke's Bay scraper
- [ ] Auto-detect council from address
- [ ] Batch processing capability

---

### 9. Blog Content Strategy
**Owner:** Seb (writing)  
**Timeline:** Ongoing from Week 3  
**Priority:** 🟢 NICE TO HAVE

**First 4 posts:**
1. "What is Property Due Diligence? A NZ Buyer's Guide"
2. "LIM Report vs Property Due Diligence: What's the Difference?"
3. "Understanding Liquefaction Risk in Napier [2026 Guide]"
4. "Hawke's Bay Flood Zones: Maps & History"

**Goal:** Drive organic traffic, build authority

---

### 10. Customer Reviews System
**Owner:** Seb  
**Timeline:** After first paying customers  
**Priority:** 🟢 NICE TO HAVE

**What's needed:**
- [ ] Collect testimonials from beta testers
- [ ] Add review schema markup
- [ ] Display on website
- [ ] Google Business Profile reviews

---

## 📊 Current Blockers

| Blocker | Owner | Status | Resolution Needed By |
|---------|-------|--------|---------------------|
| LINZ WFS endpoint/auth details | Gerhard | ✅ SOLVED | N/A |
| LINZ fetcher implementation | Seb | 🔄 IN PROGRESS | Tomorrow |
| Council GIS layer URLs | Seb | ⏳ PENDING | This week |
| Payment provider choice | Gerhard | ⏳ PENDING | Next week |
| Front page deployment decision | Gerhard | ⏳ PENDING | This week |
| Launch strategy (manual vs. automated) | Gerhard | ⏳ PENDING | This week |

---

## 🎯 Success Metrics (End of Week 1)

- [x] ✅ LINZ WFS authentication solved
- [x] ✅ LINZ title data tested successfully
- [ ] 🔄 LINZ fetcher implemented (in progress)
- [ ] ⏳ Liquefaction hazard data integrated
- [ ] ⏳ Flood risk data integrated
- [ ] ⏳ Rates data tested & working
- [ ] ⏳ Front page deployed with email capture
- [ ] ⏳ First 10 email signups
- [ ] ⏳ Sample PDF report ready
- [ ] ⏳ Beta launch date confirmed

---

## 📞 Heartbeat Reminder Schedule

**Trigger:** Every heartbeat poll (2-hourly, 6am-6pm)

**Reminder content:**
```
🎯 DUE DILIGENCE TODO REMINDER

🎉 BREAKTHROUGH: LINZ WFS integration working! Real data flowing!

CRITICAL THIS WEEK:
1. LINZ Implementation (Seb) — Build linz-fetcher.js with working endpoint
2. Council Hazards (Seb researching) — Liquefaction + flood maps for Napier/HB
3. Rates Testing (Seb) — Verify existing scraper works

NEXT UP:
- Payment gateway decision (Stripe recommended)
- Front page deployment (index-new.html ready)
- Sample PDF report generation

BLOCKERS:
- None on LINZ anymore! 🎉
- Waiting: Council GIS layer research

Want to update priorities or mark items complete? Just say so!
```

---

*Priority list by Seb | AI Driven | 2026-08-16 14:55*
