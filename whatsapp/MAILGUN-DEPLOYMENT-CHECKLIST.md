# Mailgun Email Integration - Deployment Checklist

**Version:** V5 (Mailgun Fixed)  
**Date:** 2026-08-18  
**Status:** Ready for deployment  

---

## ✅ Pre-Deployment Checklist

### Step 1: Get Your Mailgun API Key

1. Log into [Mailgun Dashboard](https://app.mailgun.com/)
2. Navigate to **Settings** → **API Keys** (or **Account** → **API Keys**)
3. Locate your **Private API Key** (or generate a new one)
4. **⚠️ CRITICAL:** Copy the key **EXACTLY** as shown:
   - **Old keys:** Start with `key-` prefix (e.g., `key-123456...`)
   - **New keys:** Raw hexadecimal string (32-64 characters, NO prefix)
5. **DO NOT add 'key-' manually** - paste exactly what Mailgun gives you
6. The Worker code handles both formats automatically

### Step 2: Verify Your Sending Domain in Mailgun

If you haven't already set up `aidriven.biz` in Mailgun:

1. In Mailgun Dashboard, go to **Sending** → **Domains**
2. Click **Add New Domain**
3. Enter: `aidriven.biz`
4. Choose your region (US or EU)
5. Follow the DNS verification steps:
   - Add TXT record for domain verification
   - Add MX records for receiving emails (optional)
   - Add CNAME records for tracking (recommended)
6. Wait for DNS propagation (usually 5-15 minutes)
7. Status should show **Active** (green checkmark)

### Step 3: Deploy the Fixed Worker to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Select your worker (or create new: `aidriven-whatsapp-webhook-v5`)
3. Click **Quick Edit** or **Editor**
4. **Copy the entire contents** of `worker-v5-mailgun-fixed.js` from your workspace
5. **Paste** into the Cloudflare Worker editor (replace all existing code)
6. Click **Save and Deploy**

### Step 4: Add Mailgun Environment Variables

In the Cloudflare Worker settings:

1. Go to **Settings** → **Environment Variables** (or **Variables and Secrets**)
2. Add the following variables:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `MAILGUN_DOMAIN` | `aidriven.biz` | Your verified Mailgun domain |
| `MAILGUN_API_KEY` | *(paste exact key from Mailgun)* | **IMPORTANT:** Copy exactly as generated - new keys are raw hex strings (32-64 chars) WITHOUT 'key-' prefix. Do NOT add 'key-' manually! |
| `MAILGUN_FROM_EMAIL` | `support@aidriven.biz` | Verified sender email |
| `GERHARD_EMAIL` | `gerhard@aidriven.biz` | For Reply-To header and notifications |
| `POLL_API_TOKEN` | `aidriven_poll_secret_2026_xK9mP` | Existing token for OpenClaw polling |
| `REPORT_QUEUE_KV` | *(select your KV namespace)* | Your existing KV store |

3. Click **Save** after adding all variables
4. Click **Deploy** again to apply the new environment variables

---

## 🧪 Testing Checklist

### Test 1: Health Check Endpoint

```bash
curl https://aidriven-whatsapp-webhook-v5.your-subdomain.workers.dev/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-18T...",
  "worker": "aidriven-whatsapp-webhook-v5"
}
```

### Test 2: Send Test Email via Worker

Create a test script or use curl to hit the `/queue-manual` endpoint:

```bash
curl -X POST https://aidriven-whatsapp-webhook-v5.your-subdomain.workers.dev/queue-manual \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test-001",
    "customer": {
      "name": "Test Customer",
      "email": "your-test-email@example.com",
      "phone": "+27123456789"
    },
    "address": "123 Test Street, Napier",
    "package": "basic",
    "addons": {
      "ratesInfo": true,
      "councilFees": true
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "requestId": "test-001",
  "status": "queued_for_manual_processing",
  "emailsSent": 2,
  "errors": []
}
```

**Check:**
- ✅ Customer receives acknowledgment email
- ✅ Gerhard receives notification email
- ✅ Both emails have correct Reply-To header

### Test 3: Verify Mailgun Logs

1. Go to Mailgun Dashboard
2. Navigate to **Sending** → **Logs**
3. Filter by your domain (`aidriven.biz`)
4. Look for recent email sends
5. Verify status shows **delivered** (not failed/bounced)

### Test 4: Poll Endpoint (Existing Functionality)

```bash
curl "https://aidriven-whatsapp-webhook-v5.your-subdomain.workers.dev/poll?token=aidriven_poll_secret_2026_xK9mP"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "requests": [...]
}
```

---

## 🔧 Troubleshooting

### Issue: Mailgun returns 401 Unauthorized

**Possible Causes:**
- API key is incorrect or has extra spaces
- **Added 'key-' prefix manually to a new key that doesn't have it** (most common!)
- Using Public API key instead of Private API key
- API key was regenerated but Cloudflare still has old value

**Solution:**
- **New keys:** Copy EXACTLY as generated (raw hex string, no prefix)
- **Old keys:** Keep the `key-` prefix if Mailgun shows it
- Double-check you copied the **Private API Key**, not Public
- Ensure no leading/trailing spaces in the environment variable value
- Regenerate the key if unsure, then update Cloudflare immediately

### Issue: Mailgun returns 403 Forbidden

**Possible Causes:**
- Domain not verified in Mailgun
- Domain is in sandbox mode

**Solution:**
- Verify domain ownership in Mailgun dashboard
- Add all required DNS records
- Wait for DNS propagation (up to 24 hours, usually faster)

### Issue: Emails sent but not received

**Possible Causes:**
- Emails going to spam folder
- Domain reputation issues
- Recipient email server blocking

**Solution:**
- Check spam/junk folders
- Verify sender email is properly configured in Mailgun
- Add SPF/DKIM records for your domain

### Issue: Worker returns 500 Error

**Check:**
- Cloudflare Worker logs (**Workers & Pages** → **Your Worker** → **Observability** → **Logs**)
- Look for error messages like "MAILGUN_API_KEY not configured"
- Verify all environment variables are set correctly

---

## 📋 Post-Deployment Tasks

### 1. Update Google Apps Script (if needed)

Ensure your Google Sheet Apps Script is calling the correct worker URL:

```javascript
const WORKER_URL = 'https://aidriven-whatsapp-webhook-v5.your-subdomain.workers.dev/queue-manual';
```

### 2. Update OpenClaw Cron Job (if needed)

Verify the cron job is pointing to the new worker version:

```bash
curl "https://aidriven-whatsapp-webhook-v5.your-subdomain.workers.dev/poll?token=..."
```

### 3. Monitor First Real Request

When the next real form submission comes in:
- Watch Cloudflare Worker logs for the `/queue-manual` request
- Check Mailgun logs for email delivery
- Confirm both customer and Gerhard receive emails
- Verify email content is correct

### 4. Document the Setup

Update your main documentation:
- `DEPLOYMENT.md` - Add Mailgun section
- `WORKFLOWS.md` - Document email notification flow
- `.env` file - Add Mailgun variables (for local reference only, never commit real keys!)

---

## 🎯 Success Criteria

The integration is working correctly when:

- ✅ Form submission triggers Apps Script
- ✅ Apps Script calls `/queue-manual` endpoint successfully
- ✅ Manual request is stored in KV store
- ✅ Customer receives acknowledgment email within 30 seconds
- ✅ Gerhard receives notification email within 30 seconds
- ✅ Both emails have proper Reply-To headers
- ✅ Mailgun logs show "delivered" status
- ✅ No errors in Cloudflare Worker logs

---

## 📞 Support Resources

- **Mailgun Docs:** https://documentation.mailgun.com/
- **Cloudflare Workers Docs:** https://developers.cloudflare.com/workers/
- **Mailgun Support:** https://support.mailgun.com/
- **Cloudflare Support:** https://support.cloudflare.com/

---

*AI Driven | Practical AI for real businesses*  
*Version 5 - Mailgun Integration Fixed*
