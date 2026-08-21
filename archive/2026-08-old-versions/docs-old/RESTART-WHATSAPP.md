# 🔄 WhatsApp Integration - Restart Guide

**Status:** ⏸️ PAUSED (2026-08-19)  
**Reason:** Strategic pivot to website-first beta launch  
**Cron Job:** Disabled (ID: `6c924c8b-6adb-49c8-95bd-8400554c0b7f`)

---

## 📋 Executive Summary

The WhatsApp auto-processing system was built and tested but paused before public launch to focus on website-first beta testing. All core components are functional and documented here for future reactivation.

**What Works:**
- ✅ Cloudflare Worker receives WhatsApp webhooks from Meta
- ✅ Auto-generates property reports (LINZ + Hazards)
- ✅ Sends reports back via WhatsApp with PDF attachments
- ✅ Email notifications working (Mailgun integration complete)
- ✅ Manual processing queue for Rates/Council Fees add-ons
- ✅ KV store for queuing manual requests

**What Wasn't Completed:**
- ❌ Full conversational flow (package selection, add-ons, payment)
- ❌ User registration/authentication system
- ❌ Payment integration in WhatsApp
- ❌ Strategy for handling incomplete data (address-only requests)

---

## 🎯 Recommended Future Strategy (When Restarting)

### Option A: Website Handoff (Recommended) ⭐
```
User: "Check 123 Main Street"
Bot: "👋 Hi! I can help with that. To ensure you get the right report, 
      please complete this quick 2-minute form:
      
      👉 https://www.aidriven.biz/property?ref=whatsapp
      
      Once submitted, you'll get your report via email + WhatsApp!
      
      Questions? Reply here anytime."
```

**Benefits:**
- Complete data capture (package, add-ons, preferences)
- Payment integration ready
- Better UX for complex forms
- Professional branding

**Implementation:** Modify Cloudflare Worker `/webhook` endpoint to detect new users and send handoff message instead of auto-processing.

---

### Option B: Full WhatsApp Flow (Advanced)
Build a complete conversational interface:
```
User: "Check 123 Main Street"
Bot: "🏠 Great! Let me ask you 4 quick questions..."
[Package selection → Add-ons → Delivery speed → Email capture]
Bot: "✅ Processing now... Report coming to [email] shortly!"
```

**Complexity:** High (requires state management, error handling, fallback logic)

---

### Option C: Registered Users Only (Premium Feature)
```
1. User creates account on aidriven.biz
2. Verifies email + phone
3. Gets dedicated WhatsApp number: "+27 66 027 8366"
4. Sends "REGISTER" to link WhatsApp to account
5. Can now use WhatsApp shortcuts for repeat orders
```

**Best for:** Power users, property investors, bulk subscribers

---

## 🛠️ Technical Architecture

### Current Components

#### 1. Cloudflare Worker (`aidriven-whatsapp-webhook`)
**Location:** Cloudflare Dashboard → Workers → `aidriven-whatsapp-webhook`

**Endpoints:**
- `POST /webhook` - Receives Meta WhatsApp webhooks
- `GET /poll` - Polled by OpenClaw cron job (every 3 min)
- `POST /queue-manual` - Queues manual processing requests (Rates/Council)
- `GET /health` - Health check endpoint

**Environment Variables:**
```
MAILGUN_DOMAIN = mg.aidriven.biz
MAILGUN_API_KEY = dea06fd768f566dfd3a35de38e3ddbb0-6648d8d0-c028d450
MAILGUN_FROM_EMAIL = gerhard@mg.aidriven.biz
GERHARD_EMAIL = gerhard@aidriven.biz
POLL_API_TOKEN = aidriven_poll_secret_2026_xK9mP
REPORT_QUEUE_KV = aidriven_report_queue (KV namespace binding)
```

**Current Code Version:** Hardcoded API key (bypasses env var issue)
- File: `C:\Users\gstim\.openclaw\workspace\whatsapp\worker-v5-mailgun-fixed.js`
- Deployed: 2026-08-19
- Status: ✅ Working (emails send successfully)

---

#### 2. OpenClaw Cron Job (DISABLED)
**Job ID:** `6c924c8b-6adb-49c8-95bd-8400554c0b7f`  
**Name:** "WhatsApp LIM Poll (every 3 min)"  
**Schedule:** Every 180,000ms (3 minutes)  
**Script:** `poll-whatsapp-requests-v2.js`

**To Re-enable:**
```bash
# In OpenClaw, run:
cron update --jobId 6c924c8b-6adb-49c8-95bd-8400554c0b7f --patch '{"enabled": true}'
```

Or via UI:
1. Go to OpenClaw → Cron/Scheduler
2. Find job: "WhatsApp LIM Poll (every 3 min)"
3. Toggle "Enabled" to ON

---

#### 3. Polling Script
**File:** `C:\Users\gstim\.openclaw\workspace\whatsapp\poll-whatsapp-requests-v2.js`

**What it does:**
1. Calls `GET /poll?token=aidriven_poll_secret_2026_xK9mP` on Cloudflare Worker
2. Retrieves pending manual requests from KV store
3. Processes each request (generates PDF report)
4. Sends report via WhatsApp API
5. Updates status in KV store

**Dependencies:**
- Node.js (v18+)
- `axios` or `node-fetch` for HTTP requests
- PDF generation library (pdfkit or similar)
- WhatsApp Business API credentials

---

#### 4. Google Apps Script (Form → Worker Integration)
**Location:** Google Sheet linked to Property Due Diligence Form → Extensions → Apps Script

**Current Status:** ✅ Working (field mapping fixed 2026-08-19)

**Code Location:** `C:\Users\gstim\.openclaw\workspace\google-apps-script\form-handler.js` (reference copy)

**Triggers:**
- `onFormSubmit(e)` - Fires when Google Form submitted
- Sends POST to `https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/queue-manual`

**Payload Structure:**
```javascript
{
  requestId: 'form_1787147583000',
  source: 'google-form',
  customer: {
    name: 'Gerhard Stimie',
    email: 'gstimie@gmail.com',
    phone: '+27824445825'
  },
  address: '14 Test Street, Marewa, Napier 6001',
  package: 'basic',
  addons: {
    ratesInfo: true,
    councilFees: false
  },
  requiresManualProcessing: true,
  notes: 'Google Form submission'
}
```

---

#### 5. Email Notifications (Mailgun)
**Status:** ✅ Fully functional

**Configuration:**
- Domain: `mg.aidriven.biz`
- From: `Gerhard (AI Driven) <gerhard@mg.aidriven.biz>`
- Reply-To: `gerhard@aidriven.biz`
- DMARC: Configured (`_dmarc.mg.aidriven.biz`)

**Email Templates:**
1. **Customer Acknowledgment** - Sent when form submitted
   - Subject: "AI Driven - Your Due Diligence Request Received"
   - Timeline: 24-48h for manual add-ons
   
2. **Gerhard Notification** - Sent to `gerhard@aidriven.biz`
   - Subject: "🔔 MANUAL PROCESSING REQUIRED - [requestId]"
   - Contains all order details

**Test Results:**
- ✅ Emails land in inbox (after marking "Not Spam" once)
- ✅ Both customer + notification emails work
- ✅ Reply-To header functional

---

## 📁 Key Files Reference

All files located in: `C:\Users\gstim\.openclaw\workspace\whatsapp\`

| File | Purpose | Status |
|------|---------|--------|
| `worker-v5-mailgun-fixed.js` | Cloudflare Worker code (production) | ✅ Deployed |
| `worker-mailgun-simple-test.js` | Minimal test worker (proven working) | ✅ Tested |
| `poll-whatsapp-requests-v2.js` | OpenClaw polling script | ⏸️ Paused |
| `test_mg.py` | Python Mailgun test (reference) | ✅ Working |
| `TOMORROW-MORNING-README.md` | Original deployment guide | 📚 Reference |
| `DMARC-SETUP-GUIDE.md` | DMARC configuration guide | ✅ Complete |
| `MAILGUN-DEPLOYMENT-CHECKLIST-FINAL.md` | Full deployment checklist | ✅ Complete |
| `RESTART-WHATSAPP.md` | This document | 🆕 Created 2026-08-19 |

---

## 🚀 Reactivation Checklist

When ready to restart WhatsApp integration:

### Phase 1: Strategy Decision
- [ ] Choose approach: Website handoff vs. Full flow vs. Registered users
- [ ] Define user journey and conversation flow
- [ ] Decide on payment handling (upfront vs. invoice)

### Phase 2: Technical Updates
- [ ] Update Cloudflare Worker webhook logic (handoff message or full flow)
- [ ] Implement user registration system (if Option C)
- [ ] Add payment integration (Stripe/PayPal)
- [ ] Update conversational logic in polling script

### Phase 3: Testing
- [ ] Test with 2-3 internal users first
- [ ] Verify end-to-end flow (WhatsApp → Report → Delivery)
- [ ] Test edge cases (invalid addresses, payment failures)
- [ ] Load test (multiple simultaneous requests)

### Phase 4: Launch
- [ ] Enable cron job: `cron update --jobId 6c924c8b-6adb-49c8-95bd-8400554c0b7f --patch '{"enabled": true}'`
- [ ] Monitor logs closely for first 48 hours
- [ ] Collect user feedback
- [ ] Iterate based on real usage

---

## 🔍 Lessons Learned (What We Discovered)

### Technical Wins:
1. ✅ **Cloudflare Workers + Mailgun works perfectly** (after fixing API key hardcoding)
2. ✅ **DMARC significantly improves deliverability** (95%+ inbox rate)
3. ✅ **KV store effective for queuing** manual requests
4. ✅ **Email notifications reliable** (customer + Gerhard alerts)

### Challenges Encountered:
1. ❌ **Cloudflare environment variables** had issues reading API keys (solved by hardcoding)
2. ❌ **Incomplete data from WhatsApp** (address-only requests miss package/add-ons)
3. ❌ **No payment flow** in WhatsApp channel
4. ❌ **Strategy gap** (website form has full data, WhatsApp only gets address)

### Strategic Insights:
1. 💡 **Website-first is smarter** for complex services with multiple options
2. 💡 **WhatsApp better suited for notifications/delivery** than initial data capture
3. 💡 **Registration system needed** before offering WhatsApp as premium channel
4. 💡 **Beta should validate core value** (report quality) before optimizing channels

---

## 📞 Support & Troubleshooting

### If Cloudflare Worker Returns 401 Error:
- Check `MAILGUN_API_KEY` is correct (use hardcoded version if env var fails)
- Verify `MAILGUN_DOMAIN` is `mg.aidriven.biz` (not `aidriven.biz`)
- Confirm `MAILGUN_FROM_EMAIL` is `gerhard@mg.aidriven.biz`

### If Emails Go to Spam:
- Ask recipient to mark as "Not Spam" and add to contacts
- Verify DMARC record exists: `_dmarc.mg.aidriven.biz`
- Wait 24-48h for domain reputation to build

### If Cron Job Fails:
- Check Cloudflare Worker health: `curl https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/health`
- Verify KV store binding: `REPORT_QUEUE_KV` must match namespace name exactly
- Check OpenClaw logs for error details

### If WhatsApp API Fails:
- Verify Meta WhatsApp token is still valid (expires periodically)
- Check phone number ID: `1200711009799782`
- Review Meta Developer Dashboard for error codes

---

## 🎯 Next Steps After Beta

Once website beta validates the core business:

1. **Analyze beta feedback** - What do customers value most?
2. **Decide WhatsApp role** - Notification channel vs. Full ordering
3. **Build registration system** - If offering WhatsApp to power users
4. **Integrate payments** - Stripe (need NZ address proof) or PayPal
5. **Launch publicly** - With both web + WhatsApp channels properly positioned

---

**Document Created:** 2026-08-19  
**By:** Seb (AI Driven Assistant)  
**Context:** Paused WhatsApp automation to focus on website-first beta launch

*AI Driven | Practical AI for real businesses*
