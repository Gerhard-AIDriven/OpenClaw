# Due Diligence & LIM Service - Customer Journey Workflows

## Overview

AI Driven offers 4 property report products via 2 channels (WhatsApp + Website), with intelligent routing based on product complexity.

---

## Products

### 1. Basic Due Diligence Report
- **Price:** NZD $49
- **Includes:** Address verification, basic property info, automated checks
- **Data Required:** Property address only
- **Manual Work:** None (fully automated)
- **Delivery:** Instant PDF download

### 2. LIM Application Service
- **Price:** NZD $99 - NZD $199 (council-dependent)
- **Includes:** Council LIM submission, tracking, delivery
- **Data Required:** Property address + owner/contact details
- **Manual Work:** Possible (council portal login may be needed)
- **Delivery:** PDF confirmation + tracking number

### 3. Standard Due Diligence Report
- **Price:** NZD $149
- **Includes:** Basic + LINZ title data, hazards summary, rates info
- **Data Required:** Address + property type + intended use + contact details
- **Manual Work:** Yes (council portal requests, phone calls)
- **Delivery:** 24-48 hours, PDF + email

### 4. Advanced Due Diligence Report
- **Price:** NZD $299
- **Includes:** Standard + full council records, building consents, compliance, environmental
- **Data Required:** Comprehensive form + supporting documents
- **Manual Work:** Yes (multiple council departments, possible site visits)
- **Delivery:** 3-5 business days, PDF + email + 30-day support

---

## Channel Routing Logic

```
Customer Inquiry
       ↓
[WhatsApp or Website]
       ↓
What product do they want?
       ↓
┌──────────────────────┬──────────────────────┐
│   BASIC or LIM       │   STANDARD or ADVANCED│
│   (Simple)           │   (Complex)           │
└──────────────────────┴──────────────────────┘
         ↓                          ↓
  Auto-Generate Report        Route to Website
         ↓                          ↓
  Send Payment Link          Complete Detailed Form
         ↓                          ↓
  Customer Pays Online       Manual Quote/Review
         ↓                          ↓
  Instant PDF Download       Human Processing (24h-5d)
         ↓                          ↓
  Order Complete             Delivery + Support
```

---

## Detailed Workflows

### 🟢 Workflow A: Basic/LIM via WhatsApp (Fully Automated)

```
1. Customer sends WhatsApp: "LIM report for 16 Ferguson Ave, Napier"
   ↓
2. Cloudflare Worker receives webhook
   ↓
3. OpenClaw polls (every 3 min) → detects new request
   ↓
4. Auto-generate acknowledgement:
   - Create order ID (e.g., LIM_abc12345)
   - Generate basic report/confirmation
   - Calculate price (NZD $99 for LIM, NZD $49 for Basic)
   ↓
5. Send WhatsApp reply:
   "✅ Your [LIM/Basic] report is ready!
   
   📍 Property: 16 Ferguson Ave, Napier
   🆔 Order: LIM_abc12345
   💰 Price: NZD $99
   
   🔒 Secure payment required before download:
   https://aidriven.biz/checkout?order=LIM_abc12345
   
   ⏰ Available for 48 hours only.
   
   Questions? Reply here!"
   ↓
6. Customer clicks link → Lands on checkout page:
   - Shows property details
   - Shows what's included in report
   - Payment gateway (card/EFT)
   - "Pay 99 Now" button
   ↓
7a. Customer PAYS:
   - Unlock PDF download immediately
   - Send email with PDF + invoice
   - Mark order complete
   - (For LIM: trigger manual council submission if needed)
   ↓
7b. Customer DOESN'T PAY (within 48h):
   - Order expires
   - Report deleted
   - Optional: send reminder WhatsApp after 24h
```

---

### 🔵 Workflow B: Standard/Advanced via WhatsApp (Human-Assisted)

```
1. Customer sends WhatsApp: "Standard report for 45 Marine Parade"
   ↓
2. Cloudflare Worker receives webhook
   ↓
3. OpenClaw polls → detects request
   ↓
4. Auto-reply (qualifying response):
   "Thanks for your interest in a Standard Due Diligence Report! 🏠
   
   📍 Property: 45 Marine Parade
   
   For comprehensive reports, we need some additional details:
   - Property type (house, apartment, commercial?)
   - Intended use (purchase, refinance, curiosity?)
   - Any specific concerns?
   
   Please complete the quick form here:
   https://aidriven.biz/apply/standard?address=45+Marine+Parade
   
   Or reply with answers and we'll assist!
   
   Typical turnaround: 24-48 hours | Price: NZD $149"
   ↓
5a. Customer completes website form:
   - Detailed application form
   - Upload documents (if needed)
   - Submit
   ↓
5b. Customer replies on WhatsApp:
   - OpenClaw captures responses
   - Creates order manually
   - Sends follow-up link
   ↓
6. Human review (Gerhard/team):
   - Verify property details
   - Check council requirements
   - Confirm pricing (may vary by council)
   - Approve order
   ↓
7. Send payment link via email/WhatsApp:
   "Your Standard Report quote is ready
   Property: 45 Marine Parade
   Price: NZD $149
   Turnaround: 24-48 hours
   [Pay Now Button]"
   ↓
8. Customer pays → human begins work:
   - Request LINZ data
   - Contact council for rates/consents
   - Check hazard databases
   - Compile report
   ↓
9. Deliver via email + WhatsApp:
   - Professional PDF report
   - Invoice
   - Offer 30-day support window
```

---

### 🟡 Workflow C: All Products via Website (Self-Serve)

```
1. Customer visits: https://due-diligence.aidriven.biz
   ↓
2. Enters property address in search box
   ↓
3. Selects report type:
   ○ Basic (NZD $49) - Instant
   ○ LIM (NZD $99-899) - Instant confirmation
   ○ Standard (NZD $149) - 24-48 hours
   ○ Advanced (NZD $299) - 3-5 days
   ↓
4a. If Basic/LIM selected:
   - Instant checkout
   - Pay online
   - Download immediately (or receive confirmation for LIM)
   ↓
4b. If Standard/Advanced selected:
   - Complete detailed application form
   - Upload supporting docs
   - Submit for review
   - Receive quote within 2-4 hours
   - Pay online
   - Wait for delivery (24h-5d)
   ↓
5. Order tracking dashboard:
   - View order status
   - Download completed reports
   - Access invoice history
   - Request support
```

---

## Channel Comparison

| Feature | WhatsApp | Website |
|---------|----------|---------|
| **Best For** | Quick inquiries, Basic/LIM | Complex reports, professional buyers |
| **User Experience** | Conversational, mobile-first | Formal, comprehensive |
| **Data Collection** | Minimal (address only) | Full forms, document uploads |
| **Payment Flow** | Link to checkout | Integrated cart + upsells |
| **Automation Level** | High (instant responses) | Mixed (auto + human review) |
| **Conversion Rate** | Higher (impulse buys) | Higher (research-driven) |
| **Average Order Value** | Lower (NZD $49-499) | Higher (NZD $149-1499+) |
| **Setup Complexity** | Low (automated) | Medium (forms + payment) |

---

## Technology Stack

### WhatsApp Channel
- **Meta WhatsApp Business API** ✅ Live
- **Cloudflare Worker** (webhooks, KV store) ✅ Live
- **OpenClaw** (polling, auto-replies, report generation) ✅ Live
- **Payment Gateway** (Stripe/PayFast integration) ⏳ To Build
- **PDF Generation** (html-pdf-node) ✅ Tested

### Website Channel
- **Hosting:** Cloudflare Pages (aidriven.biz) ✅ Live
- **Frontend:** HTML/CSS/JS or React (to build)
- **Backend:** Cloudflare Workers or Node.js API (to build)
- **Database:** Cloudflare KV or PostgreSQL (to build)
- **Payment Gateway:** Stripe/PayFast (to integrate)
- **Email:** SendGrid or AWS SES (to configure)

---

## Next Steps (Priority Order)

### Phase 1: WhatsApp Payment Integration (Week 1)
- [ ] Choose payment gateway (PayFast recommended for SA)
- [ ] Build checkout landing pages (`/checkout?order=XXX`)
- [ ] Update WhatsApp poll script to send payment links
- [ ] Test end-to-end: WhatsApp → Payment → PDF unlock
- [ ] Launch: Basic + LIM via WhatsApp

### Phase 2: Website MVP (Week 2-3)
- [ ] Build due-diligence.aidriven.biz landing page
- [ ] Product comparison table
- [ ] Basic/LIM instant checkout
- [ ] Standard/Advanced application forms
- [ ] Admin dashboard for order management
- [ ] Launch: Full product suite on website

### Phase 3: Automation & Scale (Week 4+)
- [ ] Integrate LINZ API for automated title data
- [ ] Council portal automation (where possible)
- [ ] Email automation (order confirmations, reminders)
- [ ] Customer accounts + order history
- [ ] Bulk ordering for property investors
- [ ] API for real estate agencies

---

## Pricing Strategy Notes

### Psychological Pricing
- **Basic (NZD $49):** Impulse buy territory, no-brainer
- **LIM (NZD $99-899):** Market-rate pricing, varies by council
- **Standard (NZD $149):** Sweet spot - comprehensive but affordable
- **Advanced (NZD $299):** Premium service, high-margin

### Bundle Opportunities
- **First-Time Buyer Pack:** Basic + Standard = NZD $999 (save NZD $99)
- **Investor Pack:** 5x Basic reports = NZD $1 299 (save NZD $196)
- **Full Due Diligence:** Standard + Advanced upgrade = NZD $999 (save NZD $49)

---

*Last Updated: 2026-08-14*  
*AI Driven | Practical AI for real businesses*

