# Google Form Setup Guide - Property Due Diligence Report

**Setup Time:** 15-20 minutes  
**Status:** Ready to implement  
**Date:** 2026-08-05

---

## Step 1: Create the Form

1. Go to [forms.google.com](https://forms.google.com)
2. Click **+ Blank form** (or + to create new)
3. Set form title and description:

### Form Header
```
Title: Property Due Diligence Report | AI Driven

Description:
Get comprehensive property intelligence in minutes, not days. 
Perfect for screening properties before committing to a full LIM ($300-$450).

⚠️ IMPORTANT: This is an INFORMATIONAL REPORT only, NOT a legal LIM. 
Do not use for final settlement decisions.

Delivery time: 15 minutes - 4 hours (depending on package selected)
```

---

## Step 2: Add Questions (Copy/Paste Each)

### Section 1: Property Details

**Question 1:** Street Address*
- Type: Short answer
- Required: ✅ Yes
- Click ⋮ (three dots) → Response validation → Text → Minimum length → 5 characters

**Question 2:** Suburb*
- Type: Short answer
- Required: ✅ Yes

**Question 3:** City/District*
- Type: Dropdown
- Required: ✅ Yes
- Options:
  ```
  Napier
  Hastings
  Taupō
  Rotorua
  Other (please specify in notes)
  ```

**Question 4:** Postcode
- Type: Short answer
- Required: ❌ No
- Click ⋮ → Response validation → Number → Is between → 1000 and 9999

**Question 5:** Property Type
- Type: Multiple choice
- Required: ❌ No
- Options:
  ```
  Residential (house, apartment, townhouse)
  Commercial (office, retail, warehouse)
  Industrial (factory, workshop)
  Land only (no buildings)
  Mixed use
  ```

---

### Section 2: Your Situation

Click **Add section** button (right toolbar) → Title: "Your Situation"

**Question 6:** I am...
- Type: Multiple choice
- Required: ✅ Yes
- Options:
  ```
  Looking to buy this property
  Selling this property
  Property investor researching
  Just curious / market research
  ```

**Question 7:** Any specific concerns or questions?
- Type: Paragraph
- Required: ❌ No
- Description (click ⋮ → Description): `e.g., "I'm worried about flood risk" or "Want to know if I can build a granny flat"`

**Question 8:** When do you need this report?
- Type: Multiple choice
- Required: ✅ Yes
- Options:
  ```
  Standard (within 1 hour) - included in all packages
  Urgent (within 15 minutes) - +$25 fee
  No rush (within 24 hours) - no extra charge
  ```

---

### Section 3: Choose Your Package

Click **Add section** → Title: "Choose Your Package"

**Question 9:** Select Report Package*
- Type: Multiple choice
- Required: ✅ Yes
- Options (copy exactly):
  ```
  Basic Report - $75 NZD ✓ Recommended for first-time buyers
  - Legal property details (title, boundaries)
  - Ownership information from LINZ
  - Natural hazard check (flood, erosion)
  - Zoning confirmation
  - Current rates & valuation
  - 5-7 page PDF
  - Instant automated delivery
  
  Standard Report - $125 NZD ✓ Most popular
  - Everything in Basic, PLUS:
  - Detailed zoning analysis (permitted activities)
  - Development potential flags
  - Building consent locations map
  - Infrastructure connections check
  - Investment metrics (if purchase price provided)
  - 10-12 page PDF + interactive web version
  - Delivery within 1 hour
  
  Premium Report - $200 NZD ✓ Best for investors
  - Everything in Standard, PLUS:
  - Comparable sales analysis (3-5 recent sales)
  - Rental yield projections
  - Market trend summary
  - Renovation cost estimates (high-level)
  - 15-20 page PDF + web version
  - 15-minute consultation call with Gerhard
  - Delivery within 4 hours (business days)
  ```

**Add-on Question:** Would you like to add any extras?
- Type: Checkboxes
- Required: ❌ No
- Options:
  ```
  Rush delivery (15 minutes) - +$25
  Additional property comparison - +$50/property
  Body corporate record review - +$75
  Rates Information - Requires manual processing (adds 24-48 hours)
  Council Fees & Permits - Requires manual processing (adds 24-48 hours)
  
  ⚠️ NOTE: Selecting Rates or Council Fees requires manual intervention 
  and will delay report delivery by 24-48 hours. You'll receive a 
  confirmation email once your report is ready.
  ```

---

### Section 4: Contact Details

Click **Add section** → Title: "Contact Details"

**Question 10:** Full Name*
- Type: Short answer
- Required: ✅ Yes

**Question 11:** Email Address*
- Type: Short answer
- Required: ✅ Yes
- Click ⋮ → Response validation → Text → Email address

**Question 12:** Phone Number
- Type: Short answer
- Required: ❌ No
- Description: `Optional - we'll only use this for urgent queries about your report`

---

### Section 5: Terms & Privacy

Click **Add section** → Title: "Terms & Privacy"

**Question 13:** Important Disclaimer*
- Type: Checkboxes
- Required: ✅ Yes
- Options:
  ```
  I understand this Property Due Diligence Report is for INFORMATIONAL PURPOSES ONLY and is NOT a substitute for:
  • A formal Land Information Memorandum (LIM)
  • Legal advice from a qualified solicitor
  • Building inspection by a certified inspector
  • Professional valuation report
  
  I will NOT rely on this report for final settlement decisions.
  
  I agree to the processing of my personal data in accordance with New Zealand's Privacy Act 2020. My information will be retained for 90 days and used only for report delivery and quality assurance.
  ```
- Click ⋮ → Response validation → Select at least → 2

**Question 14:** Stay Informed (Optional)
- Type: Checkbox
- Required: ❌ No
- Options:
  ```
  Yes, keep me informed about similar properties and monthly market updates
  ```

---

## Step 3: Configure Form Settings

Click **Settings** tab (top center)

### General Section:
- ✅ Collect email addresses: **Verified** or **Responder input**
- ❌ Limit to 1 response: **Off** (allow multiple properties)
- ✅ Edit after submit: **On**
- ✅ See summary charts and text responses: **On**

### Presentation Section:
- Progress bar: **Show**
- Shuffle option order: **Off**
- Confirmation message: Click **Edit** and paste:

```
🎉 Thank you for your order!

NEXT STEPS:

1. You will receive an email within 2 minutes with a secure payment link (Stripe)
2. Complete payment to confirm your order
3. Your report will be generated and delivered to your email within the timeframe selected

PAYMENT OPTIONS:
- Credit/Debit Card (Visa, Mastercard)
- Bank Transfer (for Premium packages)

QUESTIONS?
Contact Gerhard at gerhard@aidriven.biz

EXPECTED DELIVERY:
- Basic: Instant (automated)
- Standard: Within 1 hour
- Premium: Within 4 hours + consultation call scheduled

Thank you for choosing AI Driven!
```

### Responses Section:
- ✅ Save responses to Google Sheets: **Create spreadsheet**
  - Name it: `Due Diligence Orders - AI Driven`
- ✅ Get email notifications for new responses: **On**
- ✅ Allow response editing: **On**

---

## Step 4: Customize Theme (Branding)

Click **Palette icon** (top right)

### Header:
1. Click **Choose Image** → Upload AI Driven logo
2. Recommended size: 1600x400 pixels (or use logo at 180px height as per brand guidelines)

### Colors (AI Driven Brand):
- Primary color: **Gold #FFB81C** (use color picker)
- Background: White or light gray
- Text: Charcoal #2D2D2D

### Font:
- Use default (clean and readable)

---

## Step 5: Test the Form

Before sharing:

1. **Submit a test order** for each package tier
2. **Check email notification** arrives
3. **Verify Google Sheets** captures all data correctly
4. **Test on mobile** (phone browser)
5. **Check required fields** enforce properly
6. **Validate email format** checking works
7. **Confirm disclaimer checkboxes** are mandatory

---

## Step 6: Get Shareable Link

Click **Send** button (top right)

### Copy Link:
1. Click **Link icon** (chain link)
2. Check **Shorten URL**
3. Click **Copy**
4. Save this URL for:
   - Website embedding
   - Email signatures
   - Social media posts
   - WhatsApp messages

### Embed in Website (Optional):
1. Click **<> (Embed HTML)**
2. Copy HTML code
3. Paste into your website where you want form to appear

---

## Step 7: Set Up Automation (Zapier/Make)

### Option A: Zapier (Easier)

1. Go to [zapier.com](https://zapier.com)
2. Create account (free tier available)
3. Create new Zap:

**Trigger:** Google Forms - New Form Response
- Connect your Google account
- Select form: "Property Due Diligence Report | AI Driven"
- Test trigger

**Action 1:** Gmail - Send Email
- To: [Form Email field]
- Subject: `Thanks! Your Property Due Diligence Report Order Received`
- Body: Use template below (see Email Templates section)
- Include Stripe payment link based on package selected

**Action 2:** Google Sheets - Create Spreadsheet Row
- Already done automatically by Google Forms

**Action 3:** SMS by Zapier - Send SMS (Optional)
- To: Your phone number (021 XXX XXXX)
- Message: `📊 NEW ORDER: [Package] Report - Address: [Full Address] - Customer: [Name]`

### Option B: Make.com (Cheaper)

Similar setup, but more affordable for higher volumes.

---

## Step 8: Create Stripe Products

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Products** → **Add Product**

### Create 3 Products:

**Product 1: Basic Report**
```
Name: Basic Due Diligence Report
Description: Legal property details, LINZ ownership, hazard check, zoning, rates
Price: $75 NZD (one-time)
```

**Product 2: Standard Report**
```
Name: Standard Due Diligence Report
Description: Everything in Basic + detailed zoning, development flags, consent map
Price: $125 NZD (one-time)
```

**Product 3: Premium Report**
```
Name: Premium Due Diligence Report
Description: Everything in Standard + comparables, rental yield, 15-min consultation
Price: $200 NZD (one-time)
```

### Generate Payment Links:
For each product:
1. Click product name
2. **Add payment link** → **Create payment link**
3. Copy the URL (looks like: `https://buy.stripe.com/xxxxx`)
4. Save these 3 URLs for Zapier automation

---

## Step 9: Email Templates

### Confirmation Email (Sent via Zapier/Gmail)

**Subject:** `Thanks! Your Property Due Diligence Report Order Received`

**Body:**
```
Hi [Full Name],

Thanks for ordering a [Select Report Package] Report for:
[Street Address], [Suburb], [City/District]

NEXT STEP: Complete Your Payment

Click here to pay securely: [INSERT STRIPE LINK BASED ON PACKAGE]
- Basic Report ($75): https://buy.stripe.com/xxx-basic
- Standard Report ($125): https://buy.stripe.com/xxx-standard
- Premium Report ($200): https://buy.stripe.com/xxx-premium

Once payment is confirmed, we'll start generating your report immediately.

Expected delivery: [When do you need this report? field]
- Standard: Within 1 hour
- Urgent: Within 15 minutes (+$25 applies)
- No rush: Within 24 hours

QUESTIONS?
Simply reply to this email or call/text 021 XXX XXXX.

Cheers,
Gerhard & the AI Driven team
gerhard@aidriven.biz

⚠️ Reminder: This is an informational report, not a legal LIM.
```

---

## Step 10: Go Live!

### Soft Launch Checklist:
- [ ] Form created and tested
- [ ] Stripe products + payment links ready
- [ ] Zapier automation configured
- [ ] Confirmation email template loaded
- [ ] Google Sheets tracking active
- [ ] SMS notifications working (optional)
- [ ] Share link copied and saved

### Share With:
1. **3-5 friendly real estate agents** (offer 50% discount for feedback)
2. **Local property investor Facebook groups**
3. **Email signature** (add link to all outgoing emails)
4. **WhatsApp status** (for network visibility)

---

## Tracking Sheet Columns (Auto-Created)

Your Google Sheets will have these columns:
```
| Timestamp | Email | Full Name | Street Address | Suburb | City/District | 
| Postcode | Property Type | I am... | Concerns | Timeline | Package | 
| Add-ons | Phone | Disclaimer | Stay Informed | Payment Status | 
| Report Status | Notes |
```

Add manual columns for tracking:
- **Payment Status:** Pending → Paid → Refunded
- **Report Status:** Processing → In Review → Delivered
- **Delivery Time:** Actual time taken (for metrics)
- **Customer Rating:** 1-5 stars (follow up after delivery)

---

## Cost Summary

| Item | Monthly Cost (NZD) |
|------|-------------------|
| Google Forms | $0 |
| Google Sheets | $0 |
| Zapier (Free tier) | $0 (up to 100 zaps/month) |
| Stripe fees | ~2% per transaction |
| **Total Fixed** | **$0** |

**Break-even:** First report covers all costs!

---

## Next Steps After Form is Live

1. ✅ Mark TODO.md as "Form Created"
2. 📊 Track first 10 orders and gather feedback
3. 🔄 Refine questions based on user confusion points
4. 🎨 Build custom web form (replace Google Forms)
5. 🔗 Integrate directly with LINZ/Koordinates APIs
6. 📄 Automate PDF report generation

---

**Ready to build?** Start with Step 1 and work through sequentially. Should take about 20 minutes total.

Let me know when it's live and we can test it together! 🚀
