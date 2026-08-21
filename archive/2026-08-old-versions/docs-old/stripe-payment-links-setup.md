# Stripe Payment Links Setup Guide

## Overview
Create three Stripe Payment Links for the Property Due Diligence Report tiers:
- **Basic:** $75 NZD
- **Standard:** $125 NZD
- **Premium:** $200 NZD

## Prerequisites
- Stripe account (connected to your New Zealand bank account)
- Business details: AI Driven, gerhard@aidriven.biz

---

## Step 1: Create Products in Stripe

### 1A. Basic Package ($75 NZD)
1. Go to **Stripe Dashboard** → **Products** → **Add product**
2. **Product name:** `Property Due Diligence Report - Basic`
3. **Description:** 
   ```
   Essential property screening report for pre-offer due diligence.
   
   Includes:
   - Property identification & title details
   - Zoning & district plan analysis
   - Natural hazards assessment (flood, erosion, liquefaction, landslide, tsunami)
   - Infrastructure & services check
   - HAIL contamination screening
   - Building consents summary (last 10 years)
   - Rates information
   
   Turnaround: 24-48 hours
   Format: PDF report (7 pages)
   ```
4. **Pricing:** 
   - One-time payment: **$75.00 NZD**
5. **Tax code:** `PC040100` (Digital Services) - *if applicable*
6. Click **Save**

### 1B. Standard Package ($125 NZD)
1. **Products** → **Add product**
2. **Product name:** `Property Due Diligence Report - Standard`
3. **Description:**
   ```
   Comprehensive property report with investment analysis.
   
   Everything in Basic, plus:
   - Investment metrics & financial analysis
   - Rental yield calculations (gross & net)
   - Cash flow projections (with financing examples)
   - Comparable sales analysis (recent sales in area)
   - Market value range estimation
   
   Turnaround: 24-48 hours
   Format: PDF report (10-11 pages)
   ```
4. **Pricing:** One-time payment: **$125.00 NZD**
5. **Tax code:** `PC040100`
6. Click **Save**

### 1C. Premium Package ($200 NZD)
1. **Products** → **Add product**
2. **Product name:** `Property Due Diligence Report - Premium`
3. **Description:**
   ```
   Complete property due diligence with investment forecasting.
   
   Everything in Standard, plus:
   - 5-year capital growth forecast (conservative/moderate/optimistic scenarios)
   - Total return projections (capital gain + rental income)
   - Detailed risk factor analysis
   - Growth drivers assessment for the area
   - Priority turnaround
   
   Turnaround: 12-24 hours (priority)
   Format: PDF report (13-14 pages)
   ```
4. **Pricing:** One-time payment: **$200.00 NZD**
5. **Tax code:** `PC040100`
6. Click **Save**

---

## Step 2: Create Payment Links

### 2A. Basic Package Payment Link
1. Go to the **Basic** product page you just created
2. Click **Create payment link**
3. **Checkout settings:**
   - **Payment link URL:** Customize to `basic-property-report` (or let Stripe auto-generate)
   - **Button text:** `Order Basic Report - $75 NZD`
   - **Allow quantity:** No (single purchase)
   - **Collect shipping address:** No (digital product)
   - **Collect billing address:** Yes (for invoicing)
   - **Phone number:** Optional (for follow-up questions)
   
4. **After checkout:**
   - **Confirmation page message:**
     ```
     ✅ Thank you for your order!
     
     Your Property Due Diligence Report (Basic) is being prepared.
     
     Next steps:
     1. You'll receive an email within 24-48 hours with a link to complete our short property details form
     2. Once we have the property address and your requirements, we'll generate your report
     3. Your completed report will be emailed to you as a PDF
     
     Questions? Reply to this email or contact us at gerhard@aidriven.biz
     ```
   - **Redirect URL:** (Optional) `https://aidriven.biz/report-order-confirmed`
   
5. **Email notifications:**
   - ✅ Send receipt to customer
   - ✅ Send confirmation email with next steps (use template below)
   
6. Click **Publish** and **Copy link**

**Save this URL:** `https://buy.stripe.com/...` (Basic)

---

### 2B. Standard Package Payment Link
1. Go to **Standard** product page
2. Click **Create payment link**
3. Use same settings as Basic, but customize:
   - **Payment link URL:** `standard-property-report`
   - **Button text:** `Order Standard Report - $125 NZD`
   - **Confirmation message:** Update to mention "Standard" package and 24-48 hour turnaround
   
4. Click **Publish** and **Copy link**

**Save this URL:** `https://buy.stripe.com/...` (Standard)

---

### 2C. Premium Package Payment Link
1. Go to **Premium** product page
2. Click **Create payment link**
3. Use same settings, customize:
   - **Payment link URL:** `premium-property-report`
   - **Button text:** `Order Premium Report - $200 NZD`
   - **Confirmation message:** Update to mention "Premium" package and 12-24 hour priority turnaround
   
4. Click **Publish** and **Copy link**

**Save this URL:** `https://buy.stripe.com/...` (Premium)

---

## Step 3: Save Your Payment Link URLs

Once created, save your three Stripe payment link URLs here:

```
BASIC ($75 NZD):
https://buy.stripe.com/[YOUR_BASIC_LINK_ID]

STANDARD ($125 NZD):
https://buy.stripe.com/[YOUR_STANDARD_LINK_ID]

PREMIUM ($200 NZD):
https://buy.stripe.com/[YOUR_PREMIUM_LINK_ID]
```

**Also update these files with your links:**
- `google-form-template.md` (confirmation message section)
- `index.html` (order form buttons)
- `sales-one-pager.html` (pricing section)

---

## Step 4: Email Confirmation Template

Create an email template in Stripe (or use in your email automation):

**Subject:** `Your Property Due Diligence Report Order - Next Steps`

**Body:**
```html
Hi [Customer Name],

Thank you for ordering the [Package Name] Property Due Diligence Report!

✅ **Order Confirmed**
Amount paid: $[Amount] NZD
Order ID: [Stripe Order ID]

📋 **Next Steps:**

1. **Complete the Property Details Form**
   We need the property address and a few details to generate your report.
   [Link to Google Form or intake form]
   
2. **We'll Generate Your Report**
   Turnaround time: [24-48 hours for Basic/Standard | 12-24 hours for Premium]
   
3. **Receive Your Report**
   Your completed PDF report will be emailed to this address.

❓ **Questions?**
Reply to this email or contact us:
- Email: gerhard@aidriven.biz
- Phone: 021 XXX XXX

Thanks for choosing AI Driven!

Regards,
Gerhard Stimie
AI Driven
gerhard@aidriven.biz
```

---

## Step 5: Test the Flow

Before going live:

1. **Test each payment link** with Stripe's test mode:
   - Enable test mode in Stripe Dashboard
   - Use test card: `4242 4242 4242 4242` (any future date, any CVC)
   - Complete checkout and verify confirmation email
   
2. **Verify the flow:**
   - Payment processes correctly
   - Confirmation email sends
   - Links work properly
   - Amounts display in NZD

3. **Disable test mode** when ready to go live

---

## Step 6: Integration with Google Forms (MVP)

For the MVP with Google Forms:

1. **In Google Form confirmation message:**
   ```
   Thank you for your interest!
   
   To complete your order, please select your package and pay via our secure Stripe checkout:
   
   🔹 Basic Package ($75 NZD): [STRIPE_BASIC_LINK]
   🔹 Standard Package ($125 NZD): [STRIPE_STANDARD_LINK]
   🔹 Premium Package ($200 NZD): [STRIPE_PREMIUM_LINK]
   
   After payment, we'll contact you within 2 hours to confirm property details.
   ```

2. **Alternative:** Use Zapier to automate:
   - Google Form submission → Create Stripe checkout session → Email customer payment link

---

## Step 7: Update Your Documents

Replace placeholder payment links in:

- ✅ `index.html` - Order form buttons
- ✅ `google-form-template.md` - Confirmation message
- ✅ `sales-one-pager.html` - Pricing section
- ✅ `TEMPLATE-USAGE-GUIDE.md` - Order flow documentation

---

## Quick Reference

| Package | Price | Stripe Product Name | Payment Link |
|---------|-------|---------------------|--------------|
| Basic | $75 NZD | Property Due Diligence Report - Basic | [URL] |
| Standard | $125 NZD | Property Due Diligence Report - Standard | [URL] |
| Premium | $200 NZD | Property Due Diligence Report - Premium | [URL] |

---

**Need help?** 
- Stripe Support: https://support.stripe.com
- Payment Links docs: https://stripe.com/docs/payments/payment-links
