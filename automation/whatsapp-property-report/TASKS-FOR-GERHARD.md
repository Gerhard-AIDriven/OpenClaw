# Tasks for Gerhard — Due Diligence Platform

**Date:** 2026-08-16  
**Priority:** 🔴 HIGH = do today/tomorrow | 🟡 MEDIUM = this week

---

## 🔴 At the Office (LINZ Research) — TODAY

### LINZ Data Service Investigation

**Goal:** Find the correct WFS endpoint and authentication method

**Steps:**
1. Go to https://data.linz.govt.nz/ in your browser
2. Log in with your LINZ account
3. Look for:
   - "API" or "Developers" or "Web Services" section
   - "WFS" or "Web Feature Service" documentation
   - Layer catalog (list of available datasets)

**Specific Questions to Answer:**
- What's the full WFS endpoint URL?
  - Is it `https://data.linz.govt.nz/services/wfs`?
  - Or `https://data.linz.govt.nz/geoserver/data.linz.govt.nz/wfs`?
  - Or something else?

- How do we authenticate?
  - API key in query string: `?key=***`
  - API key in header: `X-LINZ-APIKey: ***`
  - OAuth2 bearer token?
  - Basic auth (username:password)?
  - Different credential needed for WFS?

- What are the layer names (typeNames)?
  - We need layers with: property titles, legal descriptions, ownership, land area
  - Common names: `linz-data:geodetic_titles`, `linz-data:titles`, `linz-data:cadastre_titles`

- What's the filter syntax?
  - Can we filter by title number? (`CQL_FILTER=title_number='NA1234/56'`)
  - Can we filter by bounding box? (`bbox=MINX,MINY,MAXX,MAXY,EPSG:4326`)
  - What fields are returned?

**Quick Test URLs** (try these in browser while logged in):

```
https://data.linz.govt.nz/services/wfs?service=WFS&version=2.0.0&request=GetCapabilities&key=YOUR_ACTUAL_KEY_HERE
```

If it works → You'll see XML document listing all layers (screenshot this!)

```
https://data.linz.govt.nz/services/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=linz-data:geodetic_titles&maxFeatures=1&outputFormat=application/json&key=YOUR_ACTUAL_KEY_HERE
```

If it works → You'll see JSON with one title record

**Deliverable:** 
Screenshot or copy/paste:
- GetCapabilities XML (or at least the first 50 lines showing layer names)
- Any authentication instructions from their docs
- Example GetFeature request that works

---

## 🟡 Council GIS Research — I'm Working on This

I'll investigate these while you're at work, but you can help prioritize:

### Napier City Council
- Search for: "Napier City Council GIS mapping"
- Look for: Interactive map viewer, property search, rates enquiry
- Need: Liquefaction zones, flood hazards, zoning, rates breakdown

### Hastings District Council
- Same as Napier

### Hawke's Bay Regional Council
- Focus: Flood maps (river + surface water)
- May have best open data portal

**Question:** Which council should I prioritize? Start with Napier?

---

## 🔴 Decision: Front Page Design

I created a new "Coming Soon" landing page: `aidriven-website/index-new.html`

**Options:**
1. **Replace current** `index.html` with new version immediately
2. **Keep MVP page** (`due-diligence-mvp/index.html`) as primary
3. **Hybrid:** New front page links to MVP demo page

**My recommendation:** Option 1 — the new page is professional, builds anticipation, and captures emails for launch notifications.

**Action needed:**
- Review the design (open `file:///C:/Users/gstim/.openclaw/workspace/aidriven-website/index-new.html` in browser)
- Decide: deploy now or keep MVP page?
- If deploying: rename files or update Cloudflare Pages config

---

## 🟡 Payment Gateway Setup — Choose One

**Options for NZ:**

### Stripe (Recommended)
- ✅ Easy integration (well-documented API)
- ✅ Works in NZ
- ✅ 1.75% + 30¢ per transaction
- ✅ Supports recurring payments (for future subscriptions)
- ⚠️ Need NZ bank account for payouts

**Setup time:** ~30 minutes

### PayFast
- ✅ South African roots (you have SA banking?)
- ✅ Works in NZ
- ✅ Similar fees to Stripe
- ⚠️ Slightly more complex integration

**Setup time:** ~1 hour

### Crypto (BTC, USDT)
- ✅ No chargebacks
- ✅ International customers
- ⚠️ Volatile (except stablecoins like USDT)
- ⚠️ Less mainstream adoption
- ⚠️ Need crypto wallet setup

**Setup time:** ~1-2 hours

**My recommendation:** Stripe for simplicity and professionalism.

**Action needed:** Which provider do you prefer? I can build the integration once you decide.

---

## 🟡 Sample Report PDF

We need a real sample PDF to link from the front page.

**Current status:** We have HTML reports generated, but not a polished PDF sample.

**Options:**
1. Convert one of the existing HTML reports to PDF (manual export from browser)
2. Generate a new report specifically as a sample (with dummy customer info removed)
3. Create a separate "sample excerpt" PDF (first 3 pages only)

**Action needed:** Which approach? And should I generate it now or wait for you to review?

---

## 🟢 Email Capture Backend

The new front page has a form that collects:
- Name
- Email
- Interest category (investor, homebuyer, professional, curious)

**Where should submissions go?**

### Option A: Google Sheet (Easiest)
- Form POST → Google Apps Script → Google Sheet
- Free, simple, you can see all signups in one place
- Setup: ~15 minutes

### Option B: Email Notifications
- Form POST → Email service (Formspree, EmailJS) → Your inbox
- Each signup sends you an email
- Cost: Free tier usually sufficient
- Setup: ~20 minutes

### Option C: CRM/Marketing Tool
- Form POST → Mailchimp/ConvertKit/etc.
- Automatically adds to mailing list
- Better for future email campaigns
- Setup: ~30-60 minutes

**My recommendation:** Start with Option A (Google Sheet), migrate to Option C later when we have volume.

**Action needed:** Which option do you prefer?

---

## 🎯 Launch Strategy Decision

**Two paths:**

### Path A: Manual Launch (This Week)
- You manually look up LINZ data (~2 min per property)
- System auto-generates rest of report
- Launch with 3-5 beta customers (friends/colleagues)
- Real revenue, real feedback
- **Pros:** Start earning immediately, validate demand, learn from real users
- **Cons:** Not scalable yet, your time per report

### Path B: Full Automation Launch (2-4 Weeks)
- Wait until LINZ WFS + Council integrations working
- Fully automated end-to-end
- Professional launch with marketing push
- **Pros:** Scalable from day one, impressive demo
- **Cons:** Delayed revenue, no user feedback during dev

**My strong recommendation:** Path A (Manual Launch)

**Why:** 
- Cash flow starts immediately
- Real customer feedback shapes development
- You validate pricing ($75/$125/$200)
- Beta testers become case studies/testimonials
- We automate based on actual usage patterns, not assumptions

**Action needed:** Do you agree with manual launch this week? Or prefer waiting for full automation?

---

## 📋 Summary of Decisions Needed

| Decision | Options | My Recommendation | Priority |
|---|---|---|---|
| LINZ WFS Research | You investigate at office | — | 🔴 TODAY |
| Front Page Design | New vs. MVP vs. Hybrid | Deploy new page | 🔴 Today |
| Payment Gateway | Stripe vs. PayFast vs. Crypto | Stripe | 🟡 This week |
| Sample PDF | Convert existing vs. Create new | Create dedicated sample | 🟡 This week |
| Email Backend | Sheet vs. Email vs. CRM | Google Sheet | 🟡 This week |
| Launch Strategy | Manual now vs. Automated later | Manual launch this week | 🔴 Decide today |
| Council Priority | Napier vs. Hastings vs. HBRC | Start with Napier | 🟡 I'll research |

---

## 🕐 When You're Back from Work

**Estimated return:** ~15:00 (shift ends) + walk + dinner = ~18:30 available

**Agenda for evening session (18:30-20:30):**

1. **LINZ Research Debrief** (15 min)
   - What did you find?
   - Endpoint URL? Auth method? Layer names?
   - I'll implement immediately

2. **Front Page Review** (15 min)
   - Open new design in browser
   - Approve or request changes
   - Deploy if ready

3. **Launch Strategy** (10 min)
   - Confirm: manual launch this week?
   - Identify 3-5 beta testers
   - Set expectations

4. **Payment + Email Backend** (10 min)
   - Choose providers
   - I'll start implementation

5. **Council GIS Priorities** (10 min)
   - Review my research findings
   - Decide which council to tackle first
   - Assign next steps

**Total:** ~1 hour decision-making, then I execute while you watch or rest

---

## 📞 During Your Shift (If You Have Downtime)

If you're at work with quiet moments:
- Think about the launch strategy (manual vs. automated)
- Consider 3-5 people who could be beta testers
- Review the new front page design on your phone (if I can send you the HTML file)

No pressure to respond immediately — just background thinking.

---

*Task list by Seb | AI Driven | 2026-08-16 06:00*
