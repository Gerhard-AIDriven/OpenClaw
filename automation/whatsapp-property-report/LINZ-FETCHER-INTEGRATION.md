# LINZ Fetcher Integration Guide

**Status:** ✅ Working (2026-08-16)  
**Dependencies:** axios, xml2js (installed via npm)

---

## Quick Start

```javascript
const { fetchLinZData } = require('./linz-fetcher');

// Fetch property data
const result = await fetchLinZData('123 Station Street, Napier');

console.log(result);
/*
{
  legalDescription: "Lot 1 DP 5081",
  landArea: "164 m²",
  owners: "Current Registered Owners",
  tenureType: "Freehold",
  titleNumber: "N/A",
  landDistrict: "Hawkes Bay",
  status: "Current",
  source: "LINZ Data Service WFS",
  fetchedAt: "2026-08-16T..."
}
*/
```

---

## Current Limitations & TODOs

### 1. Geocoding (HIGH PRIORITY)
**Issue:** Currently returns Napier center for all addresses → same parcel results

**Solution Options:**
- **Option A:** Use OpenStreetMap Nominatim API (free, no auth needed)
  ```javascript
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  ```
  
- **Option B:** Use Google Maps Geocoding API (paid, requires API key)
  
- **Option C:** Manual coordinate input for beta testing

**Implementation Priority:** Critical for accurate property matching

---

### 2. Title Number Extraction (MEDIUM PRIORITY)
**Issue:** Title numbers not being extracted from parcel data

**Reason:** The `titles` property in parcel response may be empty or formatted differently

**Debug Steps:**
1. Log full parcel properties to see actual field names
2. Check if titles are in a different format (e.g., comma-separated string vs array)
3. May need to query title-parcel association table (table-51569)

**Workaround:** Query title estate table by spatial location instead of title number

---

### 3. Owner Names (LOW PRIORITY)
**Issue:** Not extracting actual owner names from title data

**Reason:** Privacy restrictions - LINZ may not provide owner names via WFS

**Alternative:** 
- Keep browser automation fallback for owner lookup
- Or indicate "Registered proprietors on title" as placeholder

---

## Integration with Report Engine

### Example: Update report-engine.js

```javascript
const { fetchLinZData } = require('./linz-fetcher');

async function generateReport(propertyAddress) {
  // Step 1: Fetch LINZ data
  const linzData = await fetchLinZData(propertyAddress);
  
  // Step 2: Fetch council rates data
  const ratesData = await fetchRatesData(propertyAddress);
  
  // Step 3: Fetch hazard data
  const hazardData = await fetchHazardData(propertyAddress);
  
  // Step 4: Compile report
  const report = {
    property: {
      address: propertyAddress,
      legal: linzData.legalDescription,
      area: linzData.landArea,
      title: linzData.titleNumber
    },
    ownership: {
      owners: linzData.owners,
      tenure: linzData.tenureType
    },
    rates: ratesData,
    hazards: hazardData,
    generatedAt: new Date().toISOString()
  };
  
  return report;
}
```

---

## Testing

### Run test suite:
```bash
npm test
```

### Test specific address:
```javascript
node -e "require('./linz-fetcher').fetchLinZData('123 My Street, Napier').then(console.log)"
```

---

## Performance Notes

- **Typical response time:** 2-5 seconds per request
- **Rate limits:** LINZ allows reasonable usage (monitor for 429 errors)
- **Caching:** Consider caching results for 24h to reduce API calls

---

## Error Handling

The fetcher includes built-in fallback:
- If WFS fails → returns fallback data with "Unverified" status
- Always check `result.source` to know if data is real or fallback

```javascript
if (result.source === 'Fallback (WFS unavailable)') {
  console.warn('Using fallback data - verify manually');
}
```

---

## Next Development Steps

1. ✅ **DONE:** Implement WFS authentication
2. ✅ **DONE:** Fetch parcel data by bounding box
3. ✅ **DONE:** Parse JSON responses
4. ⏳ **TODO:** Implement proper geocoding (Nominatim API)
5. ⏳ **TODO:** Improve title number extraction
6. ⏳ **TODO:** Add unit tests
7. ⏳ **TODO:** Implement caching layer

---

*Guide by Seb | AI Driven | 2026-08-16*
