# Email Templates - Manual Processing Workflow

**Created:** 2026-08-17  
**Purpose:** Email templates for when customers request Rates or Council Fees (manual processing)

---

## Template 1: Immediate Acknowledgment

**When to send:** Immediately after Google Form submission with Rates/Council checkboxes selected  
**Trigger:** Manual or automated via Zapier/Make

### Subject:
```
Your Property Due Diligence Report - Manual Processing Required
```

### Body:
```
Hi [Customer Name],

Thank you for your order for a [Package Name] Report for:
[Property Address]

I've received your request and note that you've selected:
☐ Rates Information
☐ Council Fees & Permits

These services require manual processing and will be completed within 24-48 hours (rather than the standard automated delivery time).

WHAT HAPPENS NEXT:
1. I'll personally retrieve the rates/council information for this property
2. Your full report will be compiled and quality-checked
3. You'll receive the complete PDF report via email within 48 hours

If you have any questions or need this sooner, please reply to this email or call/text me at 021 XXX XXXX.

Thanks for your patience!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
021 XXX XXXX

⚠️ Reminder: This is an informational report, not a legal LIM.
```

---

## Template 2: Report Delivery

**When to send:** When report is complete and ready  
**Trigger:** Manual send after quality check

### Subject:
```
Your Property Due Diligence Report is Ready - [Property Address]
```

### Body:
```
Hi [Customer Name],

Great news! Your comprehensive Property Due Diligence Report is ready.

ATTACHED: [Report Filename].pdf

This report includes:
✓ All [Package Name] package items
✓ Current rates information (as of [date])
✓ Council fees & permits history (if requested)

IMPORTANT NOTES:
• Rates information is current as of [date] but may change
• This is an informational report, NOT a legal LIM
• For final settlement decisions, please obtain a formal LIM

NEXT STEPS:
• Review the report carefully
• If anything is unclear, reply to this email
• Consider a full LIM if proceeding with purchase
• Book a 15-min call if you want to discuss findings (Premium only)

Questions? I'm here to help!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
021 XXX XXXX

⚠️ Disclaimer: This report is for informational purposes only and is not a substitute for professional legal, building, or valuation advice.
```

---

## Template 3: RID Request Follow-Up (Internal Use)

**When to use:** If you need to ask customer for clarification about property  
**Trigger:** Can't find property by address

### Subject:
```
Quick question about your property report - [Address]
```

### Body:
```
Hi [Customer Name],

I'm working on your property report and need a quick clarification to ensure I pull the correct records.

Could you please confirm:
• Is the property freehold or unit title?
• Do you have the certificate of title number? (if available)
• Any other identifying details? (e.g., "the blue house on the corner", "unit 2 of 3")

This helps me locate the exact property in the council system, especially for multi-unit sites or complex titles.

Thanks for your help!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
```

---

## Template 4: Expedited Service Offer

**When to use:** Customer needs it faster than 48h  
**Trigger:** Customer asks for rush delivery

### Subject:
```
Expedited service available for your report
```

### Body:
```
Hi [Customer Name],

I understand you need your report sooner than the standard 48-hour manual processing time.

I can offer an **expedited service** for an additional $50 NZD, which will prioritize your report and deliver it within 12 hours (or same business day if ordered before 2pm).

Would you like me to proceed with expedited processing? If yes, I'll send you a payment link for the rush fee.

Let me know!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
021 XXX XXXX
```

---

## Template 5: Partial Delivery (Hybrid Approach)

**When to use:** Send automated parts first, manual parts later  
**Trigger:** Want to give customer something while waiting for manual data

### Subject:
```
Part 1 of 2: Your Property Report (LINZ + Hazards) - [Address]
```

### Body:
```
Hi [Customer Name],

Good news! Part 1 of your Property Due Diligence Report is ready.

ATTACHED: [Report Filename]-Part1.pdf

This includes:
✓ LINZ title information
✓ Legal property details
✓ Natural hazard assessment
✓ Zoning confirmation

PART 2 (Rates & Council Fees):
I'm currently retrieving the rates and council information manually. This takes 24-48 hours and will be sent as a separate email with the complete consolidated report.

Expected delivery: Within 48 hours of your original order

If you need this sooner, reply to this email and I'll see what I can do!

Cheers,
Gerhard
AI Driven
gerhard@aidriven.biz
```

---

## Gmail Setup Instructions

### Option A: Manual Copy/Paste (Simple)
1. Open Gmail
2. Click **Compose**
3. Copy template from this document
4. Replace bracketed placeholders `[like this]`
5. Send

### Option B: Gmail Canned Responses (Recommended)
1. Go to Gmail Settings ⚙️ → **See all settings**
2. Scroll to **Advanced** tab
3. Enable **Canned Responses** (Templates)
4. Click **Save Changes**
5. To use: Compose email → Click three dots ⋮ → **Templates** → **Insert template**
6. To save: Compose email with template → ⋮ → **Templates** → **Save draft as template**

### Option C: Zapier Automation (Advanced)
1. Connect Google Forms → Gmail in Zapier
2. Trigger: New form response with "Rates" or "Council" in add-ons field
3. Action: Send email using Template 1 above
4. Filter: Only run if Add-ons contains "Rates" OR "Council"

---

## Tracking Sheet Status Columns

Add these to your Google Sheet:

| Column | Values | Purpose |
|--------|--------|---------|
| Email Ack Sent | Yes/No/Timestamp | Track if Template 1 sent |
| Manual Processing Started | Timestamp | When you started work |
| RID Retrieved | Yes/No/Timestamp | Rates ID obtained |
| Report Delivered | Timestamp | Template 2 sent |
| Delivery Method | Email/WhatsApp/Both | How customer received it |

---

**Owner:** Gerhard Stimie  
**Contact:** gerhard@aidriven.biz  
**Version:** 1.0 (Beta - 2026-08-17)
