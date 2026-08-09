# Issues Log

_Tracking blockers, risks, and problems that need resolution._

---

## Issue #1: Manual Address Entry for Napier LIM Reports

**Status:** OPEN  
**Severity:** HIGH  
**Logged:** 2026-08-09  
**Context:** Napier LIM browser automation skill

### Problem
The current Napier LIM browser automation requires manual entry of the property address in the council website search box. This creates a critical operational gap:

1. **No automatic trigger** — When someone orders a report, there's no mechanism to capture the address and feed it into the automation
2. **Time zone mismatch** — Most activity will occur during New Zealand business hours, which is nighttime in South Africa (GMT+2 vs GMT+12/13)
3. **Manual intervention required** — Gerhard would need to wake up or be interrupted to enter addresses manually

### Impact
- Cannot go live with automated LIM service without solving this
- Risk of missed orders or delayed fulfillment
- Unsustainable for human operator (nighttime interruptions)

### Agreed Approach (2026-08-09)
- **Channel:** WhatsApp (more widely used than Telegram)
- **SLA Rule:** Orders before 10am NZ time → processed same day; orders after 10am → next working day
- **Processing Window:** SA morning batch (08:00 SA = 10:00 NZ) aligns perfectly with cutoff
- **Queue System:** Store orders in `workspace/lim-queue/` during NZ night, process in SA morning
- **Infrastructure:** 
  - ✅ Facebook Business account created (2026-08-09)
  - ✅ Business name: AIdriven.biz
  - ✅ Login: gerhard@aidriven.biz
  - ⏳ Phone number: ✅ ADDED (existing WhatsApp number, can receive calls)

### Potential Solutions to Explore
1. **Form integration** — Build a simple order form that captures address + contact details, stores in queue
2. **Email-to-order** — Parse incoming orders from email, extract address, queue for processing
3. **WhatsApp bot** — Use WhatsApp channel to receive orders, store address in structured format
4. **Scheduled batch processing** — Queue orders overnight, process in morning SA time
5. **Full API integration** — Long-term: bypass browser automation entirely if council offers API

### Next Steps
- [ ] Decide on order intake method (form, email, WhatsApp?)
- [ ] Design queue/storage system for pending orders
- [ ] Determine processing schedule (real-time vs batch)
- [ ] Consider notification/escalation rules for urgent orders

---

## Template for New Issues

```markdown
## Issue #: [Title]

**Status:** OPEN | IN_PROGRESS | RESOLVED | WONTFIX  
**Severity:** LOW | MEDIUM | HIGH | CRITICAL  
**Logged:** YYYY-MM-DD  
**Context:** [Related project/skill]

### Problem
[Clear description of what's wrong]

### Impact
[Why this matters — what breaks or what risk it creates]

### Potential Solutions
[Bullet list of approaches to consider]

### Next Steps
- [ ] Action items
```
