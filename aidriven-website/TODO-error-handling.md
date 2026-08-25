# TODO: Error Handling for Property Not Found

**Priority:** 🔴 CRITICAL - Blocker for Monday launch  
**Estimated Time:** 30-45 minutes  
**Test Case:** 10 Russel Road, Napier (WhatsApp Standard request)

---

## Problem

When LINZ WFS returns no parcels or only fallback data, the system currently:
- Generates a report with placeholder data ("Lot 1 DP XXXXX", "Title: N/A")
- Sends it to the customer via WhatsApp
- Looks unprofessional and erodes trust

**Expected behavior:**
- Detect the failure early
- Return an error response instead of generating a report
- Send a conversational message offering help/alternatives

---

## Root Cause

In `lib/linz-fetcher.js`, the `selectBestParcel()` function:
- Returns `null` if no parcels found in bbox
- But this `null` result isn't being checked upstream
- `generateFallbackData()` gets called, creating placeholder content

---

## Solution

### Step 1: Validate LINZ Results (`lib/linz-fetcher.js`)

After calling `selectBestParcel()`, check if result is meaningful:

```javascript
const primaryParcel = selectBestParcel(parcelData.features, coords);

if (!primaryParcel) {
  console.log('  [LINZ WFS] ❌ No valid parcel found for this location');
  throw new Error('PROPERTY_NOT_FOUND', { 
    address, 
    coords,
    suggestion: 'Try providing exact coordinates from LINZ Maps'
  });
}

// Also validate that we got real data, not just geometry
if (!primaryParcel.properties.appellation || primaryParcel.properties.appellation === 'N/A') {
  // Check if ANY parcel in the results has real data
  const hasValidParcel = parcelData.features.some(f => 
    f.properties.appellation && f.properties.appellation !== 'N/A'
  );
  
  if (!hasValidParcel) {
    console.log('  [LINZ WFS] ⚠️ Only parcels with no legal description found');
    throw new Error('PROPERTY_DATA_UNAVAILABLE', {
      address,
      coords,
      suggestion: 'This may be a new subdivision or rural property without formal survey'
    });
  }
}
```

### Step 2: Catch Errors in Report Engine (`api/report-engine.js`)

Wrap LINZ fetch in try-catch:

```javascript
try {
  const linzData = await fetchLinZData(input.address, { 
    coords: input.coords,
    timeout: 20000 
  });
  report.sections.parcel = linzData;
  // ... continue normally
} catch (error) {
  if (error.message === 'PROPERTY_NOT_FOUND' || error.message === 'PROPERTY_DATA_UNAVAILABLE') {
    // Return error report structure instead of normal report
    return {
      reportId: `RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      tier: 'ERROR',
      error: {
        code: error.message,
        friendlyMessage: 'We couldn\'t find property data for this address. This can happen with:',
        reasons: [
          'New subdivisions not yet in LINZ database',
          'Rural properties without formal survey',
          'Unit titles or cross-leases (complex ownership)',
          'Address geocoding inaccuracies'
        ],
        suggestions: [
          'Try again with exact coordinates from LINZ Maps (maps.linz.govt.nz)',
          'Contact us for manual research assistance',
          'Verify the address spelling and try again'
        ]
      },
      property: {
        address: input.address,
        coordinates: input.coords
      }
    };
  }
  
  // Re-throw unexpected errors
  throw error;
}
```

### Step 3: Handle Errors in WhatsApp Flow (`api/whatsapp-webhook.js` or poll script)

When error report detected, send conversational message:

```javascript
if (report.tier === 'ERROR') {
  const errorMsg = `Hi ${customerName},\n\n` +
    `I tried to generate your Standard Report for ${report.property.address}, but I couldn't find the property in the LINZ database.\n\n` +
    `This can happen with:\n` +
    `• New subdivisions not yet surveyed\n` +
    `• Rural properties\n` +
    `• Complex titles (unit flats, cross-leases)\n\n` +
    `Options:\n` +
    `1. Try again with exact coordinates from LINZ Maps: maps.linz.govt.nz\n` +
    `2. Reply "HELP" and I'll manually research your property\n` +
    `3. Choose a different property address\n\n` +
    `Sorry about this! Let me know how you'd like to proceed.\n\n` +
    `- Seb\nAI Driven Team`;
  
  await sendWhatsAppMessage(customerPhone, errorMsg);
  return; // Don't send report link
}
```

---

## Test Cases

After implementing, test with:

1. **Valid address:** 31 Douglas McLean Avenue, Napier → ✅ Normal report
2. **Invalid address:** 10 Russel Road, Napier → ✅ Error message (not blank report)
3. **Made-up address:** "123 Fake Street, Napier" → ✅ Error message
4. **Rural address:** "RD 5, Hastings" → ✅ Error message with helpful suggestions
5. **Exact coords provided:** Should work even if geocoding fails

---

## Success Criteria

- [ ] No blank/placeholder reports sent to customers
- [ ] Clear, conversational error messages instead
- [ ] Actionable suggestions provided (map coordinates, manual help)
- [ ] Logs clearly distinguish between success and error cases
- [ ] Tested with at least 3 different failure scenarios

---

**File Locations:**
- `lib/linz-fetcher.js` - Lines ~90-120 (after `selectBestParcel` call)
- `api/report-engine.js` - Lines ~60-80 (LINZ fetch section)
- `automation/whatsapp/poll-whatsapp-requests-v3.js` - Error handling section

**Related Issue:** Geocoding accuracy - future enhancement: map-click UI
