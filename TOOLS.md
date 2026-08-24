# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Gmail Signature Setup

**Important:** When pasting HTML signatures into Gmail:
- ❌ Do NOT copy from text editor (Notepad, VSCode) — Gmail treats it as plain text
- ✅ DO copy from browser (Chrome, Edge, Firefox) — browser renders the HTML properly
- **Process:** Open .html file in browser → Select all content → Copy → Paste into Gmail signature box

This applies to any HTML you need to paste into Gmail.

## Food Shortcuts & Standards

**Feta** = Spar South African Feta Cheese Plain (default)
**Wrap** = Spar Large Brown Wrap
  - Per wrap: 887 kJ | 6.6g protein | 35g carbs | 1.1g fat

**Bread (Albany low-GI wholewheat)** = per 100g: 1015 kJ | 11.2g protein | 3.8g carbs | 3.4g fat
  - Per 1 slice (45g): 457 kJ | 5.0g protein | 1.7g carbs | 1.5g fat

## Nutrition Values (User-Specified)
These override generic estimates for accuracy:
- **Spar Large Brown Wrap:** 887 kJ | 6.6g protein | 35g carbs | 1.1g fat
- **Alpen Muesli:** per 100g — 348 kcal | 12.3g protein | 58g carbs | 5.0g fat
- **Lancewood yogurt:**
  - Per 100g: 130 kJ | 5.3g protein | glycaemic carbs 2g (sugars 1.8g) | fat 0.3g | sodium 58mg | calcium 139mg | fibre <0.5g
- **Clover Authentikos Greek Style Double Cream Plain Yoghurt (greek yogurt):**
  - Per 100g: 353 kJ | 5.1g protein | 6g carbs (of which 4.5g sugar) | 5.0g fat
- **Spar Low Fat Plain Yogurt:**
  - Per 100g: 177 kJ | 3g protein | 4g carbs | 1.5g fat
- **Capedry bar snack mix:** per 100g — 478 kcal | 14.3g protein | 50.7g carbs | 25.5g fat
- **Cani refined sugar free rusks:** per 100g — 1832 kJ | 10.4g protein | 35.1g carbs | 27.4g fat
- **Iwisa Instant Maize Porridge:**
  - Per 150g serving: 301 kcal | 65g carbs | 5.2g protein | 1.6g fat

---

## 🏛️ Napier MyProperty Scraper - CRITICAL USAGE NOTES

**DO NOT CHANGE THIS WITHOUT TESTING FIRST!**

### Working URL Format
```
https://data.napier.govt.nz/regional/ncc/property_find.php?search={ADDRESS}&type=address
```

Example:
```
https://data.napier.govt.nz/regional/ncc/property_find.php?search=31%20Douglas%20McLean%20avenue&type=address
```

### Address Format Requirements

**✅ CORRECT format for scraper:**
- `"31 Douglas McLean avenue"` (lowercase 'a' in avenue)
- `"123 Shakespeare Road"` 
- Just street number + street name + street type
- NO suburb, NO city, NO postcode

**❌ WRONG format (will fail):**
- `"31 Douglas McLean Avenue, Marewa, Napier, 4110"` (too much info)
- `"31 Douglas McLean Ave"` (abbreviated street type)
- `"Unit 5, 31 Douglas McLean Avenue"` (unit numbers may not work)

### How the Scraper Works

**Two-step process:**
1. **Step 1:** Query `data.napier.govt.nz` JSON API to get RID (Record ID)
   - URL: `https://data.napier.govt.nz/regional/ncc/property_find.php?search={ADDRESS}&type=address`
   - Returns: `{"id": "12345", "value": "31 Douglas McLean avenue"}`
   
2. **Step 2:** Open My Property page with RID using Playwright
   - URL: `https://www.napier.govt.nz/services/properties-and-rates/my-property/?rid={RID}`
   - Scrapes: Capital value, land value, rates, easements, building consents

### Integration with Report System

In `poll-automated-reports-v2.js`:
```javascript
// Extract street address only for scraper
let scraperAddress = `${addressStructured.houseNumber} ${addressStructured.streetName} ${addressStructured.streetType}`;
// Example: "31 Douglas McLean Avenue"

// Pass to scraper
python napier_rates_scraper.py "{scraperAddress}"
```

### Troubleshooting

**If scraper returns "No results found":**
1. Check if address format is correct (no suburb/city/postcode)
2. Try lowercase street type: "avenue" not "Avenue"
3. Verify property exists on MyProperty website manually
4. Some properties (new subdivisions, leasehold) may not be indexed yet

**Manual verification:**
1. Go to: https://data.napier.govt.nz/regional/ncc/property_find.php
2. Search: `{HOUSE_NUMBER} {STREET_NAME} {STREET_TYPE}` (lowercase)
3. If it returns an RID, the property is indexed
4. If no results, property isn't in the system yet

### Properties Outside Napier City

**Hastings District properties** (e.g., Bluff Hill, some Marewa areas):
- ❌ Won't work with Napier scraper
- ℹ️ Will show "Title data unavailable" in reports
- 🔮 Future: Need Hastings Council scraper or LINZ Titles API integration

---

Add whatever helps you do your job. This is your cheat sheet.
