# WhatsApp Automation Updates - Manual Processing Support

**Date:** 2026-08-17  
**Status:** Ready for Implementation  
**Priority:** High (Beta Testing Requirement)

---

## Overview

Updated the WhatsApp automation system to support manual processing requests when customers select **Rates Information** or **Council Fees & Permits** add-ons.

---

## What's Changed

### 1. Cloudflare Worker V4 (`worker-v4-manual-support.js`)

**New Features:**
- Detects manual processing flags (ratesInfo, councilFees)
- Routes manual requests to separate queue
- Sends appropriate customer messaging about 24-48h delay
- Notifies Gerhard via WhatsApp when manual request arrives
- Backward compatible with existing automated flow

**Key Endpoints:**
- `POST /queue-manual` - Queue manual processing request (NEW)
- `GET /poll` - Returns only automated requests (excludes manual)
- `GET /test` - Shows v4 features in health check

**Environment Variable Needed:**
```
GERHARD_WHATSAPP_NUMBER=+27210000000
```

---

### 2. Manual Poll Script (`poll-manual-requests.js`)

**Purpose:** Help Gerhard process manual requests

**Usage:**
```bash
cd C:\Users\gstim\.openclaw\workspace\whatsapp
node poll-manual-requests.js
```

**Features:**
- Displays pending manual requests in readable format
- Shows action items for each request
- Provides quick links to council property viewers
- Generates email draft for customer acknowledgment
- Saves queue to local JSON file

**Note:** Currently shows workflow instructions until Worker v4 is deployed.

---

### 3. Email Templates (`EMAIL-TEMPLATES-MANUAL.md`)

**5 Templates Created:**

1. **Immediate Acknowledgment** - Sent when form submitted with manual add-ons
2. **Report Delivery** - Sent when complete report is ready
3. **RID Request Follow-Up** - Ask customer for property clarification
4. **Expedited Service Offer** - $50 rush fee for faster delivery
5. **Partial Delivery** - Send LINZ+Hazards first, rates later

**Gmail Setup Options:**
- Manual copy/paste (simplest)
- Gmail Canned Responses (recommended)
- Zapier automation (advanced)

---

## Workflow Summary

### Automated Flow (No Manual Add-ons)
```
Customer → WhatsApp Form → Worker V4 → Auto-Process → Report Generated → WhatsApp Link
Time: 15-60 minutes
```

### Manual Flow (Rates/Council Selected)
```
Customer → Google Form → Manual Queue → Gerhard Notified → 
Gerhard Retrieves RID → Runs Extractor → Generates Report → 
Email Delivery
Time: 24-48 hours
```

---

## Implementation Steps

### Phase 1: Deploy Worker V4 ✅ READY
1. Copy `worker-v4-manual-support.js` to Cloudflare Workers dashboard
2. Or deploy via Wrangler:
   ```bash
   cd whatsapp
   wrangler deploy worker-v4-manual-support.js --name aidriven-whatsapp-webhook-v4
   ```
3. Add environment variable:
   ```
   GERHARD_WHATSAPP_NUMBER=+27714610886
   ```
4. Test with `/test` endpoint

### Phase 2: Update Cron Job ✅ READY
Current cron job will continue working - it only polls automated requests.

Optional: Add separate cron for manual polling:
```json
{
  "name": "Manual Requests Check (every 30 min)",
  "schedule": { "kind": "every", "everyMs": 1800000 },
  "payload": {
    "kind": "agentTurn",
    "message": "Check for manual processing requests and remind Gerhard"
  }
}
```

### Phase 3: Create Google Form ⏳ PENDING
Follow updated templates in:
- `due-diligence-mvp/google-form-template.md`
- `due-diligence-mvp/GOOGLE_FORM_SETUP.md`

**Key Addition:**
```
Add-ons section now includes:
☐ Rates Information - Requires manual processing (adds 24-48 hours)
☐ Council Fees & Permits - Requires manual processing (adds 24-48 hours)
```

### Phase 4: Connect Form to Worker ⏳ PENDING
**Option A: Zapier Integration**
- Trigger: Google Forms new response with manual add-ons
- Action: POST to Worker `/queue-manual` endpoint
- Include: customer details, address, addons

**Option B: Manual Entry (Beta)**
- Monitor Google Sheets for manual add-on selections
- Manually queue via simple script or direct KV entry
- Process following `MANUAL-WORKFLOW-RATES-COUNCIL.md`

---

## Files Created/Updated

| File | Status | Purpose |
|------|--------|---------|
| `whatsapp/worker-v4-manual-support.js` | ✅ Created | Worker with manual routing |
| `whatsapp/poll-manual-requests.js` | ✅ Created | Manual poll helper |
| `due-diligence-mvp/EMAIL-TEMPLATES-MANUAL.md` | ✅ Created | Email templates |
| `due-diligence-mvp/MANUAL-WORKFLOW-RATES-COUNCIL.md` | ✅ Created | Full workflow guide |
| `due-diligence-mvp/google-form-template.md` | ✅ Updated | Added manual checkboxes |
| `due-diligence-mvp/GOOGLE_FORM_SETUP.md` | ✅ Updated | Setup instructions |

---

## Testing Checklist

### Worker V4
- [ ] Deploy to Cloudflare
- [ ] Test `/test` endpoint shows v4 features
- [ ] Submit test WhatsApp message (automated flow still works)
- [ ] Verify conversational flow unchanged
- [ ] Test manual request queuing (if possible)

### Email Templates
- [ ] Copy templates to Gmail Canned Responses
- [ ] Test send Template 1 (acknowledgment)
- [ ] Test send Template 2 (delivery)
- [ ] Verify placeholders are clear

### End-to-End (When Form Live)
- [ ] Submit test form WITHOUT manual add-ons → auto-report
- [ ] Submit test form WITH Rates checkbox → manual queue
- [ ] Verify Gerhard receives notification
- [ ] Process manually following workflow
- [ ] Send acknowledgment email
- [ ] Retrieve RID and generate report
- [ ] Send delivery email

---

## Current Limitations

1. **Google Form Not Yet Created** - Need to build in Google Forms
2. **Worker V4 Not Deployed** - Still using v3 in production
3. **No Automated Form→Worker Bridge** - Manual entry needed during beta
4. **RID Lookup Still Manual** - No automated council scraper yet

---

## Next Actions (Your Side)

1. **Create Google Form** using updated template
   - Add Rates/Council checkboxes with disclaimer
   - Set up Google Sheets response tracking
   
2. **Deploy Worker V4** to Cloudflare
   - Copy `worker-v4-manual-support.js`
   - Add `GERHARD_WHATSAPP_NUMBER` env var
   
3. **Set Up Gmail Templates**
   - Copy 5 email templates to Canned Responses
   - Test with sample sends

4. **Test End-to-End**
   - Submit test responses
   - Verify manual routing works
   - Time the process

---

## Beta Success Metrics

Track these during beta:

| Metric | Target | Notes |
|--------|--------|-------|
| % selecting manual add-ons | Track only | Understand demand |
| Avg processing time | <24 hours | Manual work speed |
| Customer satisfaction | >4/5 stars | Quality check |
| Willingness to wait | >60% accept | Pricing validation |
| Errors/issues | <10% | Process refinement |

---

## Questions?

All documentation is in:
- `whatsapp/worker-v4-manual-support.js` - Code comments
- `due-diligence-mvp/MANUAL-WORKFLOW-RATES-COUNCIL.md` - Step-by-step workflow
- `due-diligence-mvp/EMAIL-TEMPLATES-MANUAL.md` - Email copy

Ready to deploy when you are! 🚀
