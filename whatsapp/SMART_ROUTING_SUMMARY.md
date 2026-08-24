# Smart Routing System - Summary

## Overview
Implemented intelligent routing to automatically determine whether a property due diligence request can be processed automatically or requires manual intervention.

## Problem Solved
Previously, ALL requests with rates/council add-ons were flagged for manual processing, even when:
- The property was in Napier (which we can now scrape automatically)
- The address could be resolved via the NCC API

Now the system intelligently routes based on:
1. **Location**: Is it a Napier property?
2. **Data Availability**: Can we find it in the MyProperty system?

## Changes Made

### 1. Cloudflare Worker (`worker-v6-token-hardcoded.js`)

#### New Function: `checkNapierAddress(address)`
```javascript
async function checkNapierAddress(address) {
  // Returns: { isNapier: boolean, hasRID: boolean, rid: string|null }
}
```

**What it does:**
- Detects Napier addresses using keywords (Napier, Taradale, Greenmeadows, Westshore, Marewa, Poraiti)
- Calls NCC Property Find API to resolve address → RID
- Returns status indicating if automated processing is possible

**Possible outcomes:**
- `{ isNapier: false, hasRID: false, rid: null }` → Non-Napier (manual)
- `{ isNapier: true, hasRID: false, rid: null }` → Napier but not found (manual)
- `{ isNapier: true, hasRID: true, rid: "113589-112202" }` → Napier + found (auto)

#### Updated: `handleManualQueue()` Logic
```javascript
// Check if rates addon is requested
const hasRatesAddon = addons && (addons.rates || addons['council-fees']);

if (hasRatesAddon) {
  const napierCheck = await checkNapierAddress(linzAddress);
  
  if (!napierCheck.isNapier) {
    requiresManual = true;
    automationNotes = "Non-Napier property - manual council research required";
  } else if (!napierCheck.hasRID) {
    requiresManual = true;
    automationNotes = "Napier address not found in MyProperty system";
  } else {
    automationNotes = "Napier property with RID ${rid} - automated rates fetch possible";
  }
}
```

#### Enhanced Email Templates

**Customer Confirmation Email:**
Now provides specific messaging based on routing:

- **Auto-processing**: "✅ Your request is being processed automatically... shortly (5-10 minutes)"
- **Non-Napier**: "Your request includes council rates for a property outside Napier City... 24-48 hours"
- **Not Found**: "The property address could not be automatically located... 24-48 hours"

**Gerhard Notification Email:**
Only sent when manual processing is required, with specific action items:

- **Non-Napier**: Instructions to identify correct council and access their portal
- **Not Found**: Instructions to manually search/verify address
- **Other**: Standard manual processing steps

### 2. Report Generator (`poll-automated-reports-v2.js`)
Already updated to automatically fetch rates data when available (from previous integration).

## Data Flow

### Automated Path (Napier + RID found)
```
Customer Request (with rates addon)
    ↓
Cloudflare Worker /queue-manual
    ↓
checkNapierAddress() → ✅ RID found
    ↓
Store as 'automated:{requestId}'
    ↓
Send customer email: "Processing automatically..."
    ↓
NO Gerhard notification
    ↓
OpenClaw polls /poll endpoint
    ↓
generateReport() → fetches rates via Python scraper
    ↓
Email report to customer
```

### Manual Path (Non-Napier or RID not found)
```
Customer Request (with rates addon)
    ↓
Cloudflare Worker /queue-manual
    ↓
checkNapierAddress() → ❌ Not Napier OR No RID
    ↓
Store as 'manual:{requestId}'
    ↓
Send customer email: "Manual processing (24-48h)"
    ↓
Send Gerhard notification with specifics
    ↓
Gerhard manually processes
    ↓
Mark complete via /complete endpoint
```

## Decision Matrix

| Scenario | isNapier | hasRID | Automation | Customer Message | Gerhard Notified |
|----------|----------|--------|------------|------------------|------------------|
| Napier property, RID found | ✅ | ✅ | **Automatic** | "Processing auto (5-10 min)" | ❌ No |
| Napier property, not found | ✅ | ❌ | **Manual** | "Manual lookup (24-48h)" | ✅ Yes |
| Non-Napier property | ❌ | ❌ | **Manual** | "Manual research (24-48h)" | ✅ Yes |
| No rates addon | - | - | **Automatic** | Standard auto message | ❌ No |

## Benefits

### For Customers:
- ✅ Faster turnaround for Napier properties (minutes vs hours)
- ✅ Clear expectations about processing time
- ✅ Specific messaging about what's happening

### For Gerhard:
- ✅ Only notified when manual work is actually needed
- ✅ Clear reason why manual work is required
- ✅ Tailored action items based on the issue
- ✅ Reduced manual workload (Napier properties auto-processed)

### For the Business:
- ✅ Scalable automation (Napier properties require zero manual work)
- ✅ Better customer experience
- ✅ Efficient use of manual effort (only where truly needed)

## Testing Scenarios

### Test Case 1: Napier Address (Should Auto-Process)
```json
{
  "address": "31 Douglas McLean Avenue, Napier",
  "addons": { "rates": true }
}
```
**Expected**: `requiresManual: false`, no Gerhard notification

### Test Case 2: Hastings Address (Should Manual)
```json
{
  "address": "101 Karamu Road, Hastings",
  "addons": { "rates": true }
}
```
**Expected**: `requiresManual: true`, Gerhard notified with "Non-Napier" instructions

### Test Case 3: Invalid Napier Address (Should Manual)
```json
{
  "address": "999 Fake Street, Napier",
  "addons": { "rates": true }
}
```
**Expected**: `requiresManual: true`, Gerhard notified with "not found" instructions

### Test Case 4: No Rates Addon (Should Auto-Process)
```json
{
  "address": "31 Douglas McLean Avenue, Napier",
  "addons": {}
}
```
**Expected**: `requiresManual: false`, standard auto-processing

## Files Modified

1. **`worker-v6-token-hardcoded.js`** (Cloudflare Worker)
   - Added `checkNapierAddress()` function
   - Updated `handleManualQueue()` logic
   - Enhanced `generateCustomerConfirmationEmail()`
   - Enhanced `generateGerhardNotificationEmail()`

2. **`poll-automated-reports-v2.js`** (OpenClaw Report Generator)
   - Already integrated with Python rates scraper (previous work)

## Deployment Notes

### Cloudflare Worker Deployment
```bash
# Deploy to production
wrangler deploy worker-v6-token-hardcoded.js \
  --name aidriven-whatsapp-webhook \
  --route aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/*
```

### Required Environment Variables
- `POLL_API_TOKEN` (already hardcoded in v6)
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `GERHARD_EMAIL` (optional, defaults to gstimie@gmail.com)

### KV Storage
Ensure `REPORT_QUEUE_KV` namespace is bound in wrangler.toml:
```toml
[[kv_namespaces]]
binding = "REPORT_QUEUE_KV"
id = "<your-kv-namespace-id>"
```

## Future Enhancements

1. **Multi-Council Support**: Add similar scrapers for Hastings, Wellington, etc.
2. **Confidence Scoring**: Use LINZ data to improve address matching confidence
3. **Fallback Logic**: Try alternative address formats if initial lookup fails
4. **Analytics**: Track auto vs manual split to measure automation success rate

---

**Implementation Date**: 2026-08-23
**Status**: ✅ Ready for Deployment
**Next Step**: Deploy worker-v6-token-hardcoded.js to Cloudflare
