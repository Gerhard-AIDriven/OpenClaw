# PROJECT STATUS: AI Driven Due Diligence System
# Date: 2026-08-22 | Status: Beta Functional / Polish Needed

## ✅ COMPLETED & VERIFIED
- **Structured Data Flow:** Google Form → Apps Script → Cloudflare Worker is now correctly passing structured address fields (House No, Street, Suburb, etc.).
- **Mailgun Confirmation:** Confirmation emails are now sending successfully (Basic Auth + Hardcoded API key fix deployed to Worker).
- **Geocoding Accuracy:** Fixed the a major bug where reports defaulted to a random coordinate. The system now uses structured LINZ matching to place the pin on the exact property.
- **Report Delivery:** End-to-end pipeline (Form → Worker → OpenClaw Cron → Report → Email) is fully functional.

## 🛠️ PENDING FIXES (For Tomorrow Morning)

### 1. Branding & UI (Cosmetic)
- [ ] **Email Template:** The report notification email still uses the old green/white theme. Needs update to the "AI Driven" dark theme (Gold/Purple gradients, Rajdhani font).
- [ ] **Map Frame:** Reduce the report map height by 20% for better layout.
- [ ] **Hazards Activation:** Liquefaction, Flood, and Erosion map links/layers need to be activated in the interactive map.

### 2. Data Depth (Value Add)
- [ ] **Title & Easements:** LINZ API returns title data, but it's not yet fully parsed/displayed in the report.
- [ ] **Rates Integration:** Implement the manual upload/entry workflow for Council Rates information.

## 🔑 CRITICAL CONFIGURATIONS (For reference)
- **Worker URL:** `https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev`
- **Email Domain:** `mg.aidriven.biz`
- **LINZ API:** WFS API with CQL filters (implemented in `linz-api.js`)
- **Token:** `aidriv_poll_secret_2026_xK9mP` (used by poll script)

## 🚀 NEXT STEPS FOR SEB (Tomorrow)
1. Update `poll-automated-reports-v2.js` with the finalized branded HTML email template.
2. Edit `report-engine-v2.js` to reduce map size and activate hazards layers.
3. Enhance LINZ data parsing in `report-engine-v2.js` to extract and display Title/Easement details.
4. Create the "Manual Rates" data entry process.
