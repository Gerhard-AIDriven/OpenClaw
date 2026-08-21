#  AI Driven WhatsApp Lead Automation

**Automated property due diligence reports via WhatsApp**  
*Production Status: ✅ READY (awaiting WhatsApp unblock)*

---

## 🚀 Quick Start

### System is LIVE and monitoring for incoming requests!

The system automatically polls every 3 minutes for new WhatsApp messages. No manual intervention needed.

---

## 📊 Check System Status

Run this command anytime to see system health:

```bash
cd C:\Users\gstim\.openclaw\workspace\whatsapp
node check-status.js
```

**Expected output:**
```
✅ Account Status:
   Phone Number: +27 66 027 8366
   Verification Status: VERIFIED
   ...
```

---

## 🧪 Test the System

### 1. Send a Test Message (once WhatsApp is unblocked)

From any WhatsApp number, send:
```
LIM report for 18 Ferguson Avenue, Napier
```

### 2. What Should Happen

- **Instant:** Auto-reply confirming receipt
- **Within 3 minutes:** Report generation starts
- **Within 5 minutes:** Final report sent back

### 3. Monitor in Real-Time

**Cloudflare Logs:**
- Go to: https://dash.cloudflare.com → Workers & Pages → aidriven-whatsapp-webhook → Observability → Logs
- Watch for webhook events when message arrives

**OpenClaw Cron Logs:**
- Check OpenClaw session logs for poll results
- Look for "Processing request" messages

---

## 🔧 Common Tasks

### Manually Poll for Requests
```bash
node poll-whatsapp-requests.js
```

### Test Report Generation
```bash
node test-report-generation.js
```

### View Dashboard
Open in browser:
```
file:///C:/Users/gstim/.openclaw/workspace/whatsapp/DASHBOARD.md
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `DASHBOARD.md` | 📊 Full system dashboard & monitoring |
| `DEPLOYMENT.md` | 🚀 Deployment guide for Cloudflare Worker |
| `worker-with-poll.js` | ☁️ Cloudflare Worker code |
| `poll-whatsapp-requests.js` | 🔄 OpenClaw polling script (cron job) |
| `check-status.js` | ✅ Test Meta API connection |
| `.env` | 🔑 Environment variables (reference only) |

---

## 🔗 Quick Links

- [Cloudflare Dashboard](https://dash.cloudflare.com/8a6d3cf29860aa6340dca3e647fc10ef/workers/services/view/aidriven-whatsapp-webhook/production)
- [Cloudflare Logs](https://dash.cloudflare.com/8a6d3cf29860aa6340dca3e647fc10ef/workers/services/view/aidriven-whatsapp-webhook/production/observability/logs)
- [Meta Developer Dashboard](https://developers.facebook.com/apps/)
- [System Dashboard](file:///C:/Users/gstim/.openclaw/workspace/whatsapp/DASHBOARD.md)

---

## 🆘 Troubleshooting

### WhatsApp Number Blocked
- **Issue:** Can't log into WhatsApp Business app
- **Fix:** Wait 24 hours (temporary block lifts automatically)

### Not Receiving Messages
- **Check:** Cloudflare logs for webhook events
- **Verify:** Webhook URL in Meta Dashboard is correct

### Report Generation Fails
- **Check:** Python installed and dependencies available
- **Note:** Semi-automated reports require manual browser step for rates

### API Returns 401 Error
- **Fix:** Generate fresh token from Meta Developer Dashboard
- **Update:** `WHATSAPP_ACCESS_TOKEN` in Cloudflare environment variables
- **Redeploy:** Click Deploy in Cloudflare Worker settings

---

## 📞 Support

**Technical Issues:** Check `DASHBOARD.md` troubleshooting section  
**Business Inquiries:** gerhard@aidriven.biz  

---

*AI Driven | Practical AI for real businesses*  
*Version: 1.0 | Last Updated: 2026-08-10 14:52*
