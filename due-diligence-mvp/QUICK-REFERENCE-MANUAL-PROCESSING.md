# Quick Reference Card - Manual Processing Workflow

**Print this or keep it handy while processing manual requests**

---

## 📋 When Google Form Submission Arrives

### Check Add-ons Column in Google Sheets
```
☐ Rates Information selected?
☐ Council Fees selected?
→ If YES to either: MANUAL PROCESSING REQUIRED
```

---

## ⚡ Immediate Actions (Within 15 Minutes)

### 1. Send Acknowledgment Email
- Open Gmail → Compose
- Insert Template 1 (Canned Response: "Manual Processing Acknowledgment")
- Replace `[bracketed placeholders]`
- Send to customer email from form

### 2. Mark in Tracking Sheet
| Column | Value |
|--------|-------|
| Manual Processing Required | YES |
| Email Ack Sent | =NOW() |
| Status | Pending Manual |

---

## 🔍 Retrieve Property Data (Within 24 Hours)

### For Rates Information:

**Napier Properties:**
1. Go to: https://maps.napier.govt.nz/
2. Search property address
3. Click on property
4. Copy Property ID (RID) from URL or details panel
5. Run: `python napier_rates_extractor.py --rid <RID>`

**Hastings Properties:**
1. Go to: Hastings DC property viewer
2. Search by address
3. Copy Rateable Property ID
4. Use rates extractor with ID

**Alternative:** Call council rates department directly

### For Council Fees & Permits:

1. **Online Portal:**
   - Navigate to council building consent portal
   - Search by address/RID
   - Download consent history
   - Note any outstanding fees

2. **Phone/Email Inquiry:**
   - Call council building department
   - Request: "Building consent history and fee status for [address]"
   - Record response in tracking sheet

---

## 📄 Generate Report

### Option A: Automated (If You Have RID)
```bash
cd C:\Users\gstim\.openclaw\workspace\automation\whatsapp-property-report
node test-full-report.js --address "<ADDRESS>" --rid "<RID>"
```

### Option B: Manual Assembly
1. Open report template (HTML or Word)
2. Paste LINZ data (from automated fetch)
3. Paste hazard data (from automated fetch)
4. Add rates section (from extractor output)
5. Add council fees section (manual notes)
6. Quality check all sections
7. Export as PDF

---

## ✉️ Send Delivery Email

### Within 48 Hours of Original Order

1. Open Gmail → Compose
2. Insert Template 2 (Canned Response: "Report Delivery")
3. Attach PDF report
4. Replace placeholders:
   - `[Customer Name]`
   - `[Property Address]`
   - `[Package Name]`
   - `[Report Filename].pdf`
   - `[date]` (today's date)
5. Send

### Update Tracking Sheet
| Column | Value |
|--------|-------|
| Report Delivered | =NOW() |
| Delivery Method | Email |
| Status | COMPLETED |

---

## 🚨 Special Cases

### Customer Needs It Faster (<24h)
→ Offer expedited service (+$50)
→ Use Template 4 (Expedited Offer)
→ Prioritize in queue once paid

### Can't Find Property by Address
→ Use Template 3 (RID Request Follow-Up)
→ Ask for: title number, unit details, landmarks

### Technical Issue (Extractor Fails)
→ Manually call council for rates info
→ Note issue in tracking sheet
→ Deliver partial report if needed (Template 5)

---

## 📞 Key Contacts

| Service | Contact | Purpose |
|---------|---------|---------|
| Napier Council Rates | 06 835 7579 | Property ID, rates queries |
| Hastings Council | 06 871 5050 | Rates, consents |
| Your WhatsApp | 021 XXX XXXX | Customer urgent inquiries |
| Your Email | gerhard@aidriven.biz | All correspondence |

---

## ⏱️ Time Targets

| Task | Target Time |
|------|-------------|
| Send acknowledgment | <15 min after form |
| Retrieve RID | <2 hours |
| Fetch rates data | <1 hour (after RID) |
| Generate report | <1 hour |
| Total turnaround | <24 hours (aim for), <48 hours (max) |

---

## ✅ Daily Checklist

End of each business day:

- [ ] Check Google Sheets for new manual requests
- [ ] Verify all acknowledgments sent
- [ ] Process any pending RID retrievals
- [ ] Complete outstanding reports
- [ ] Update tracking sheet status
- [ ] Respond to customer inquiries

---

## 📊 Metrics to Log (Weekly)

At end of each week, note:

- Total manual requests received: ___
- Average processing time: ___ hours
- Customer satisfaction score: ___ /5
- Issues encountered: ________________
- Improvements for next week: ________

---

**Full Documentation:**
- Workflow Guide: `due-diligence-mvp/MANUAL-WORKFLOW-RATES-COUNCIL.md`
- Email Templates: `due-diligence-mvp/EMAIL-TEMPLATES-MANUAL.md`
- WhatsApp Updates: `automation/whatsapp-property-report/WHATSAPP-MANUAL-PROCESSING-UPDATE.md`

**Version:** 1.0 (Beta) | **Last Updated:** 2026-08-17
