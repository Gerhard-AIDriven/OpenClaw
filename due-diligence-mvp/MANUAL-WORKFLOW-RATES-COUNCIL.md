# Manual Processing Workflow - Rates & Council Fees

**Status:** Beta Testing Phase  
**Last Updated:** 2026-08-17

---

## Overview

When a customer selects **Rates Information** or **Council Fees & Permits** on the Google Form, their order requires manual processing by Gerhard. This adds 24-48 hours to delivery time.

---

## Trigger

Google Form submission with either checkbox selected:
- ☐ Rates Information
- ☐ Council Fees & Permits

---

## Manual Workflow Steps

### Step 1: Notification Received
**Channel:** Email notification from Google Forms  
**Subject:** `New form response: Property Due Diligence Report | AI Driven`

**Action:**
1. Open the Google Sheets response sheet
2. Filter for rows where "Add-ons" column contains "Rates" or "Council"
3. Mark status as **"Pending Manual Processing"**

---

### Step 2: Retrieve Property Identifier (RID)

**For Rates Information:**

1. **Napier Properties:**
   - Go to Napier City Council property search
   - Search by address
   - Copy the Property ID (RID) from URL or property details
   - Example: `https://maps.napier.govt.nz/property/12345` → RID = `12345`

2. **Hastings Properties:**
   - Go to Hastings District Council property search
   - Search by address
   - Copy the Rateable Property ID

3. **Other Councils:**
   - Use council-specific property viewer
   - Extract property identifier

**Store RID:** Add to tracking sheet in column "Property RID"

---

### Step 3: Start Automated Workflow with RID

**Once you have the RID:**

1. **Trigger the WhatsApp automation manually** (or future API call)
   - Pass the RID as a parameter
   - Include customer email for delivery
   
2. **Or run the rates fetch script directly:**
   ```bash
   # Example command (to be implemented)
   node fetch-rates.js --rid <PROPERTY_RID> --email <customer@email.com>
   ```

3. **Monitor progress:**
   - Rates data fetched from council API
   - PDF report generated
   - Email sent to customer

---

### Step 4: Council Fees & Permits (If Selected)

**Manual Research Required:**

1. **Contact Council Building Department:**
   - Phone or email inquiry
   - Request: Building consent history, permit fees, outstanding charges
   
2. **Or use council online portal:**
   - Search by address/RID
   - Download consent records
   - Note any fees or conditions

3. **Compile into report section:**
   - List all consents (approved/pending)
   - Outstanding fees
   - Known permit requirements for common works

---

### Step 5: Quality Check & Delivery

**Before sending to customer:**

1. ✅ Verify all requested data is included
2. ✅ Check accuracy of rates information
3. ✅ Ensure council fees are clearly explained
4. ✅ Add disclaimer: "Information current as of [date]"

**Delivery:**
- Email PDF report to customer
- CC yourself for records
- Update tracking sheet: Status = **"Delivered"**
- Log actual delivery time

---

## Tracking Sheet Columns

Add these columns to your Google Sheet:

| Column Name | Purpose |
|-------------|---------|
| Manual Processing Required | Yes/No |
| Rates Requested | Yes/No |
| Council Fees Requested | Yes/No |
| Property RID | Store the retrieved RID |
| RID Retrieved Date | When you got the RID |
| Manual Processing Started | Timestamp |
| Manual Processing Complete | Timestamp |
| Delivered | Timestamp |
| Notes | Any issues, delays, special cases |

---

## Customer Communication Templates

### Email 1: Acknowledgment (Send Immediately)

**Subject:** `Your Property Due Diligence Report - Manual Processing Required`

```
Hi [Customer Name],

Thank you for your order for a [Package Name] Report for:
[Property Address]

I've received your request and note that you've selected:
☐ Rates Information
☐ Council Fees & Permits

These services require manual processing and will be completed within 
24-48 hours (rather than the standard automated delivery time).

WHAT HAPPENS NEXT:
1. I'll personally retrieve the rates/council information for this property
2. Your full report will be compiled and quality-checked
3. You'll receive the complete PDF report via email within 48 hours

If you have any questions or need this sooner, please reply to this email 
or call/text me at 021 XXX XXXX.

Thanks for your patience!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
021 XXX XXXX
```

---

### Email 2: Delivery (When Ready)

**Subject:** `Your Property Due Diligence Report is Ready - [Address]`

```
Hi [Customer Name],

Great news! Your comprehensive Property Due Diligence Report is ready.

ATTACHED: [Report Filename].pdf

This report includes:
✓ All [Package Name] package items
✓ Current rates information (as of [date])
✓ Council fees & permits history (if requested)

IMPORTANT NOTES:
- Rates information is current as of [date] but may change
- This is an informational report, NOT a legal LIM
- For final settlement decisions, please obtain a formal LIM

NEXT STEPS:
- Review the report carefully
- If anything is unclear, reply to this email
- Consider a full LIM if proceeding with purchase
- Book a 15-min call if you want to discuss findings (Premium only)

Questions? I'm here to help!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
021 XXX XXXX

⚠️ Disclaimer: This report is for informational purposes only and is not 
a substitute for professional legal, building, or valuation advice.
```

---

## Future Automation (Post-Beta)

Once beta testing is complete, we'll automate:

1. **RID Auto-Lookup:**
   - Script searches council property viewer by address
   - Extracts RID automatically
   - Passes to rates API

2. **Rates API Integration:**
   - Direct API call to council rates system
   - Returns JSON data
   - Merges into PDF template

3. **Council Fees Scraper:**
   - Automated search of council consent database
   - Extracts permit history
   - Flags outstanding fees

4. **Hybrid Workflow:**
   - Auto-process 90% of properties
   - Flag edge cases for manual review
   - Human-in-the-loop for complex titles

---

## Metrics to Track During Beta

| Metric | Target | Actual |
|--------|--------|--------|
| Avg time to retrieve RID | <30 min | |
| Avg manual processing time | <2 hours | |
| % requiring manual intervention | Track only | |
| Customer satisfaction (manual vs auto) | Same score | |
| Willingness to wait 24-48h | >50% accept | |

---

## Troubleshooting

**Can't find property by address:**
- Try alternative address formats (Unit/Flat numbers)
- Check spelling with customer
- Use LINZ title search as backup

**RID doesn't work in rates system:**
- Verify it's the correct property identifier type
- Some councils use different ID systems
- Contact council IT support if persistent issue

**Customer needs it faster than 48h:**
- Offer expedited service (+$50 rush fee)
- Prioritize in queue
- Deliver partial report first (LINZ + Hazards), rates separately

---

**Owner:** Gerhard Stimie  
**Contact:** gerhard@aidriven.biz  
**Version:** 1.0 (Beta)
