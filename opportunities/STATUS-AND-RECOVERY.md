# AI Driven - System Status & Emergency Recovery

**Last Updated:** 2026-08-24 22:25 GMT+2  
**Status:** ✅ **OPERATIONAL** - Ready for Beta testing  
**Hosting:** GitHub Pages (OpenClaw repo)  
**Test Property:** 31 Douglas McLean Avenue, Marewa, Napier

---

## 🎯 Current System Status

### ✅ Core Services - OPERATIONAL
| Component | Status | Details |
|-----------|--------|---------|
| **Geocoding** | ✅ Working | LINZ API v3 (structured data) |
| **Title Data** | ✅ Working | LINZ Layer 50804 (nationwide) |
| **Easements** | ✅ Working | LINZ Layers 50782 + 51570 (40 found on test property) |
| **Hazards** | ✅ Working | Liquefaction, Flood (Gabrielle), Coastal Erosion |
| **Council Rates** | ✅ Working | Napier City + Regional Council scraping |
| **Report Generation** | ✅ Working | HTML with interactive satellite maps |
| **GitHub Pages Hosting** | ✅ Working | OpenClaw repo (public) |
| **Email Automation** | ⚠️ Paused | Mailgun API key needs refresh |
| **WhatsApp Integration** | ⚠️ Paused | Beta phase - using web form only |

### 📊 Value Proposition - VERIFIED
- **Free MyProperty:** 0 easements shown, basic rates info
- **Our Reports:** 40 easements, combined rates summary, professional formatting, hazards analysis
- **Verdict:** ✅ **Exceeds free data** - Justifies $29-99 pricing

---

## 🚀 Quick Start - Generate Fresh Report

### Prerequisites
- Node.js installed
- LINZ API key in `whatsapp/linz-api.js`
- Internet connection (LINZ servers reachable)

### Command
```bash
cd C:\Users\gstim\.openclaw\workspace
$env:NODE_OPTIONS="--dns-result-order=ipv4first"
node whatsapp/generate-complete-report.js
```

### Expected Output
```
🏠 Generating Complete Property Report
📍 Step 1/5: Geocoding address via LINZ...
   ✅ Coordinates: -39.5005800554, 176.90405875
   ✅ Title: HBE2/765
⚠️ Step 2/5: Fetching hazards data...
   ✅ Hazards assessment complete
💰 Step 3/5: Scraping council rates (optional)...
   ✅ Combined Total: $4,960.08
📄 Step 4/5: Generating HTML report...
   ✅ Report saved: reports/html/test_[timestamp].html
🚀 Step 5/5: Deploying to GitHub Pages...
   ✅ Deployed successfully!
🎉 COMPLETE! Report URL:
   https://gerhard-aidriven.github.io/OpenClaw/reports/html/test_[timestamp].html
⏳ Wait 60-90 seconds for GitHub Pages to build.
```

### Verify Deployment
1. Wait 60-90 seconds after deployment
2. Open URL in browser
3. Check for:
   - ✅ Property address matches
   - ✅ Interactive satellite map loads
   - ✅ Title data displayed (HBE2/765)
   - ✅ Easements list (should show ~40 entries)
   - ✅ Hazards section (liquefaction, flood, erosion)
   - ✅ Rates summary ($4,960.08 total)

---

## 🆘 Emergency Recovery Procedures

### Scenario 1: GitHub Pages Returns 404
**Symptoms:** Report URL shows "File not found"  
**Cause:** File not pushed to `gh-pages` branch  

**Recovery:**
```bash
cd C:\Users\gstim\.openclaw\workspace
# Check if report exists locally
ls reports/html/test_*.html

# If file exists, manually deploy:
git checkout gh-pages
git add reports/html/[filename.html]
git commit -m "Add report [filename]"
git push origin gh-pages
git checkout master
```

**Wait 60-90 seconds, then retry URL.**

---

### Scenario 2: LINZ API Fails (DNS/Network Error)
**Symptoms:** `FetchError: getaddrinfo ENOTFOUND data.linz.govt.nz`  
**Cause:** Node.js DNS resolution issue  

**Recovery:**
```bash
# Force IPv4 resolution
$env:NODE_OPTIONS="--dns-result-order=ipv4first"
node whatsapp/generate-complete-report.js
```

**If still failing:**
1. Test LINZ in browser: https://data.linz.govt.nz
2. If browser works but Node fails → DNS issue (use workaround above)
3. If browser also fails → LINZ server down (wait and retry later)

---

### Scenario 3: Workspace Files Lost/Corrupted
**Symptoms:** Missing scripts, broken imports, module not found errors  

**Recovery:**
```bash
cd C:\Users\gstim\.openclaw\workspace
# Restore from git history
git status
git restore .
# Or reset to last known good commit
git log --oneline -10
git reset --hard [commit-hash]
```

**Critical files to verify:**
- `whatsapp/generate-complete-report.js` (report generator)
- `whatsapp/linz-api.js` (geocoding)
- `whatsapp/hazards-api.js` (hazards data)
- `whatsapp/report-engine-v2.js` (HTML generation)
- `reports/html/` directory (deployed reports)

---

### Scenario 4: GitHub Pages Not Building
**Symptoms:** Report deployed but shows old version or blank page  

**Recovery:**
1. Check GitHub Actions: https://github.com/Gerhard-AIDriven/OpenClaw/actions
2. Look for failed Page build jobs
3. If build failed → check error logs
4. Common fixes:
   - Ensure `reports/html/` directory exists in `gh-pages` branch
   - Verify file permissions (should be readable)
   - Try force-push: `git push origin gh-pages --force`

---

### Scenario 5: Email Automation Broken
**Symptoms:** Reports generated but emails not sent  

**Recovery:**
1. Check Mailgun API key in script
2. Verify domain: `mg.aidriven.biz`
3. Test Mailgun credentials:
   ```bash
   curl -s --user 'api:[YOUR_KEY]' \
     https://api.mailgun.net/v3/mg.aidriven.biz/messages \
     -F from='gerhard@mg.aidriven.biz' \
     -F to='test@aidriven.biz' \
     -F subject='Test' \
     -F text='Test email'
   ```
4. If API key expired → regenerate in Mailgun dashboard

---

## 📁 Critical File Locations

| File | Purpose | Path |
|------|---------|------|
| Report Generator | Creates complete reports | `whatsapp/generate-complete-report.js` |
| LINZ API | Geocoding + title data | `whatsapp/linz-api.js` |
| Hazards API | Natural hazards assessment | `whatsapp/hazards-api.js` |
| Report Engine | HTML template + map | `whatsapp/report-engine-v2.js` |
| Deployed Reports | Live reports on GitHub Pages | `reports/html/*.html` |
| Worker Script | WhatsApp webhook handler | `whatsapp/worker-v6-token-hardcoded.js` |
| Polling Script | Auto-report generation | `whatsapp/poll-automated-reports-v2.js` |

---

## 🔑 API Keys & Credentials

| Service | Key/Token | Location | Status |
|---------|-----------|----------|--------|
| **LINZ API** | `b2e35a...5255` | `whatsapp/linz-api.js` | ✅ Active |
| **Mailgun** | `46490b...1ae8` | Scripts (needs refresh) | ⚠️ Needs update |
| **Cloudflare Worker** | `aidriv...K9mP` | `whatsapp/poll-automated-reports-v2.js` | ✅ Active |
| **GitHub** | Personal Access Token | Git config | ✅ Active |

---

## 🌐 Public URLs

| Resource | URL |
|----------|-----|
| **Live Reports** | https://gerhard-aidriven.github.io/OpenClaw/reports/html/ |
| **Test Report (latest)** | https://gerhard-aidriven.github.io/OpenClaw/reports/html/test_1787602698380.html |
| **Worker Endpoint** | https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev |
| **OpenClaw Repo** | https://github.com/Gerhard-AIDriven/OpenClaw |
| **AIdriven Website Repo** | https://github.com/Gerhard-AIDriven/AIdriven-website |

---

## 📋 Pre-Beta Checklist

Before resuming Beta testing (after NZ move):

- [ ] Run fresh test report generation
- [ ] Verify all data sources loading correctly
- [ ] Confirm GitHub Pages deployment working
- [ ] Test report URL loads in browser
- [ ] Refresh Mailgun API key (if sending emails)
- [ ] Verify Google Form submission workflow
- [ ] Test end-to-end: Form → Worker → Report → Email
- [ ] Document any issues in `memory/YYYY-MM-DD.md`

---

## 🎯 Next Steps (Post-Move)

1. **Week 1 (Late August):** Final tech stack testing
   - Generate 5-10 test reports with various properties
   - Verify all data sources consistent
   - Fix any remaining bugs

2. **Week 2 (Early September):** Soft Beta launch
   - Enable Google Form on website
   - Process first real customer requests
   - Gather feedback on report quality

3. **Week 3-4 (Mid-Late September):** Full Beta
   - Market to small network (friends, colleagues)
   - Refine pricing based on feedback
   - Prepare for public launch

4. **October 2026:** Public Launch
   - Website live with full automation
   - Marketing campaign begins
   - Monitor and iterate

---

## 📞 Emergency Contacts

| Role | Contact | Notes |
|------|---------|-------|
| **Technical Lead** | Gerhard Stimie | gerhard@aidriven.biz |
| **LINZ Support** | support@linz.govt.nz | API issues |
| **GitHub Support** | https://support.github.com | Pages/Repo issues |
| **Mailgun Support** | https://support.mailgun.com | Email delivery |

---

## 📝 Session Notes - 2026-08-24

### What Happened Today
- ✅ Migrated from Cloudflare Pages to GitHub Pages (successful)
- ✅ Recovered workspace after catastrophic file loss
- ✅ Rebuilt test report generator script
- ✅ Verified full tech stack operational
- ⚠️ Discovered AIdriven-website repo GitHub Pages not serving (using OpenClaw repo instead)

### Lessons Learned
- Always deploy to OpenClaw repo (stable, verified working)
- Use `$env:NODE_OPTIONS="--dns-result-order=ipv4first"` for LINZ API
- Wait 60-90 seconds after git push before testing URLs
- Keep backup of critical scripts in git history

### Outstanding Items
- Mailgun API key refresh (low priority - can test manually)
- AIdriven-website GitHub Pages enablement (optional - OpenClaw works fine)
- Official LINZ hazards layers research (post-launch improvement)

---

**Document Maintained By:** Seb (AI Assistant)  
**Review Frequency:** Before each Beta testing session  
**Last Verified:** 2026-08-24 22:25 GMT+2
