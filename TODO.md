# TODO List - AI Driven

## 🚀 High Priority

### 1. Early Access Form - NOT CONNECTED
- **Issue:** "Get Early Access" form on website homepage logs to console only - data goes nowhere
- **Location:** `aidriven-website/index.html` line ~959
- **Solution needed:** Connect to storage (Google Sheet, email list, or CRM)
- **Options:**
  - [ ] Create Google Form → Google Sheet for early access signups
  - [ ] Use Mailchimp/ConvertKit for email list
  - [ ] Simple Google Apps Script to email Gerhard each signup
- **Status:** ⏸️ Paused - needs decision on approach

---

### 2. Property Request Form - Disable Beta Features
- **Issue:** Form offers features not yet built (confusing for beta users)
- **Disable for Beta:**
  - [ ] "Additional property comparison +$50/property"
  - [ ] "Body corporate review +$77$"
  - [ ] "Rush delivery (15 minutes) +$25" *(unless you can actually deliver)*
- **Keep Active:**
  - ✅ Basic report (LINZ + Hazards) - automated
  - ✅ Rates Information - manual (24-48h)
  - ✅ Council Fees & Permits - manual (24-48h)
- **Status:** ⏸️ Paused - edit Google Form when ready

---

## 🧪 Testing Checklist - Full Report Generation

### Automated Basic Report Flow
- [ ] **Submit form** with Basic package only (no add-ons)
- [ ] **Verify webhook** receives payload correctly
- [ ] **Check KV storage** - request queued with correct status
- [ ] **OpenClaw cron job** polls and picks up request
- [ ] **LINZ API call** - title search executes successfully
- [ ] **Hazards API call** - flood/liquefaction data retrieved
- [ ] **PDF generation** - report compiles correctly
- [ ] **Web hosting** - report uploaded to public URL
- [ ] **Customer email** - acknowledgment sent with report link
- [ ] **WhatsApp message** - customer notified with link
- [ ] **KV status update** - marked as "delivered"
- [ ] **Timeline** - completed within 15-60 minutes

### Manual Processing Flow (Rates/Council Fees)
- [ ] **Submit form** with "Rates Information" add-on
- [ ] **Verify requiresManualProcessing** flag set to true
- [ ] **Customer email** - acknowledgment sent (mentions 24-48h delay)
- [ ] **Gerhard notification** - email received with request details
- [ ] **KV storage** - request queued under `manual:` prefix
- [ ] **Polling** - OpenClaw detects manual request
- [ ] **Manual intervention** - Gerhard processes rates lookup
- [ ] **Report update** - manual data added to report
- [ ] **PDF regeneration** - updated report generated
- [ ] **Customer email** - final report sent
- [ ] **WhatsApp message** - customer notified
- [ ] **KV status update** - marked as "delivered_manual"
- [ ] **Timeline** - completed within 24-48 hours

### Edge Cases & Error Handling
- [ ] **Invalid email address** - form validation catches it
- [ ] **Missing phone number** - graceful handling
- [ ] **API rate limits** - LINZ/Hazards throttling handled
- [ ] **Cloudflare Worker timeout** - retry logic works
- [ ] **Mailgun failure** - error logged, notification sent
- [ ] **Duplicate submissions** - prevented or handled
- [ ] **Weekend/holiday submissions** - manual queue holds until business hours

### Integration Points
- [ ] **Google Form → Cloudflare Worker** - payload structure correct
- [ ] **Worker → KV Storage** - data persists correctly
- [ ] **OpenClaw Cron → Worker Poll** - authentication works
- [ ] **Worker → Mailgun** - emails send successfully
- [ ] **Worker → WhatsApp API** - messages delivered
- [ ] **PDF Hosting** - URLs accessible publicly

---

## 📋 Other Notes

### Completed ✅
- Fixed Google Apps Script column mapping (email was reading wrong column)
- Re-enabled WhatsApp polling cron job (`6c924c8b-6adb-49c8-95bd-8400554c0b7f`)
- Removed redundant "delivery speed" question from form Section 2
- Manual processing queue working end-to-end (tested 2026-08-20)

### On Hold ⏸️
- Early Access form backend connection
- Beta feature pruning in Google Form
- Rush delivery feasibility check

---

_Last updated: 2026-08-20 07:52_
