# Workspace Cleanup Plan
**Date:** 2026-08-21  
**Goal:** Archive redundant files, keep workspace organized

---

## 📊 Current State
- **due-diligence-mvp/**: 147 files (many test scripts, old versions, duplicates)
- **whatsapp/**: 58 files (multiple worker versions, test scripts)

---

## ✅ KEEP - Active Production Files

### due-diligence-mvp/ (Keep These)
```
✅ FINAL_FINAL_onFormSubmit.js          - Apps Script (DEPLOYED)
✅ PROJECT_STATUS_FINAL.md              - Current project status
✅ SESSION_STATUS.md                    - Session notes reference
✅ GOOGLE_FORM_SETUP.md                 - Form configuration docs
✅ GOOGLE_SHEET_TRACKING_SETUP.md       - Sheet setup docs
✅ MANUAL-WORKFLOW-RATES-COUNCIL.md     - Manual processing guide
✅ QUICK-REFERENCE-MANUAL-PROCESSING.md - Quick reference
```

### whatsapp/ (Keep These)
```
✅ worker-v5-mailgun-fixed-CORRECTED.js - Cloudflare Worker (DEPLOYED)
✅ report-template-v2.js                - Report template
✅ poll-manual-requests.js              - Cron job for manual queue
✅ .env                                 - Environment variables
✅ WORKER_V5_FIX_NOTES.md               - Deployment notes
✅ EMAIL_NOT_SENDING_DEBUG.md           - Troubleshooting guide
```

---

## 📦 ARCHIVE - Move to `archive/2026-08-old-versions/`

### due-diligence-mvp/ Archive List

**Old Apps Script Versions:**
- `DEBUG_onFormSubmit.js`
- `FIXED_onFormSubmit.js`
- `FIXED_onFormSubmit_v2.js`
- `FINAL_FIXED_onFormSubmit.js`

**Test Scripts (Python):**
- All `test-*.py` files (15+ files)
- All `debug_*.py` files
- `quick_test_report.py`
- `generate_test_report.py`
- `test_basic_hazards.py`
- `test_liquefaction_*.py`
- `test_napier_scrape.py`
- `test_page_capture.py`
- `test_patterns.py`
- `test-buildings-query.py`
- `test-check-hbe2.py`
- `test-easement-*.py` (all variations)
- `test-ferguson-address.py`
- `test-final-query.py`
- `test-flood-detection.py`
- `test-hawkes-bay-titles.py`
- `test-known-titles-for-easements.py`
- `test-leaflet.py`
- `test-linz-*.py` (all variations)
- `test-meeanee-area.py`
- `test-nztm.py`
- `test-parcels-query.py`
- `test-specific-title.py`
- `test-title-parcel-link.py`
- `test-working-query.py`

**Old Scrapers & Extractors:**
- `easements_extractor.py` (duplicate of v2)
- `fetch_building_outlines.py`
- `fetch_buildings_simple.py`
- `fetch_hazards.py`
- `extract_from_rid.py`
- `inspect_dropdown.py`
- `inspect_liquefaction_layer.py`
- `napier_*.py` (all 7 scraper variations)
- `rates_scraper.py` (old version)
- `rates_scraper_real.py`
- `scrape_napier_rates.py`
- `reverse-lookup-address.py`
- `find-address-for-dp-405604.py`
- `find-test-property.py`
- `find-title-with-easements.py`
- `simple-find-test.py`

**Report Generators:**
- `generate_report_with_rates.py`
- `generate-report.py`
- `generate-tier1-report.py`
- `pdf_generator.py`
- `report_generator.py`
- `report_generator_enhanced.py`
- `quick_test_report.py`
- `test_report_with_rates.py`

**Data Files:**
- `hawkes-bay-titles-full.json`
- `hbe2-765-full.json`
- `linz-title-result.json`
- `nz-addresses-sample.json`
- `nz-titles-sample.json`
- `raw-title-data.json`
- `test-easements-result.json`
- `test-property.json`
- `titles-analysis-sample.json` (1.4MB!)
- `due-diligence-result.json`
- `logo-data-uri.txt` (61KB)
- `logo-embedded.txt` (61KB)

**Documentation (Superseded):**
- `BASIC_REPORT_HAZARDS_SUMMARY.md`
- `BETA_LAUNCH_CHECKLIST.md`
- `CACHE_README.md`
- `CURRENT_STATUS.md`
- `DEPLOYMENT-COMPLETE-V4.md`
- `EASEMENTS_FEATURE_COMPLETE.md`
- `EMAIL-TEMPLATES-MANUAL.md`
- `FORM_FIXES_SUMMARY.md`
- `IMPLEMENTATION_SUMMARY.md`
- `LINZ_EASEMENTS_INVESTIGATION.md`
- `LIQUEFACTION_IMPLEMENTATION_PLAN.md`
- `MANUAL-WORKFLOW-RATES-COUNCIL.md` (if updated version exists)
- `PAYMENT_ISSUE.md`
- `PAYMENT_UPDATE_SUMMARY.md`
- `PAYPAL_SETUP.md`
- `PROJECT_SNAPSHOT_2026-08-07.md`
- `QUICK-REFERENCE-MANUAL-PROCESSING.md` (if updated version exists)
- `RATES_INTEGRATION_GUIDE.md`
- `RATES_SCRAPER_COMPLETE.md`
- `RATES_SCRAPER_FINAL.md`
- `REPORT_GENERATION_GUIDE.md`
- `REPORT_GENERATOR_SUMMARY.md`
- `SESSION_PROGRESS_AUG08.md`
- `STRIPE_PAYMENT_LINKS.md`
- `stripe-payment-links-setup.md`
- `TEST_STATUS_SUMMARY.md`
- `TIER_LIMITATIONS_INTERNAL.md`
- `TIER1_COMPLETE.md`
- `TODO.md`
- `TRACKING_QUICK_START.md`
- `WEBSITE-UPGRADE-SUMMARY.md`

**Web Assets:**
- `index.html` (old website)
- `sales-one-pager.html`
- `website-sections-to-add.html`
- `form-header-800x200.png`
- `generate-pdf.js`
- `package.json`
- `package-lock.json`

**Miscellaneous:**
- `FACEBOOK-2FA-RecoveryCodes.txt` ⚠️ **SECURITY RISK - Delete securely instead**
- `Keegan address.txt`
- `linz-capabilities.xml`
- `check-linz-fields.py`
- `build-cache-hawkes-bay.py`
- `cache_manager.py`
- `cached_query.py`
- `performance-test.py`

### whatsapp/ Archive List

**Old Worker Versions:**
- `worker-fixed.js`
- `worker-test.js`
- `worker-with-poll.js`
- `worker-v3-conversational.js`
- `worker-v4-complete.js`
- `worker-v4-email-final.js`
- `worker-v4-manual-handler.js`
- `worker-v4-manual-support.js`
- `worker-v5-mailgun-fixed.js` (superseded by CORRECTED version)
- `worker-mailgun-simple-test.js`

**Old Poll Scripts:**
- `poll-whatsapp-requests.js`
- `poll-whatsapp-requests-v2.js`
- `poll-whatsapp-requests-v3.js`

**Test Scripts:**
- `test-api.js`
- `test-pdf-generation.js`
- `test-report-generation.js`
- `check-status.js`
- `monitor.js`
- `sandbox.py`
- `mg-aidriven-testpy.py`

**Mailgun Test Scripts (PowerShell):**
- `test-mailgun-auth.ps1`
- `test-mailgun-curl-style.ps1`
- `test-mailgun-detailed.ps1`
- `test-mailgun-diagnostic.ps1`
- `test-mailgun-external-v2.ps1`
- `test-mailgun-external.ps1`
- `test-mailgun-internal-final.ps1`
- `test-mailgun-new-key.ps1`
- `test-mailgun-send-another.ps1`
- `test-send-debug.ps1`
- `test-send-new.ps1`
- `test-send.ps1`
- `Sandbox_test.ps1`

**Documentation (Superseded):**
- `DEPLOYMENT.md`
- `DASHBOARD.md` (if not actively used)
- `DMARC-SETUP-GUIDE.md`
- `EMAIL-INTEGRATION-UPDATE.md`
- `MAILGUN-DEPLOYMENT-CHECKLIST-FINAL.md`
- `MAILGUN-DEPLOYMENT-CHECKLIST.md`
- `README.md` (if outdated)
- `RESTART-WHATSAPP.md`
- `STATUS-SUMMARY.md`
- `TOMORROW-MORNING-README.md`
- `WORKFLOWS.md`

**Large Files:**
- `logo-base64.txt` (61KB)

---

## 🗑️ DELETE - Secure Removal

**Files to delete permanently (not archive):**
- `FACEBOOK-2FA-RecoveryCodes.txt` ⚠️ **Security risk - use secure deletion tool**
- Any `.env` files with exposed credentials (if backed up elsewhere)
- Temporary test data files (`*.json` test results)

---

## 📁 Proposed New Structure

```
workspace/
├── due-diligence-mvp/
│   ├── FINAL_FINAL_onFormSubmit.js          ← ACTIVE
│   ├── PROJECT_STATUS_FINAL.md              ← ACTIVE
│   ├── SESSION_STATUS.md                    ← ACTIVE
│   ├── GOOGLE_FORM_SETUP.md                 ← REFERENCE
│   ├── GOOGLE_SHEET_TRACKING_SETUP.md       ← REFERENCE
│   ├── MANUAL-WORKFLOW-RATES-COUNCIL.md     ← REFERENCE
│   └── QUICK-REFERENCE-MANUAL-PROCESSING.md ← REFERENCE
│
├── whatsapp/
│   ├── worker-v5-mailgun-fixed-CORRECTED.js ← ACTIVE (DEPLOYED)
│   ├── report-template-v2.js                ← ACTIVE
│   ├── poll-manual-requests.js              ← ACTIVE (CRON)
│   ├── .env                                 ← CONFIG
│   ├── WORKER_V5_FIX_NOTES.md               ← DOCS
│   └── EMAIL_NOT_SENDING_DEBUG.md           ← TROUBLESHOOTING
│
├── archive/
│   └── 2026-08-old-versions/
│       ├── apps-script-old/
│       ├── workers-old/
│       ├── scrapers-old/
│       ├── test-scripts-old/
│       ├── data-files-old/
│       └── docs-old/
│
└── CLEANUP_PLAN.md (this file)
```

---

## 🔧 Cleanup Commands

### Step 1: Create Archive Structure
```powershell
New-Item -ItemType Directory -Force "C:\Users\gstim\.openclaw\workspace\archive\2026-08-old-versions\apps-script-old"
New-Item -ItemType Directory -Force "C:\Users\gstim\.openclaw\workspace\archive\2026-08-old-versions\workers-old"
New-Item -ItemType Directory -Force "C:\Users\gstim\.openclaw\workspace\archive\2026-08-old-versions\scrapers-old"
New-Item -ItemType Directory -Force "C:\Users\gstim\.openclaw\workspace\archive\2026-08-old-versions\test-scripts-old"
New-Item -ItemType Directory -Force "C:\Users\gstim\.openclaw\workspace\archive\2026-08-old-versions\data-files-old"
New-Item -ItemType Directory -Force "C:\Users\gstim\.openclaw\workspace\archive\2026-08-old-versions\docs-old"
```

### Step 2: Move Files (Example Commands)
```powershell
# Move old Apps Script versions
Move-Item "due-diligence-mvp\DEBUG_onFormSubmit.js" "archive\2026-08-old-versions\apps-script-old\"
Move-Item "due-diligence-mvp\FIXED_onFormSubmit.js" "archive\2026-08-old-versions\apps-script-old\"
# ... repeat for all files

# Move old Workers
Move-Item "whatsapp\worker-v4-*.js" "archive\2026-08-old-versions\workers-old\"
# ... etc
```

### Step 3: Secure Delete Sensitive Files
```powershell
# Use cipher.exe for secure deletion (Windows built-in)
cipher /w:"C:\Users\gstim\.openclaw\workspace\due-diligence-mvp\FACEBOOK-2FA-RecoveryCodes.txt"
Remove-Item "C:\Users\gstim\.openclaw\workspace\due-diligence-mvp\FACEBOOK-2FA-RecoveryCodes.txt"
```

---

## ⚠️ Before Deleting - Double Check!

**Verify these are NOT needed:**
1. Any scripts referenced in cron jobs
2. Any data files used by active reports
3. Any environment configs still in use
4. Any documentation linked from external systems

**Run this verification:**
```powershell
# Search for references to files before deleting
Select-String -Path "*.md" -Pattern "DEBUG_onFormSubmit|worker-v4|test_.*\.py" | Select-Object Path, LineNumber, Line
```

---

## 📊 Expected Results After Cleanup

| Folder | Before | After | Reduction |
|--------|--------|-------|-----------|
| `due-diligence-mvp/` | 147 files | ~7 files | **95% reduction** |
| `whatsapp/` | 58 files | ~6 files | **90% reduction** |
| **Total** | **205 files** | **~13 files** | **94% reduction** |

**Disk space saved:** ~2-3 MB (mostly from JSON data files and base64 logo files)

---

## ✅ Post-Cleanup Verification

After cleanup, verify:
1. ✅ Apps Script still works (submit test form)
2. ✅ Cloudflare Worker still deploys
3. ✅ Cron jobs still run (`poll-manual-requests.js`)
4. ✅ Documentation links still valid
5. ✅ No broken imports/references

---

**Ready to proceed?** Say "Execute cleanup" and I'll move all the files safely! 🧹
