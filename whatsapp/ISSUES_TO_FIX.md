# Issues to Fix - Property Due Diligence System

## 1. ✅ Email Branding (WRONG)
**Problem:** Email templates don't match aidriven.biz website theme (orange/purple gradients, Rajdhani font)
**Current:** Basic green/white template
**Fix Needed:** Update `poll-automated-reports-v2.js` email HTML to match report template branding

## 2. ❌ Geocoding Wrong (CRITICAL)
**Problem:** Map pin shows wrong location
**Example:** 64A Vigor Brown Street mapped to [-39.4928, 176.912] (incorrect)
**Expected:** Should use exact LINZ coordinates from structured address matching
**Root Cause:** Report engine not using coordinates from LINZ API response properly
**Fix:** Ensure `linz-api-structured.js` returns correct coords and report engine uses them

## 3. ⚠️ Map Frame Size
**Problem:** Map too large
**Fix:** Reduce map height by 20% in report template CSS

## 4. ❌ Hazards Map Links Not Activated
**Problem:** Liquefaction, flood, erosion map links are placeholders
**Fix:** Add actual LINZ WFS hazard layer URLs or interactive toggles in map

## 5. ❌ Title Details & Easements Outstanding
**Problem:** LINZ title data not displaying properly
**Fix:** Parse and display full title information from LINZ API response

## 6. ❌ Rates Information Missing
**Problem:** Rates data requires manual intervention but no workflow exists
**Fix:** 
- Add manual rates upload feature
- Or integrate with council API if available
- For now: Add placeholder section in report for manual entry

---

## Priority Order:
1. **Geocoding** (breaks trust)
2. **Title Details** (core value)
3. **Email Branding** (professional image)
4. **Hazards Links** (useful feature)
5. **Map Size** (cosmetic)
6. **Rates** (manual add-on)
