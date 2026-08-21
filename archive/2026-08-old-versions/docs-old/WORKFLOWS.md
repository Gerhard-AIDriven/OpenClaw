# WhatsApp Business Workflows - AI Driven

## Phone Number Architecture

| Number | Purpose | WhatsApp App? | Use Case |
|--------|---------|---------------|----------|
| **+27 82 444 5825** (Personal) | Testing & Personal | ✅ Yes (Phone 1) | Sandbox for testing flows, never given to customers |
| **+27 71 461 0886** (Business) | General Customer Comms | ✅ Yes (Phone 1) | Lead inquiries, general questions, follow-ups, manual responses |
| **+27 79 944 8564** (API) | Automated Reports Only | ❌ No (API-only) | Due diligence/LIM requests triggered by keywords, auto-replies only |

---

## Workflow Patterns

### Pattern A: General Inquiry Flow (Business Number)

```
Customer → +27 71 461 0886 (Business app on Phone 1)
   ↓
Gerhard reads manually in WhatsApp Business app
   ↓
Gerhard responds manually via Business app
   OR
If LIM/due diligence requested → Route to Pattern B
```

**Use cases:**
- General business inquiries
- Pricing questions
- Service explanations
- Follow-up conversations
- Relationship building

---

### Pattern B: Due Diligence Request Flow (API Number)

```
Customer → +27 79 944 8564 (API)
   ↓
Message contains: "LIM", "report", "due diligence", or property address
   ↓
Cloudflare Worker webhook receives message
   ↓
Worker stores request in KV store with:
   - customer.phone (sender's number)
   - customer.name (if available)
   - requestType: "due_diligence"
   - address: extracted from message
   - id: unique request ID
   - timestamp: ISO timestamp
   ↓
OpenClaw polls every 3 minutes (cron job)
   ↓
poll-whatsapp-requests-v2.js fetches pending requests
   ↓
Generates HTML + PDF report
   ↓
Deploys to aidriven.biz/reports/{filename}.html
   ↓
Sends WhatsApp reply to customer.phone with report link
   ↓
Updates KV status to "completed"
```

**Auto-trigger keywords:**
- "LIM"
- "report"
- "due diligence"
- "property report"
- Any message that looks like a street address

**Reply template:**
```
✅ Your Due Diligence report is ready!

📍 Address: {address}
🆔 Order ID: {requestId}

🌐 View your report online: {reportUrl}

📥 The report includes a "Download PDF" button.

Note: This is an MVP demonstration. Full data integration (LINZ, hazards, rates) coming soon!

Questions? Reply to this message anytime.
```

---

### Pattern C: Escalation Flow (Business → API)

```
Customer messages Business number asking about LIM
   ↓
Gerhard: "I'll send you our automated due diligence service - 
         please message +27 79 944 8564 with the property address"
   ↓
Customer sends new message to API number (+27 79 944 8564)
   ↓
Pattern B kicks in (fresh conversation, report sent directly to customer)
```

**Why this works:**
- Customer initiates fresh conversation with API number
- Report goes directly to customer's number (not back to Business number)
- Clean separation of concerns
- No manual forwarding needed

---

### Pattern D: Manual Forwarding (NOT RECOMMENDED)

```
Customer → Business number: "Can I get a LIM for 123 Main St?"
   ↓
Gerhard manually forwards to API number
   ↓
⚠️ PROBLEM: API sees Gerhard's Business number as sender
   ↓
Report sent back to Business number (not original customer)
   ↓
Gerhard must manually forward report to customer
```

**Issues with this approach:**
- ❌ Report goes to wrong recipient (Business number, not customer)
- ❌ Requires manual double-handling
- ❌ Breaks automation chain
- ❌ Customer doesn't get direct access to report link

**Solution:** Use Pattern C instead — ask customer to message API number directly.

---

## Key Constraints & Design Rules

### API Number Limitations (Meta Policy)
- ❌ **Cannot send first outbound message** (no template approval for unlinked number)
- ✅ **Can reply within 24h window** after customer initiates
- ✅ **Can send unlimited replies** within that 24h session window
- ❌ **Cannot initiate new conversation** after 24h expires (customer must re-initiate)

### Business Number Capabilities
- ✅ Full WhatsApp Business app functionality
- ✅ Can send templates, broadcasts, proactive messages
- ✅ Can link to Facebook/Instagram for click-to-WhatsApp ads
- ✅ Can set up quick replies, greeting messages, away messages

### Personal Number (Testing Only)
- ✅ Used for end-to-end testing before deploying to customers
- ✅ Never given to customers (keeps personal/professional boundary)
- ✅ Can test both sending TO API and receiving FROM API

---

## Open Issues & Questions

### Issue #1: Reply-To Routing (RESOLVED)
**Problem:** If Gerhard forwards a LIM request from Business number to API number, the report comes back to Business number instead of the original customer.

**Solution:** **Do NOT forward manually.** Instead:
1. Respond to customer on Business number: *"Please message +27 79 944 8564 directly with the property address for our automated due diligence service"*
2. Customer initiates fresh conversation with API number
3. Report goes directly to customer's number

**Why this works:** Meta's API uses the `customer.phone` from the incoming message as the reply target. By having the customer message the API number directly, their phone number is captured as the sender, and replies go straight to them.

**Technical note:** The Cloudflare Worker captures `message.from` (sender's phone number) and stores it in KV as `customer.phone`. The poll script then sends the report reply to that exact number. No "reply-to" field needed — the sender IS the reply target.

---

## Future Enhancements (Post-MVP)

### Auto-Detection & Routing (Single Number Strategy)
Once we have more sophistication:
- Single business number receives all messages
- Cloudflare Worker analyzes intent (general vs. LIM request)
- General inquiries → notify Gerhard for manual response
- LIM requests → auto-generate report and reply
- Hybrid: Gerhard can flag any conversation as "generate LIM report" via command

### CRM Integration
- Store all customer interactions in simple database
- Track which customers requested reports
- Follow-up sequences for engaged leads
- Lead scoring based on interaction history

### Multi-Report Packages
- Tier 1: Basic due diligence (current MVP)
- Tier 2: + LINZ title data
- Tier 3: + Natural hazards + Council records
- Tier 4: Full comprehensive report with valuation

---

## Files & Locations

- **Polling Script:** `C:\Users\gstim\.openclaw\workspace\whatsapp\poll-whatsapp-requests-v2.js`
- **Cloudflare Worker:** Deployed at `https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev`
- **Reports Folder (Web):** `C:\Users\gstim\.openclaw\workspace\aidriven-site\reports\`
- **Cron Job ID:** `6c924c8b-6adb-49c8-95bd-8400554c0b7f` (every 3 minutes)
- **KV Store Name:** (Check in Cloudflare Dashboard > Workers > KV)

---

*Last updated: 2026-08-15*
