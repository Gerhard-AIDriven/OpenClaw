# Stripe Payment Links - Due Diligence MVP

**Status:** ✅ Complete  
**Last Updated:** 2026-08-05  
**Merchant:** AI Driven (gerhard@aidriven.biz)

---

## Payment Links

### ✅ Basic Report - $75 NZD
- **Product ID:** `prod_V12jHHJVpqIcMx`
- **Payment Link:** `https://buy.stripe.com/9B65kD95P1Z0875bEog3601`
- **Includes:**
  - Legal property details (title, boundaries)
  - Ownership information from LINZ
  - Natural hazard check (flood, erosion)
  - Zoning confirmation
  - Current rates & valuation
  - 5-7 page PDF
  - Instant automated delivery

### ✅ Standard Report - $125 NZD
- **Product ID:** `prod_V12l48ZxXaIa6u`
- **Payment Link:** `https://buy.stripe.com/14A7sL81LgTU3QP6k4g3602`
- **Includes:**
  - Everything in Basic, PLUS:
  - Detailed zoning analysis (permitted activities)
  - Development potential flags
  - Building consent locations map
  - Infrastructure connections check
  - Investment metrics (if purchase price provided)
  - 10-12 page PDF + interactive web version
  - Delivery within 1 hour

### ✅ Premium Report - $200 NZD
- **Product ID:** `prod_V12njwWPJosVkR`
- **Payment Link:** `https://buy.stripe.com/14A14n5TD5bcafdgYIg3603`
- **Includes:**
  - Everything in Standard, PLUS:
  - Comparable sales analysis (3-5 recent sales)
  - Rental yield projections
  - Market trend summary
  - Renovation cost estimates (high-level)
  - 15-20 page PDF + web version
  - 15-minute consultation call with Gerhard
  - Delivery within 4 hours (business days)

---

## How to Use These Links

### Manual Process (For Now):
1. Check Google Sheet for new form submission
2. See which package they selected
3. Email them the corresponding Stripe payment link
4. Mark payment status in sheet once completed
5. Generate and deliver report after payment confirmation

### Automated Process (Future - Zapier):
- Trigger: New Google Form response
- Action: Send email with appropriate Stripe link based on package selection
- Webhook: Listen for Stripe payment completion → update Google Sheet

---

## ⚠️ Account Status Note

**Stripe Account:** Currently frozen pending NZ proof of address verification.  
**Payment Links:** Created and functional, but account may be restricted until verification complete.  
**Contingency:** PayPal Business account setup recommended as backup (see `PAYMENT_ISSUE.md`).

---

## Stripe Dashboard Access

- **URL:** https://dashboard.stripe.com
- **Products Page:** https://dashboard.stripe.com/products
- **Payment Links Page:** https://dashboard.stripe.com/payment-links

---

**Document Location:** `due-diligence-mvp/STRIPE_PAYMENT_LINKS.md`
