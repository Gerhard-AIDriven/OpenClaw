# Worker V5 Fix - Manual Processing Email Bug

## Problem
Worker was hardcoding `requiresManualProcessing: true` and sending emails even when Apps Script sent `false`.

## Solution
1. Read `requiresManualProcessing` from payload instead of hardcoding
2. Only send emails when `requiresManualProcessing === true`
3. Show correct timeline in customer email (24-48h for manual, 15-60min for automated)

## Changes Made

### Line ~70: Extract requiresManualProcessing from payload
```javascript
const { requestId, customer, address, package: pkg, addons, requiresManualProcessing, notes } = body;
```

### Line ~86: Use payload value instead of hardcoded true
```javascript
requiresManualProcessing: requiresManualProcessing === true, // Use value from payload
```

### After line ~97: Check flag before sending emails
```javascript
console.log(`✅ Manual request queued: ${requestId}`);
console.log(`   Requires Manual Processing: ${requiresManualProcessing}`);

// Only send emails if manual processing is actually required
if (requiresManualProcessing !== true) {
  console.log('ℹ️ No manual processing required - skipping email notifications');
  
  return new Response(JSON.stringify({
    success: true,
    requestId,
    status: 'queued_for_auto_processing',
    message: 'No manual processing required'
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

// Send email notifications via Mailgun (only for manual processing requests)
const emailPromises = [];
```

### Customer email: Dynamic timeline based on processing type
```javascript
const isManual = requiresManualProcessing === true;
// ... in email template:
${isManual ? '\n⏱️ Timeline: Since your request includes manual processing items...' : '\n⏱️ Timeline: Your automated report will be generated within 15-60 minutes...'}
```

## Deployment Steps

1. Open Cloudflare Dashboard → Workers & Pages
2. Select `aidriven-whatsapp-webhook` worker
3. Click "Edit" on the code
4. Apply the changes above (or replace entire file)
5. Click "Deploy"
6. Test with no add-ons selected

## Expected Behavior After Fix

### Test 1: NO Add-ons Selected
- ✅ Customer receives confirmation email
- ❌ Gerhard does NOT receive manual processing notification
- ✅ Customer email shows "15-60 minutes" timeline

### Test 2: WITH Add-ons (Rates/Council)
- ✅ Customer receives confirmation email
- ✅ Gerhard DOES receive manual processing notification
- ✅ Customer email shows "24-48 hours" timeline

---

**File:** `C:\Users\gstim\.openclaw\workspace\whatsapp\worker-v5-mailgun-fixed.js`
**Date Fixed:** 2026-08-21 08:30 GMT+2
