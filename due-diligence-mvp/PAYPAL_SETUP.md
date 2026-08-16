# PayPal Payment Setup - Due Diligence MVP

**Status:** ✅ Ready to Implement  
**Date:** 2026-08-05  
**Merchant:** AI Driven (gerhard@aidriven.biz)  
**Platform:** PayPal Business Account

---

## Why PayPal for Now?

✅ **Works immediately** with SA documentation  
✅ **No NZ proof of address required**  
✅ **Trusted by NZ customers**  
✅ **Global payments supported**  
✅ **Easy integration** with Google Forms (manual or Zapier)  
✅ **Can switch to Stripe later** when relocated to NZ  

⚠️ **Fees:** ~3% + fixed fee (slightly higher than Stripe's ~2%)

---

## Step 1: Create 3 PayPal Payment Links

### Go to: [PayPal.Me](https://www.paypal.com/businessmanage/payment-links) or [PayPal Buttons](https://www.paypal.com/buttons)

**Option A: Payment Links (Recommended)**
1. Log into PayPal Business account
2. Go to **Business Tools** → **Payment Links**
3. Click **Create Payment Link**
4. Fill in details for each package (see below)
5. Copy the generated link

**Option B: Buy Now Buttons**
1. Log into PayPal Business
2. Go to **Business Tools** → **All Tools** → **PayPal Buttons**
3. Choose **Buy Now Button**
4. Configure for each package
5. Get the hosted button link

---

## Package Details for PayPal

### 1. Basic Property Due Diligence Report
- **Product Name:** `Basic Property Due Diligence Report`
- **Price:** $75.00 NZD
- **Description:** 
  ```
  Legal property details, LINZ ownership info, natural hazard check, zoning confirmation, current rates & valuation. 5-7 page PDF delivered instantly.
  ```
- **Currency:** NZD (New Zealand Dollar)

### 2. Standard Property Due Diligence Report
- **Product Name:** `Standard Property Due Diligence Report`
- **Price:** $125.00 NZD
- **Description:**
  ```
  Everything in Basic + detailed zoning analysis, development potential flags, building consent locations map, infrastructure connections check, investment metrics. 10-12 page PDF + web version. Delivery within 1 hour.
  ```
- **Currency:** NZD

### 3. Premium Property Due Diligence Report
- **Product Name:** `Premium Property Due Diligence Report`
- **Price:** $200.00 NZD
- **Description:**
  ```
  Everything in Standard + comparable sales analysis (3-5 recent sales), rental yield projections, market trend summary, renovation cost estimates. 15-20 page PDF + web version + 15-min consultation call. Delivery within 4 hours.
  ```
- **Currency:** NZD

---

## Step 2: Update Google Form Confirmation Message

### Current Confirmation Message Location:
Google Form → Settings → Presentation → Confirmation message

### New Confirmation Message Template:

```
🎉 Thank you for your order!

YOUR PROPERTY DUE DILIGENCE REPORT IS BEING PREPARED

NEXT STEPS:

1. COMPLETE YOUR PAYMENT
   Choose your package:
   
   🔹 Basic Report ($75 NZD):
   [INSERT_BASIC_PAYPAL_LINK_HERE]
   
   🔹 Standard Report ($125 NZD):
   [INSERT_STANDARD_PAYPAL_LINK_HERE]
   
   🔹 Premium Report ($200 NZD):
   [INSERT_PREMIUM_PAYPAL_LINK_HERE]

2. ONCE PAYMENT IS CONFIRMED:
   - Basic: Report delivered instantly (automated)
   - Standard: Delivered within 1 hour
   - Premium: Delivered within 4 hours + consultation call scheduled

3. CHECK YOUR EMAIL
   Your report will be sent to: [Email from form]

QUESTIONS?
Reply to this email or contact:
Gerhard Stimie | gerhard@aidriven.biz

⚠️ IMPORTANT: This is an INFORMATIONAL REPORT only, NOT a legal LIM. Do not use for final settlement decisions.

Thank you for choosing AI Driven! 🚀
```

---

## Step 3: Manual Process (Start Here)

### Workflow:
1. **Customer submits form** → You get email notification + Google Sheet updated
2. **Check package selection** in Google Sheet
3. **Send personalized email** with correct PayPal link:

**Email Template:**

```
Subject: Next Step: Complete Your Property Due Diligence Report Payment

Hi [Customer Name],

Thanks for ordering a [Package Name] Report for:
[Property Address], [Suburb], [City]

COMPLETE YOUR PAYMENT:
[Insert correct PayPal link based on their selection]

WHAT HAPPENS NEXT:
1. Once payment is confirmed, I'll generate your report immediately
2. You'll receive it via email within:
   - Basic: Instant (automated)
   - Standard: Within 1 hour
   - Premium: Within 4 hours + I'll call to schedule our 15-min consultation

PAYMENT SECURITY:
- Secure PayPal checkout (all major cards accepted)
- GST invoice provided with payment
- Refund available if report cannot be generated

QUESTIONS?
Simply reply to this email or call/text me at 021 XXX XXXX.

Looking forward to delivering your report!

Cheers,
Gerhard Stimie
AI Driven | Practical AI For Real Businesses
gerhard@aidriven.biz
```

4. **Monitor PayPal** for payment notification
5. **Generate report** and email to customer
6. **Update Google Sheet** with:
   - Payment status: ✅ Paid
   - Report delivered: [Date/Time]
   - Notes: Any feedback or issues

---

## Step 4: Automation (Future - After 10+ Orders)

### Zapier Setup:
**Trigger:** Google Forms - New Form Response  
**Action 1:** Gmail - Send Email with appropriate PayPal link  
**Action 2:** Google Sheets - Update row with "Payment Pending"  
**Webhook:** Listen for PayPal payment → update sheet to "Paid" → trigger report generation

**Estimated Setup Time:** 1-2 hours  
**Cost:** Free tier (up to 100 zaps/month) or Starter plan ~$30/month

---

## Step 5: Test End-to-End

### Test Checklist:
- [ ] Submit test form with fake property details
- [ ] Verify Google Sheet captures all data
- [ ] Receive email notification
- [ ] Click PayPal link → complete test payment (use your own card, refund after)
- [ ] Confirm PayPal payment notification received
- [ ] Practice generating report (use sample template)
- [ ] Email test report to yourself
- [ ] Verify everything works on mobile

---

## Tracking in Google Sheets

### Add These Columns to Your Sheet:
| Column Name | Purpose | Example Values |
|-------------|---------|----------------|
| **Payment Status** | Track if paid | Pending, Paid, Refunded |
| **Payment Method** | Which platform | PayPal, Stripe, Bank Transfer |
| **Payment Date** | When paid | 2026-08-05 15:30 |
| **Report Status** | Generation status | Processing, In Review, Delivered |
| **Delivery Date** | When sent | 2026-08-05 16:15 |
| **Customer Rating** | Follow-up feedback | 1-5 stars |
| **Notes** | Issues or comments | "Loved the comparables!" |

---

## PayPal Dashboard Access

- **Main Dashboard:** https://www.paypal.com/businessmanage/overview
- **Payment Links:** https://www.paypal.com/businessmanage/payment-links
- **Transactions:** https://www.paypal.com/businessmanage/activity
- **Buttons:** https://www.paypal.com/buttons

---

## Transition Plan: PayPal → Stripe (After NZ Relocation)

### When You Have NZ Proof of Address:
1. Unfreeze/create new Stripe account with NZ docs
2. Recreate 3 products in Stripe
3. Generate new Stripe payment links
4. Update Google Form confirmation message
5. Notify existing customers of new payment method (if needed)
6. Keep PayPal as backup option

**Migration Effort:** Low (1-2 hours)  
**Customer Impact:** Minimal (most won't notice)

---

## Next Steps Right Now

1. **Log into PayPal** → Create 3 payment links (15 minutes)
2. **Copy the 3 PayPal URLs** → Paste them here
3. **I'll update** the Google Form confirmation message + TODO docs
4. **Test the flow** with a fake submission + real payment
5. **Soft launch** with 3-5 friendly agents

---

**Ready to create those PayPal links?** Let me know when they're done and I'll help you wire everything together! 🚀

**Document Location:** `due-diligence-mvp/PAYPAL_SETUP.md`
