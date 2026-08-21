# Payment Processing Issue - Stripe Account Frozen

**Status:** ⚠️ BLOCKED  
**Date Identified:** 2026-08-05  
**Severity:** Critical - Blocks MVP Launch

---

## Problem

**Stripe Account Status:** Frozen / Suspended  
**Reason:** Requires proof of New Zealand address  
**Constraint:** Gerhard cannot provide NZ proof of address until physically relocated to New Zealand (timing TBC)

### What Happened:
1. Created 3 Stripe products with payment links:
   - Basic Report ($75) - `prod_V12jHHJVpqIcMx`
   - Standard Report ($125) - `prod_V12l48ZxXaIa6u`
   - Premium Report ($200) - `prod_V12njwWPJosVkR`

2. Stripe flagged the account for verification
3. Required document: **NZ proof of address** (utility bill, bank statement, tenancy agreement, etc.)
4. Cannot comply until relocation to NZ is complete

---

## Impact

- ❌ Cannot accept online payments via Stripe
- ❌ Google Form intake is ready but has no payment mechanism
- ❌ MVP launch blocked until alternative is found

---

## Alternative Payment Options (SA-Based)

### Option 1: PayPal Business Account ✅ RECOMMENDED
**Pros:**
- Works from South Africa immediately
- No local address proof required beyond SA documents
- Widely trusted by NZ customers
- Easy integration with Google Forms (manual or Zapier)
- Buyer and seller protection

**Cons:**
- Higher fees (~3% + fixed fee vs Stripe's ~2%)
- Less professional for B2B than Stripe
- Slightly slower settlement (2-3 days vs Stripe's instant)

**Setup Time:** 1-2 business days  
**Documents Needed:** SA ID, SA proof of address, business registration (if applicable)

**Implementation:**
1. Create PayPal Business account (gerhard@aidriven.biz)
2. Generate 3 "Buy Now" buttons/links for each package
3. Update Google Form confirmation email to include PayPal link based on selection
4. OR manually email PayPal invoice after form submission

---

### Option 2: Manual Bank Transfer (EFT) ✅ IMMEDIATE
**Pros:**
- Works immediately (no setup)
- No third-party fees
- Common in NZ for service payments
- Full control over process

**Cons:**
- Manual reconciliation (check when payment arrives)
- Slower customer experience (must wait for clearance)
- Higher friction = lower conversion
- Risk of non-payment after report delivery

**Implementation:**
1. Add bank details to confirmation message/email:
   ```
   Bank: [Your Bank]
   Account Name: AI Driven / Gerhard Stimie
   Account Number: XXXXXX
   Reference: DUE-DILIGENCE-[Your Name]
   Amount: $75/$125/$200 (based on package)
   ```
2. Customer submits form → receives email with bank details
3. You verify payment received → generate and send report

**Risk Mitigation:** Only deliver reports after payment clears (not ideal for "instant" promise)

---

### Option 3: PayFast (SA Payment Gateway) ⚠️ MAYBE
**Pros:**
- SA-based, works with SA documentation
- Supports instant EFT, credit cards, Zapper, SnapScan
- Lower fees than PayPal (~2.5%)

**Cons:**
- Less familiar to NZ customers
- May raise trust concerns for cross-border transactions
- Currency conversion (ZAR vs NZD pricing)

**Verdict:** Probably not ideal for NZ-focused business

---

### Option 4: Wait Until NZ Relocation ⏳ LONG-TERM
**Timeline:** Unknown (depends on relocation date)  
**Impact:** Delays MVP launch by months  
**Verdict:** Not acceptable — lose momentum and market testing

---

## Recommended Solution: **Hybrid Approach**

### Phase 1: Immediate Launch (This Week)
**Use Manual Bank Transfer + PayPal**

1. **Set up PayPal Business** (1-2 days)
   - Create account with SA documentation
   - Generate 3 payment links for packages
   - Test with small transaction

2. **Update Google Form confirmation** to say:
   ```
   THANK YOU FOR YOUR ORDER!
   
   PAYMENT OPTIONS:
   
   Option A: Pay instantly with PayPal (recommended)
   - Basic ($75): [PayPal Link]
   - Standard ($125): [PayPal Link]
   - Premium ($200): [PayPal Link]
   
   Option B: Bank Transfer (EFT)
   - Details provided via email
   
   Your report will be generated once payment is confirmed.
   Expected delivery: Within 1 hour of payment (Standard/Premium)
   ```

3. **Manually process** first 10-20 orders
   - Check Google Sheet for submissions
   - Send personalized email with payment options
   - Generate report after payment confirmation
   - Track everything in Google Sheet

### Phase 2: Automation (After 10+ Orders)
**Set up Zapier + PayPal**

- Trigger: New Google Form response
- Action: Send email with appropriate PayPal link
- Webhook: Listen for PayPal payment → auto-deliver report

### Phase 3: Stripe Migration (After NZ Relocation)
**Switch to Stripe when possible**

- Unfreeze/create new Stripe account with NZ documentation
- Migrate payment links from PayPal to Stripe
- Update form and automation
- Keep PayPal as backup option

---

## Decision Required

**Gerhard needs to decide:**

1. **Do you want to proceed with PayPal + Bank Transfer for now?**
   - Pros: Launch immediately, test demand, start earning
   - Cons: Manual process initially, higher fees (PayPal)

2. **Or pause the MVP until NZ relocation?**
   - Pros: Cleaner payment stack (Stripe), automated from day one
   - Cons: Months of delay, no market validation, lost momentum

**My recommendation:** 🎯 **Launch with PayPal + EFT now**
- Get real customer feedback
- Validate demand before building full automation
- Start generating revenue (even if manual)
- Learn what customers actually want
- Switch to Stripe later when in NZ (minimal friction)

---

## Next Steps (If Proceeding with PayPal)

1. **Create PayPal Business Account**
   - Go to paypal.co.nz/business
   - Use gerhard@aidriven.biz
   - Upload SA ID + proof of address

2. **Generate 3 Payment Links**
   - Basic Report: $75 NZD
   - Standard Report: $125 NZD
   - Premium Report: $200 NZD

3. **Update Google Form Confirmation Message**
   - Add PayPal links to confirmation text
   - Include bank transfer details as backup

4. **Test End-to-End**
   - Submit fake order
   - Verify PayPal payment works
   - Confirm you receive notification
   - Practice generating report

5. **Soft Launch**
   - Share with 3-5 friendly agents
   - Offer 50% discount for feedback
   - Refine process based on learnings

---

**Document Location:** `due-diligence-mvp/PAYMENT_ISSUE.md`  
**Owner:** AI Driven (Gerhard Stimie)  
**Decision Deadline:** 2026-08-08 (launch this week or pause?)
