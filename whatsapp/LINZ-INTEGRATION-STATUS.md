# LINZ Integration Status - Current State

## 🎯 Objective
Integrate LINZ Titles API to provide **nationwide, official property title data** as our competitive differentiator.

## Current Architecture (Beta)

```
Google Form → Cloudflare Worker → Queue → OpenClaw Poll
    ↓
LINZ Geocoding API ✅ (works perfectly)
    ↓
Napier MyProperty Scraper ⚠️ (Napier only, not scalable)
    ↓
Hazards API ✅ (works nationwide)
    ↓
Report Generation → Email
```

## What's Working ✅
1. **LINZ Geocoding:** Converts addresses to coordinates flawlessly
2. **Napier Scraper:** Extracts title/rates data for Napier properties
3. **Hazards API:** Nationwide coverage for liquefaction/flood/erosion
4. **Report Engine:** Generates professional HTML reports
5. **Email Delivery:** Automated with live links

## What's Missing ❌
1. **LINZ Titles API:** Not yet integrated (our key differentiator)
2. **Nationwide Coverage:** Scraper only works for Napier
3. **Competitive Edge:** Currently repackaging free council data

## The Gap
**Problem:** Everything we currently provide is available for free on council websites (MyProperty for Napier, Hastings Maps for Hastings, etc.).

**Solution:** LINZ Titles API integration provides:
- Official title ownership data
- Complete easement registries
- Legal descriptions
- Nationwide coverage
- Professional credibility

**Without LINZ:** We're a nice UI over free data.  
**With LINZ:** We're a professional due diligence tool worth paying for.

## Next Steps
See `opportunities/todo-linz-integration.md` for detailed implementation plan.

**Priority:** 🔴 **CRITICAL** - This is the make-or-break feature for the business.

---

*Last updated: 2026-08-24*
