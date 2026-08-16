# Meta 2FA Recovery Guide

## Current Setup (✅ SECURE)
- **Primary 2FA:** Google Authenticator
- **Account:** gerhard@aidriven.biz (Gerhard W Stimie)
- **Business:** AI Driven (aidriven.biz)
- **WhatsApp Number:** +27 66 027 8366

## How to Access Security Settings
The Developer Portal inherits 2FA from your **personal Facebook account**.

**Direct link:** https://www.facebook.com/settings?tab=security

**Manual path:**
1. Go to facebook.com (main site)
2. Profile icon → Settings & Privacy → Settings
3. Security and Login → Two-Factor Authentication → Edit

## Backup Codes Location
Store backup codes in:
- [ ] Password manager (Bitwarden, 1Password, etc.)
- [ ] Printed copy in safe place
- [ ] Encrypted file in workspace

## If Locked Out Again
1. Try WhatsApp-based 2FA code delivery (worked 2026-08-13)
2. Use backup codes if available
3. Account recovery: https://www.facebook.com/hacked
4. Business Support: https://business.facebook.com/support

## Critical Assets
- **WhatsApp Business Account ID:** 4713904522229723
- **Phone Number ID:** 1200711009799782
- **Cloudflare Worker:** aidriven-whatsapp-webhook
- **Credentials:** See `whatsapp/.env`

## Lessons Learned
- ❌ NEVER rely solely on SMS for 2FA
- ✅ Always use authenticator app (Google Authenticator, Authy)
- ✅ Always generate and save backup codes
- ✅ Document recovery paths BEFORE you need them

---
*Created: 2026-08-13 after Meta 2FA lockout crisis resolved*
