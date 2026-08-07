# 🚀 Quick Setup Guide - Report Generator

**Time required:** 15 minutes  
**Status:** Ready to build

---

## Step 1: Get Your LINZ API Key (5 minutes) ⚠️ **REQUIRED**

This is the ONLY manual setup step. Everything else is automated.

### Do This Now:

1. Go to: **https://www.linz.govt.nz/developers**
2. Click **"Get an API key"** or **"Register for API access"**
3. Fill in the form:
   ```
   Name: Gerhard Stimie
   Email: gerhard@aidriven.biz
   Organization: AI Driven
   Intended use: Property due diligence reports for real estate buyers and investors
   ```
4. Submit → You'll receive API key instantly (check email + spam folder)
5. Create file: `C:\Users\gstim\.openclaw\workspace\due-diligence-mvp\report-generator\config\linz-api-key.txt`
6. Paste your API key into that file (just the key, nothing else)
7. Save the file

✅ **Done?** Test it works by running a sample report!

---

## Step 2: Install Dependencies (3 minutes)

Open PowerShell in the report-generator folder:

```bash
cd C:\Users\gstim\.openclaw\workspace\due-diligence-mvp\report-generator
npm install
```

This installs Puppeteer (already have it, but this ensures correct version).

**Wait for:** `added X packages in XXs`

✅ **Done?** Dependencies installed!

---

## Step 3: Test with Sample Property (5 minutes)

Run a test report generation:

```bash
node generate-report.js "42 Marewa Road, Marewa, Napier"
```

**What happens:**
1. Script fetches LINZ title data automatically ✅
2. Opens Napier GIS map in browser 🌐
3. Opens OneRoof.co.nz for valuation data 🏠
4. Prompts you to enter values from websites ⌨️
5. Generates HTML report 📄
6. Converts to PDF ✅

**Expected output:**
```
🚀 AI Driven - Property Due Diligence Report Generator
============================================================

Property: 42 Marewa Road, Marewa, Napier
Order ID: DD-260806-001

[1/6] Fetching LINZ title data...
  ✅ Title: NA4521/89
  ✅ Owners: John Smith, Jane Smith
  ✅ Area: 658 m²

[2/6] Checking council hazard maps...
  → Opening Napier GIS map...
  ⚠️ Council data requires manual verification

[3/6] Manual data entry required
  → Opening OneRoof in browser...

Please enter the following values:
Capital Value (e.g., 685000): $ [you type: 685000]
...
```

**Total time:** ~10 minutes for first test

✅ **PDF generated?** Perfect! System works!

---

## Step 4: Generate Your First Real Report

When you get a real order:

### A. Get Order Details from Google Sheet
- Customer name
- Property address
- Package type (Basic/Standard/Premium)
- Email address

### B. Run Generator

```bash
node generate-report.js "123 Smith Street, Marewa, Napier"
```

### C. Enter Data When Prompted
Script will open browsers and ask you to copy-paste:
- Capital value (from OneRoof)
- Annual rates
- Flood hazard (Yes/No)
- Liquefaction risk (Low/Medium/High)
- Zoning code
- Risk rating (1-5)

### D. Review Generated PDF
File location: `output/DD-YYMMDDD-XXX-basic.pdf`

Open it, check for:
- ✅ All data correct
- ✅ No formatting issues
- ✅ Disclaimers present
- ✅ Contact info correct

### E. Email to Customer

Subject: Your Property Due Diligence Report - Order #[ORDER-ID]

```
Hi [Customer Name],

Great news! Your Basic Property Due Diligence Report for [Address] is ready.

ATTACHED: DD-[ORDER-ID]-basic.pdf

WHAT'S INCLUDED:
✓ Legal title details from LINZ
✓ Natural hazard assessment (flood, liquefaction)
✓ Zoning information
✓ Capital value & annual rates
✓ Risk summary & recommendations

IMPORTANT: This is an informational report only, NOT a legal LIM. 
Before settlement, please obtain:
- Formal LIM from council
- Independent building inspection
- Legal advice from your solicitor

NEXT STEPS:
1. Review the report carefully
2. Share with your solicitor if you have questions
3. Consider ordering a Standard or Premium report for investment analysis

SUPPORT:
Reply to this email or call me on 021 402 8807 if you need clarification.

Thanks for choosing AI Driven!

Cheers,
Gerhard Stimie
AI Driven | Practical AI for Real Businesses
gerhard@aidriven.biz
021 402 8807
```

### F. Update Google Sheet
- Column P (Payment Status): Pending → Paid
- Column Q (Payment Date): =NOW()
- Column R (PayPal TX ID): From PayPal email
- Column S (Report Status): Not Started → Delivered
- Column T (Delivered Date): =NOW()
- Column U (Delivery Method): Email

---

## Troubleshooting

### ❌ "LINZ API key not found"
**Fix:** Create `config/linz-api-key.txt` with your key

### ❌ "Cannot find module 'puppeteer'"
**Fix:** Run `npm install` in report-generator folder

### ❌ Council website doesn't load
**Fix:** 
- Check internet connection
- Try Hastings instead of Napier (or vice versa)
- Manual mode: Open council website yourself, copy-paste data

### ❌ PDF looks cut off or weird
**Fix:**
- Check HTML template has no errors
- Re-run generator
- If persists, manually adjust margins in generate-report.js line 252

### ❌ OneRoof won't let me search
**Fix:**
- Some properties not on OneRoof
- Use QuotableValue.co.nz instead
- Or skip valuation data (mark as "Not available")

---

## How Long Does It Take?

| Task | Time |
|------|------|
| First test report | 10-15 min |
| After practice (5+ reports) | 7-10 min |
| Expert speed (50+ reports) | 5-7 min |

**Goal:** Under 10 minutes per Basic report

---

## What's Automated vs Manual?

### ✅ Automated:
- LINZ title fetch (API)
- HTML report generation
- PDF conversion
- File naming & saving

### ⚠️ Semi-Automated (You Verify):
- Council hazard data (browser opens, you confirm)
- OneRoof valuation (you copy-paste)
- Risk rating (your judgment call)

### 🔮 Future Automation (Phase 3):
- Council GIS scraping (no manual verification)
- OneRoof auto-extraction
- Auto-risk calculation based on hazards

---

## Pro Tips

### 1. Keep Browser Windows Organized
- Left monitor: LINZ + Council GIS
- Right monitor: OneRoof + Terminal
- Faster copy-paste workflow

### 2. Use Keyboard Shortcuts
- Alt+Tab: Switch between browsers
- Ctrl+C / Ctrl+V: Copy-paste values
- Alt+Enter: Quick property switch

### 3. Build a Data Library
Save common values in a text file:
```
Napier Zones:
- R1: Single residential
- MDU: Medium density
- B1: Business commercial

Liquefaction Guide:
- Low: Green zone, no issues
- Medium: Yellow, may need engineering
- High: Red, specialist report needed
```

### 4. Batch Process Orders
If you get 3-4 orders same day:
- Run all LINZ fetches first
- Then all council checks
- Then all OneRoof lookups
- Assembly line approach = faster

---

## Ready to Start?

1. ✅ Get LINZ API key (Step 1)
2. ✅ Install dependencies (Step 2)
3. ✅ Run test report (Step 3)
4. ✅ Generate first real report (Step 4)

**Questions?** Check IMPLEMENTATION_PLAN.md for technical details.

**Let's go!** 🚀
