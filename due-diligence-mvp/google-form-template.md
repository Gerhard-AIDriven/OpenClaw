# Google Forms Template - Property Due Diligence Report

**Purpose:** Quick MVP to test demand before building custom web form  
**Estimated Setup Time:** 15-20 minutes  
**Cost:** Free (Google Forms)

---

## Form Structure

### Form Title:
```
Property Due Diligence Report | AI Driven
```

### Form Description:
```
Get comprehensive property intelligence in minutes, not days. 
Perfect for screening properties before committing to a full LIM ($300-$450).

⚠️ IMPORTANT: This is an INFORMATIONAL REPORT only, NOT a legal LIM. 
Do not use for final settlement decisions.

Delivery time: 15 minutes - 4 hours (depending on package selected)
```

---

## Section 1: Property Details

**Question 1:** Street Address*  
- Type: Short answer  
- Required: Yes  
- Validation: Text (min length 5 characters)

**Question 2:** Suburb*  
- Type: Short answer  
- Required: Yes

**Question 3:** City/District*  
- Type: Dropdown  
- Required: Yes  
- Options:
  - Napier
  - Hastings
  - Taupō
  - Rotorua
  - Other (please specify in notes)

**Question 4:** Postcode  
- Type: Short answer  
- Required: No  
- Validation: Number (4 digits)

**Question 5:** Property Type  
- Type: Multiple choice  
- Required: No  
- Options:
  - Residential (house, apartment, townhouse)
  - Commercial (office, retail, warehouse)
  - Industrial (factory, workshop)
  - Land only (no buildings)
  - Mixed use

---

## Section 2: Your Situation

**Question 6:** I am...  
- Type: Multiple choice  
- Required: Yes  
- Options:
  - Looking to buy this property
  - Selling this property
  - Property investor researching
  - Just curious / market research

**Question 7:** Any specific concerns or questions?  
- Type: Paragraph  
- Required: No  
- Description: e.g., "I'm worried about flood risk" or "Want to know if I can build a granny flat"

**Question 8:** When do you need this report?  
- Type: Multiple choice  
- Required: Yes  
- Options:
  - Standard (within 1 hour) - included in all packages
  - Urgent (within 15 minutes) - +$25 fee
  - No rush (within 24 hours) - no extra charge

---

## Section 3: Choose Your Package

**Question 9:** Select Report Package*  
- Type: Multiple choice  
- Required: Yes  

**Options:**

**Basic Report - $75 NZD** ✓ Recommended for first-time buyers
- Legal property details (title, boundaries)
- Ownership information from LINZ
- Natural hazard check (flood, erosion)
- Zoning confirmation
- Current rates & valuation
- 5-7 page PDF
- Instant automated delivery

**Standard Report - $125 NZD** ✓ Most popular
- Everything in Basic, PLUS:
- Detailed zoning analysis (permitted activities)
- Development potential flags
- Building consent locations map
- Infrastructure connections check
- Investment metrics (if purchase price provided)
- 10-12 page PDF + interactive web version
- Delivery within 1 hour

**Premium Report - $200 NZD** ✓ Best for investors
- Everything in Standard, PLUS:
- Comparable sales analysis (3-5 recent sales)
- Rental yield projections
- Market trend summary
- Renovation cost estimates (high-level)
- 15-20 page PDF + web version
- 15-minute consultation call with Gerhard
- Delivery within 4 hours (business days)

**Add-ons:**
- ☐ Rush delivery (15 minutes) - +$25
- ☐ Additional property comparison - +$50/property
- ☐ Body corporate record review - +$75

---

## Section 4: Contact Details

**Question 10:** Full Name*  
- Type: Short answer  
- Required: Yes

**Question 11:** Email Address*  
- Type: Short answer  
- Required: Yes  
- Validation: Email format

**Question 12:** Phone Number  
- Type: Short answer  
- Required: No  
- Description: Optional - we'll only use this for urgent queries about your report

---

## Section 5: Terms & Privacy

**Question 13:** Important Disclaimer*  
- Type: Checkboxes  
- Required: Yes (must check both)

**Options:**
- ☐ I understand this Property Due Diligence Report is for INFORMATIONAL PURPOSES ONLY and is NOT a substitute for:
  • A formal Land Information Memorandum (LIM)
  • Legal advice from a qualified solicitor
  • Building inspection by a certified inspector
  • Professional valuation report
  
  I will NOT rely on this report for final settlement decisions.

- ☐ I agree to the processing of my personal data in accordance with New Zealand's Privacy Act 2020. My information will be retained for 90 days and used only for report delivery and quality assurance.

**Question 14:** Stay Informed (Optional)  
- Type: Checkbox  
- Required: No  
- Option:
  - ☐ Yes, keep me informed about similar properties and monthly market updates

---

## Section 6: Payment Instructions

**Final Message (Confirmation Page):**

```
Thank you for your order! 🎉

NEXT STEPS:

1. You will receive an email within 2 minutes with a secure payment link (Stripe/PayPal)
2. Complete payment to confirm your order
3. Your report will be generated and delivered to your email within the timeframe selected

PAYMENT OPTIONS:
- Credit/Debit Card (Visa, Mastercard, Amex)
- Bank Transfer (for Premium packages)

QUESTIONS?
Contact Gerhard at gerhard@aidriven.biz or 021 XXX XXXX

EXPECTED DELIVERY:
- Basic: Instant (automated)
- Standard: Within 1 hour
- Premium: Within 4 hours + consultation call scheduled

Thank you for choosing AI Driven!
```

---

## Form Settings (Configure in Google Forms)

### General Settings:
- ☑ Collect email addresses: Yes
- ☑ Limit to 1 response: No (allow multiple properties)
- ☑ Edit after submit: Yes (in case of typos)
- ☑ See summary charts and text responses: Yes

### Presentation:
- Progress bar: Show
- Shuffle option order: No
- Confirmation message: Custom (see above)

### Responses:
- Save responses to Google Sheets: Yes
- Get email notifications for new responses: Yes
- Allow response editing: Yes

---

## Automated Email Setup (Using Google Forms + Zapier/Make)

### Trigger: New Form Submission
**Action 1:** Send confirmation email via Gmail
```
Subject: Thanks! Your Property Due Diligence Report Order Received

Hi [Name],

Thanks for ordering a [Package] Report for [Address].

NEXT STEP: Complete your payment here: [Payment Link]

Once payment is confirmed, we'll start generating your report immediately.

Expected delivery: [Timeline based on package]

Questions? Reply to this email or call 021 XXX XXXX.

Cheers,
Gerhard & the AI Driven team
```

**Action 2:** Add row to Google Sheets (CRM/Tracking)
- Timestamp
- Name, Email, Phone
- Property Address, Suburb, City
- Package Selected
- Timeline
- Payment Status (Pending → Completed)
- Report Status (Processing → Delivered)

**Action 3:** Send notification to Gerhard (SMS/WhatsApp via Twilio)
```
📊 NEW ORDER: [Package] Report
Address: [Full Address]
Customer: [Name] ([Email])
Timeline: [Urgent/Standard/Research]
→ Process payment & start report generation
```

---

## Payment Integration Options

### Option A: Stripe Payment Links (Recommended)
1. Create products in Stripe Dashboard:
   - "Basic Due Diligence Report" - $75 NZD
   - "Standard Due Diligence Report" - $125 NZD
   - "Premium Due Diligence Report" - $200 NZD
   
2. Generate payment links for each product

3. Use Zapier/Make to:
   - Detect package selection in Google Form
   - Send appropriate Stripe payment link via email
   - Track payment completion via webhook

**Pros:** Professional, supports all cards, automatic receipts  
**Cons:** 1.75% + $0.30 per transaction (NZ pricing)

---

### Option B: PayPal Buttons
1. Create PayPal "Buy Now" buttons for each package
2. Copy button URLs
3. Include in confirmation email based on selection

**Pros:** Widely trusted, easy setup  
**Cons:** Higher fees (~3%), less professional for B2B

---

### Option C: Manual Invoice (For Premium/Commercial Clients)
1. Auto-generate draft invoice in Xero/MyOB
2. Email invoice PDF with bank account details
3. Mark as paid when received
4. Begin report generation after payment clears

**Pros:** Good for B2B, supports bank transfer  
**Cons:** Slower cash flow, manual tracking

---

## Testing Checklist

Before going live:

- [ ] Submit test order for each package tier
- [ ] Verify confirmation email sends correctly
- [ ] Test payment link redirects work
- [ ] Check Google Sheets captures all data
- [ ] Verify SMS notifications trigger
- [ ] Test on mobile device (responsive?)
- [ ] Check all required fields enforce properly
- [ ] Validate email format checking works
- [ ] Review disclaimer checkboxes are mandatory
- [ ] Confirm privacy policy link works (if added)

---

## Launch Plan

### Phase 1: Soft Launch (Week 1)
- Share with 3-5 friendly real estate agents
- Offer 50% discount for feedback
- Collect testimonials and refine process
- Target: 5-10 test reports

### Phase 2: Limited Launch (Week 2-3)
- Add to AI Driven website
- Share in local investor Facebook groups
- Email to past contacts
- Target: 20-30 reports

### Phase 3: Full Launch (Week 4+)
- Paid Facebook/Instagram ads (geo-targeted Napier/Hastings)
- Partner with 2-3 real estate agencies
- List on Trade Me Services (if allowed)
- Target: 50+ reports/month

---

## Metrics to Track

| Metric | Target | Actual |
|--------|--------|--------|
| Form submissions/day | 3-5 | |
| Conversion to payment | 60-70% | |
| Average package value | $125 | |
| Delivery time (actual vs promised) | <90% of target | |
| Customer satisfaction (1-5 scale) | 4.5+ | |
| Refund/complaint rate | <2% | |
| Repeat customer rate | 25%+ | |

---

## Cost Breakdown (Monthly)

| Item | Cost (NZD) |
|------|------------|
| Google Forms | $0 (Free) |
| Google Sheets | $0 (Free) |
| Zapier/Make automation | $0-$30 (Free tier or Starter) |
| Stripe transaction fees | ~2% of revenue |
| Koordinates API (if exceed free tier) | $25 (AI Pro plan) |
| **Total Fixed Costs** | **$25-$55/month** |

**Break-even:** 1-2 reports per month  
**Profit at 20 reports/month (avg $125):** ~$2,300-$2,400/month

---

## Next Steps After MVP Validation

1. **Build Custom Web Form** (using the HTML template provided)
2. **Integrate Direct Payment** (Stripe embedded checkout)
3. **Automate Report Generation** (connect to LINZ/Napier APIs)
4. **Create Report Templates** (PDF generation with branding)
5. **Set Up Customer Portal** (download past reports, track orders)
6. **Scale Marketing** (paid ads, partnerships, referrals)

---

**Document Created:** 2026-08-04  
**Owner:** AI Driven (Gerhard Stimie)  
**Status:** Ready for implementation
