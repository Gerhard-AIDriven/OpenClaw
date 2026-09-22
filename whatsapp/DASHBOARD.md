# 📊 WhatsApp Lead Automation Dashboard

**AI Driven - Property Due Diligence System**  
*Last Updated: 2026-08-10 14:52 GMT+2*  
*Status: ✅ PRODUCTION READY (awaiting WhatsApp unblock)*

---

## 🚦 System Health Overview

| Component | Status | Last Check | Details |
|-----------|--------|------------|---------|
| **Cloudflare Worker** | 🟢 LIVE | 2026-08-10 10:52 | All endpoints operational |
| **Meta API Connection** | 🟢 CONNECTED | 2026-08-10 10:56 | Token valid, webhook configured |
| **WhatsApp Number** | 🟡 BLOCKED | - | Temporarily blocked by WhatsApp (waiting for unblock) |
| **Polling Service** | 🟢 ACTIVE | Running | Cron job polls every 3 minutes |
| **Report Generator** | 🟢 READY | 2026-08-08 | Sample report validated |
| **KV Store** | 🟢 CONNECTED | 2026-08-10 | LIM_QUEUE_KV operational |

---

## 📞 WhatsApp Business Account Details

```
Business Name:      AIdriven
Phone Number:       +27 66 027 8366
Phone Number ID:    1200711009799782
Business Account:   4713904522229723
Verification:       ✅ VERIFIED
Throughput Tier:    STANDARD (1,000 messages/24h)
Platform:           Cloud API
```

---

## 🔗 Endpoints & URLs

### Cloudflare Worker
- **Base URL:** `https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev`
- **Health Check:** `/test`
- **Webhook Receiver:** `/webhook` (POST from Meta)
- **Poll Endpoint:** `/poll?token=***` (OpenClaw polling)

### Quick Links
- [Cloudflare Dashboard](https://dash.cloudflare.com/8a6d3cf29860aa6340dca3e647fc10ef/workers/services/view/aidriven-whatsapp-webhook/production)
- [Cloudflare Logs](https://dash.cloudflare.com/8a6d3cf29860aa6340dca3e647fc10ef/workers/services/view/aidriven-whatsapp-webhook/production/observability/logs)
- [Meta Developer Dashboard](https://developers.facebook.com/apps/)
- [Meta WhatsApp Settings](https://business.facebook.com/settings)

---

## ⚙️ Configuration Summary

### Environment Variables (Cloudflare Worker)

| Variable | Value | Type |
|----------|-------|------|
| `WHATSAPP_PHONE_NUMBER_ID` | `1374191692437396` | Plaintext |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | `4713904522229723` | Plaintext |
| `WHATSAPP_ACCESS_TOKEN` | `EAAPjA...ZDZD` | 🔒 Secret |
| `WEBHOOK_VERIFY_TOKEN` | `aidriven-lim-verify-2026` | Plaintext |
| `POLL_API_TOKEN` | `aidriven_poll_secret_2026_xK9mP` | Plaintext |
| `LIM_QUEUE_KV` | *[KV Namespace]* | Binding |

### OpenClaw Cron Jobs

| Job Name | Schedule | Status | Job ID |
|----------|----------|--------|--------|
| WhatsApp LIM Poll (every 3 min) | Every 180,000ms | ✅ Active | `6c924c8b-6adb-49c8-95bd-8400554c0b7f` |
| Heartbeat (2-hourly) | 6am-6pm | ✅ Active | `f58e422a-32a7-4914-a1d4-beef64c2f39e` |
| Gmail Monitor | Paused | ⏸️ Disabled | `0289c38f-d1b8-4ff0-ba2f-99f5ebddd8e4` |

---

## 📝 Request Workflow

### Step-by-Step Flow

```
1. Customer sends WhatsApp message
   ↓
2. Meta → Webhook → Cloudflare Worker (/webhook)
   ↓
3. Worker parses message, extracts address
   ↓
4. Worker stores in KV: requests/{uuid}.json (status: pending)
   ↓
5. Worker sends auto-reply: "✅ Thank you! Your order is queued..."
   ↓
6. OpenClaw cron polls /poll endpoint (every 3 min)
   ↓
7. OpenClaw fetches pending requests, marks as "processing"
   ↓
8. OpenClaw generates Due Diligence report
   ↓
9. OpenClaw updates status to "completed"
   ↓
10. OpenClaw sends final report via WhatsApp
```

### Message Format Examples

**Customer sends:**
```
LIM report for 18 Ferguson Avenue, Napier
```

**Auto-reply (instant):**
```
✅ Thank you!

I've received your LIM report request for:

📍 18 Ferguson Avenue, Napier

Your order has been queued and will be processed today. 
You'll receive the report via WhatsApp once complete.

Order ID: a1b2c3d4

Questions? Reply to this message anytime.
```

**Final reply (after processing):**
```
✅ Your LIM report is ready!

Address: 18 Ferguson Avenue, Napier

Your report has been generated and is being reviewed. 
You'll receive the final PDF shortly.

Order ID: a1b2c3d4
```

---

## 🧪 Testing Checklist

### Pre-Launch Tests

- [x] Cloudflare Worker deployed (`worker-with-poll.js`)
- [x] `/test` endpoint returns 200 OK
- [x] `/poll` endpoint authenticates correctly
- [x] Meta API token valid (check-status.js passes)
- [x] Webhook configured in Meta Dashboard
- [x] KV store connected and writable
- [x] Polling script tested (returns empty list)
- [x] Cron job active (runs every 3 min)
- [x] Sample report generated (18 Ferguson Avenue)
- [ ] **Pending:** WhatsApp number unblocked
- [ ] **Pending:** End-to-end test with real message
- [ ] **Pending:** Report generation triggered by WhatsApp message
- [ ] **Pending:** WhatsApp reply sent successfully

### Test Commands

**Check API connection:**
```bash
cd C:\Users\gstim\.openclaw\workspace\whatsapp
node check-status.js
```

**Manually poll for requests:**
```bash
node poll-whatsapp-requests.js
```

**Test report generation:**
```bash
node test-report-generation.js
```

**Test Worker health:**
```bash
curl https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/test
```

**Test poll endpoint:**
```bash
curl "https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/poll?token=aidriv…K9mP"
```

---

## 📊 Metrics to Monitor

### Daily Metrics (track in spreadsheet)

| Date | Messages Received | Reports Generated | Avg Processing Time | Errors |
|------|------------------|-------------------|---------------------|--------|
| 2026-08-10 | 0 | 0 | - | 0 |
| ... | ... | ... | ... | ... |

### Key Performance Indicators

- **Response Time:** < 3 minutes (cron poll interval)
- **Report Generation:** < 2 minutes per property
- **Success Rate:** Target > 95%
- **Message Throughput:** Limit 1,000/24h (Standard tier)

---

## 🚨 Troubleshooting Guide

### Issue: WhatsApp number still blocked

**Symptoms:** Can't log into WhatsApp Business app

**Solution:**
- Wait 24 hours (temporary blocks usually lift automatically)
- Avoid requesting multiple verification codes
- Try logging in again tomorrow morning

---

### Issue: Webhook not receiving messages

**Symptoms:** No logs in Cloudflare when messages sent

**Checks:**
1. Verify webhook URL in Meta Dashboard: `https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/`
2. Check webhook subscription is active
3. Verify `WEBHOOK_VERIFY_TOKEN` matches
4. Check Cloudflare logs for errors

**Fix:**
- Go to Meta Developer Dashboard → WhatsApp → Configuration
- Re-verify webhook if needed
- Check Cloudflare Worker logs (Observability → Logs)

---

### Issue: Poll returns 401 Unauthorized

**Symptoms:** `node poll-whatsapp-requests.js` fails with 401

**Checks:**
1. Verify `POLL_API_TOKEN` in Cloudflare matches script
2. Check token in URL is correct (case-sensitive)
3. Ensure no extra spaces in token

**Fix:**
- Update `POLL_API_TOKEN` in Cloudflare environment variables
- Redeploy Worker
- Update token in `poll-whatsapp-requests.js`

---

### Issue: Report generation fails

**Symptoms:** Cron job reports error during report generation

**Checks:**
1. Verify Python is installed and in PATH
2. Check all dependencies installed (`pip install -r requirements.txt`)
3. Verify LINZ API key is valid
4. Check Napier Council scraper works (manual step required)

**Fix:**
- For semi-automated reports: Manual browser search required first
- Consider fully automated mode (skip rates) for WhatsApp flow
- Check `due-diligence-mvp/reports/` folder for partial outputs

---

### Issue: Meta API returns 401

**Symptoms:** `node check-status.js` fails with 401

**Checks:**
1. Token may have expired or been revoked
2. Token copied incorrectly (extra spaces/characters)
3. System User permissions changed

**Fix:**
- Generate fresh token from Meta Developer Dashboard
- Update `WHATSAPP_ACCESS_TOKEN` in Cloudflare
- Redeploy Worker
- Test with `node check-status.js`

---

## 📁 File Reference

### Key Files

```
C:\Users\gstim\.openclaw\workspace\whatsapp\
├── worker-with-poll.js          # Cloudflare Worker code (deployed)
├── .env                         # Local environment variables (reference only)
├── DEPLOYMENT.md                # Deployment guide
├── DASHBOARD.md                 # This file - monitoring dashboard
├── check-status.js              # Test Meta API connection
├── poll-whatsapp-requests.js    # OpenClaw polling script (cron job)
├── test-report-generation.js    # Test report generator
└── README.md                    # Overview documentation (create next)
```

### Cloudflare Worker Location
- **URL:** https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev
- **Account:** 8a6d3cf29860aa6340dca3e647fc10ef
- **Script:** `worker-with-poll.js` (version: 2026-08-10-with-poll)

---

## 🎯 Next Actions

### Immediate (Today)
- [ ] Wait for WhatsApp number unblock (automatic)
- [ ] Monitor cron job logs (should show "0 requests" until first message)

### Once WhatsApp is Unblocked
- [ ] Send test message from personal phone: `"LIM report for 18 Ferguson Avenue, Napier"`
- [ ] Verify webhook received in Cloudflare logs
- [ ] Confirm auto-reply received on WhatsApp
- [ ] Wait ≤3 minutes for cron poll
- [ ] Verify report generation started
- [ ] Confirm final report sent via WhatsApp

### Post-Launch (Week 1)
- [ ] Monitor first 10 real customer requests
- [ ] Track success rate and processing times
- [ ] Gather customer feedback on message clarity
- [ ] Optimize response templates if needed
- [ ] Consider upgrading Meta throughput tier if needed

---

## 📞 Support Contacts

### Technical Issues
- **Cloudflare Support:** https://dash.cloudflare.com/profile/create-ticket
- **Meta Developer Support:** https://developers.facebook.com/support/
- **OpenClaw Documentation:** https://docs.openclaw.ai

### Business Contacts
- **Gerhard Stimie:** gerhard@aidriven.biz | +27 71 461 0886
- **AI Driven:** aidriven.biz

---

## 📈 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-08-10 | 1.0 | Initial deployment - Production ready |
| - | - | - |

---

*AI Driven | Practical AI for real businesses*  
*gerhard@aidriven.biz | 021 402 8807*
