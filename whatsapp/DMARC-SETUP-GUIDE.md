# DMARC Setup for mg.aidriven.biz

## Why DMARC Matters

Without DMARC, Gmail and other providers are more likely to mark your emails as spam because:
- They can't verify that emails claiming to be from you are actually authorized
- New domains have no sending reputation
- DMARC is now a standard expectation for legitimate senders

Adding DMARC will **significantly improve deliverability** and reduce junk folder placement.

---

## ✅ Add DMARC Record in Cloudflare (2 Minutes)

### Step 1: Go to Cloudflare Dashboard
1. Login to [Cloudflare](https://dash.cloudflare.com/)
2. Select your domain: `aidriven.biz`
3. Go to **DNS** → **Records**

### Step 2: Add DMARC TXT Record

Click **"Add record"** and fill in:

| Field | Value |
|-------|-------|
| **Type** | `TXT` |
| **Name** | `_dmarc.mg` |
| **Content** | `v=DMARC1; p=none; rua=mailto:gerhard@aidriven.biz; fo=1` |
| **TTL** | `Auto` |
| **Proxy status** | ☐ Unchecked (DNS only, no orange cloud) |

**Click "Save"**

---

## 📋 What This DMARC Record Does

```
v=DMARC1; p=none; rua=mailto:gerhard@aidriven.biz; fo=1
```

- `v=DMARC1` = This is a DMARC record
- `p=none` = Policy: Monitor mode (don't reject emails yet, just observe)
- `rua=mailto:...` = Send daily aggregate reports to this email
- `fo=1` = Generate reports on any authentication failure (helpful for debugging)

**Why `p=none`?**
- You're building reputation from scratch
- This lets you monitor without risking legitimate emails being rejected
- After 2-4 weeks of good sending, you can upgrade to `p=quarantine` or `p=reject`

---

## 🔍 Verify DMARC is Working

After adding the record (wait ~5 minutes for propagation):

### Option 1: Use Online Checker
Go to: https://mxtoolbox.com/dmarc.aspx  
Enter: `mg.aidriven.biz`  
Should show: ✅ DMARC record found

### Option 2: Check in Cloudflare
Your DNS records should now show:
```
_dmarc.mg.aidriven.biz  TXT  v=DMARC1; p=none; rua=mailto:gerhard@aidriven.biz; fo=1
```

### Option 3: Test with Email
Send a test email to `gstimie@gmail.com` and check headers:
- Look for `Authentication-Results:` showing DMARC pass
- Should see `dmarc=pass` in email headers

---

## 📊 Monitor Your DMARC Reports

Within 24-48 hours, you'll start receiving daily XML reports at `gerhard@aidriven.biz` from:
- Google (Gmail)
- Microsoft (Outlook/Hotmail)
- Yahoo
- Other major providers

These reports show:
- ✅ How many emails passed authentication
- ⚠️ Any spoofing attempts
- 📈 Your sending reputation trends

**Tip:** Use a free DMARC analyzer like:
- https://dmarcian.com/
- https://postmarkapp.com/dmarc
- https://www.valimail.com/free-dmarc-check

---

## 🎯 Next Steps After DMARC

### Week 1-2: Build Reputation
- Send consistently (not sporadic bursts)
- Keep volume moderate (50-100 emails/day max initially)
- Monitor bounce rates (<2% is good)
- Watch spam complaints (<0.1% is critical)

### Week 3-4: Consider Stricter Policy
Once you have consistent sending history:
```
v=DMARC1; p=quarantine; rua=mailto:gerhard@aidriven.biz
```
This tells providers to quarantine suspicious emails instead of just monitoring.

### Month 2+: Maximum Protection
```
v=DMARC1; p=reject; rua=mailto:gerhard@aidriven.biz
```
This rejects unauthorized emails entirely (best for security).

---

## 🧪 Additional Deliverability Tips

### 1. Warm Up Your Domain
Don't send 500 emails on day one! Gradually increase:
- **Week 1:** 20-50 emails/day
- **Week 2:** 50-100 emails/day
- **Week 3:** 100-200 emails/day
- **Week 4+:** Full volume (up to 5,000/month on Mailgun free tier)

### 2. Encourage Recipients to Whitelist You
In your first email to each customer, add:
```
P.S. To ensure you receive our reports, please add gerhard@mg.aidriven.biz to your contacts!
```

### 3. Avoid Spam Trigger Words
- ❌ "FREE", "URGENT", "ACT NOW", "$$$"
- ✅ Professional, factual language

### 4. Include Unsubscribe Option
Even for transactional emails, add:
```
--
AI Driven | Practical AI for real businesses
If you no longer wish to receive these emails, reply with "unsubscribe"
```

### 5. Monitor Mailgun Logs
Check daily for:
- Bounces (invalid addresses)
- Complaints (marked as spam)
- Blocks (provider-level issues)

Address issues immediately!

---

## 🎉 Expected Results

After adding DMARC and following best practices:

| Metric | Before DMARC | After DMARC + Warm-up |
|--------|--------------|----------------------|
| Inbox delivery | ~60-70% | ~95%+ |
| Junk folder | ~30-40% | <5% |
| Open rate | Lower | Higher (more visible) |
| Trust from providers | Low | Building steadily |

---

## 📁 Reference

**Domain:** `mg.aidriven.biz`  
**From Address:** `Gerhard (AI Driven) <gerhard@mg.aidriven.biz>`  
**DMARC Record:** `_dmarc.mg.aidriven.biz` → `v=DMARC1; p=none; rua=mailto:gerhard@aidriven.biz; fo=1`

---

*AI Driven | Practical AI for real businesses*
