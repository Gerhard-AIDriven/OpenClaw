# WhatsApp Worker Deployment Guide

**Last Updated:** 2026-08-10  
**Version:** worker-with-poll.js (adds /poll endpoint for OpenClaw integration)

---

## 🚀 Deploy Updated Worker

### Step 1: Copy Worker Code to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **aidriven-whatsapp-webhook**
3. Click **Quick Edit** or **Editor**
4. Replace the entire code with contents of `worker-with-poll.js`
5. Click **Save and Deploy**

### Step 2: Add Environment Variables

In the Worker settings, go to **Settings** → **Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `WHATSAPP_PHONE_NUMBER_ID` | `1374191692437396` | Already set |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | `4713904522229723` | Already set |
| `WHATSAPP_ACCESS_TOKEN` | *(generate fresh token - see below)* | **⚠️ NEEDS REFRESH** |
| `WEBHOOK_VERIFY_TOKEN` | `aidriven-lim-verify-2026` | Already set |
| `POLL_API_TOKEN` | `aidriven_poll_secret_2026_xK9mP` | **✨ NEW - Create this** |
| `LIM_QUEUE_KV` | *(select your KV namespace)* | Already set |

**Important:** Click **Save** after adding variables, then **Deploy** again.

---

## 🔑 Generate Fresh Meta Access Token

The current token is returning 401 errors. Generate a new one:

1. Go to [Meta Developer Dashboard](https://developers.facebook.com)
2. Select your WhatsApp app
3. Go to **WhatsApp** → **API Setup**
4. Under "Step 2: Generate access tokens", click **Generate access token**
5. Select **Permanent** token (not temporary!)
6. Copy the token carefully (no extra spaces)
7. Update the `WHATSAPP_ACCESS_TOKEN` environment variable in Cloudflare
8. Click **Save** and **Deploy**

---

## 🧪 Test the Deployment

### Test 1: Health Check
```
GET https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/test
```

Expected response:
```json
{
  "status": "ok",
  "version": "2026-08-10-with-poll",
  "env_vars": {
    "has_phone_id": true,
    "has_token": true,
    "has_verify_token": true,
    "has_kv": true,
    "has_poll_token": true
  }
}
```

### Test 2: Poll Endpoint (with token)
```
GET https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/poll?token=aidriven_poll_secret_2026_xK9mP
```

Expected response (when no pending requests):
```json
{
  "status": "ok",
  "count": 0,
  "requests": [],
  "polledAt": "2026-08-10T..."
}
```

### Test 3: Poll Endpoint (without token - should fail)
```
GET https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/poll
```

Expected response:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API token"
}
```
(Status 401)

---

## 📋 Next Steps: OpenClaw Integration

After deploying the Worker:

1. **Create polling script** (`poll-whatsapp-requests.js`)
2. **Add WhatsApp channel config** to OpenClaw gateway
3. **Set up cron job** to poll every 2-3 minutes
4. **Test end-to-end flow** with a real WhatsApp message

---

## 🔧 Troubleshooting

### Worker returns 404 on /poll
- Make sure you deployed `worker-with-poll.js`, not the old version
- Check Cloudflare logs for any deployment errors

### Poll returns 401 Unauthorized
- Verify `POLL_API_TOKEN` environment variable is set correctly
- Make sure the token in the URL matches exactly (case-sensitive)

### WhatsApp messages not being stored
- Check `LIM_QUEUE_KV` environment variable points to correct KV namespace
- Verify KV namespace exists and has write permissions
- Check Cloudflare logs for error messages

### Meta API returns 401
- Access token is invalid or expired
- Generate a fresh permanent token from Meta Developer Dashboard
- Update `WHATSAPP_ACCESS_TOKEN` in Cloudflare environment variables

---

## 📞 Support

If you run into issues:
1. Check Cloudflare Worker logs (Observability → Logs)
2. Test endpoints manually in browser or curl
3. Verify all environment variables are set correctly
4. Check Meta Developer Dashboard for API errors

---

*AI Driven | Practical AI for real businesses*
