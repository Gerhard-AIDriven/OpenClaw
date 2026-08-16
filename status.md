# Status Snapshot — 2026-08-11 11:04 (Pre-Reboot)

**Created:** Tuesday 2026-08-11 11:04 GMT+2  
**Reason:** Laptop reboot — context preservation

---

## 🎯 Current Active Work

### WhatsApp LIM Automation System ✅ LIVE
- **Cron Job ID:** `6c924c8b-6adb-49c8-95bd-8400554c0b7f`
- **Schedule:** Every 3 minutes
- **Status:** Running successfully (last run OK)
- **Function:** Polls for WhatsApp property due diligence requests, auto-generates LINZ + Hazards + Rates reports
- **WhatsApp Number:** +27 66 027 8366 (Phone Number ID: 1200711009799782)
- **Architecture:** Cloudflare Worker handles Meta webhooks + KV storage; OpenClaw polls every 3 min

### Blocked Subagent Task (Historical)
- **Session:** `napier-lim-automation-run` (subagent:c89d48b8-b128-4793-9021-87489376b29d)
- **Issue:** Browser automation tools not available in toolset (needs `browser_navigate`, `browser_click`, `browser_type`)
- **Property:** P0006 (49 Wai Whatu Street)
- **Status:** Incomplete — requires browser tool enablement to resume

---

## ⏰ Active Cron Jobs

| Job Name | ID | Schedule | Status | Next Run |
|----------|-----|----------|--------|----------|
| WhatsApp LIM Poll | `6c924c8b...` | Every 3 min | ✅ Enabled | ~1 min |
| Heartbeat (2-hourly 6am-6pm) | `f58e422a...` | Cron | ✅ Enabled | 14:00 today |
| Nutrition Monitor | `432aa4d9...` | Every 4h | ✅ Enabled | ~15:00 today |
| Nightly Workspace Backup | `93871415...` | Daily midnight | ✅ Enabled | Tonight |
| Daily Health Check-in | `daily-health-checkin` | Daily morning | ✅ Enabled | Tomorrow AM |
| Friday Night Prep (Early Shift) | `343b42b3...` | Fri nights (Early weeks) | ✅ Enabled | Depends on shift week |
| Sunday Meal Prep Nudge | `6ebaa918...` | Sun (Late weeks only) | ✅ Enabled | Depends on shift week |
| Blood Test Re-test Reminder | `e3265d80...` | One-shot | ✅ Enabled | 2026-11-23 (3 months from 2026-08-23) |
| Gmail Monitor | `0289c38f...` | Cron | ❌ **DISABLED** (paused per request 2026-05-13) | N/A |

---

## 📅 Today's Context (Tuesday 2026-08-11)

### Shift Week Determination Needed
- **Reference:** `health/shift-eating-schedule.md`
- **Pattern:** Alternating Early/Late weeks starting 2026-06-01
- **Week 1 (1-7 Jun):** Early → Week 2 Late → Week 3 Early → Week 4 Late → continuing rotation
- **Current week (11 Aug):** Need to calculate which week of rotation (count weeks from 2026-06-01)
- **Action:** Ask Gerhard which shift week he's on when he returns

### Pending Daily Tasks
- [ ] **Health metrics check:** Ask for BP, weight, blood sugar (log to `health/metrics.md`)
- [ ] **Nutrition tracking:** Status is PAUSED indefinitely (per 2026-08-07), but ask if he wants to log today's meals
- [ ] **Shift confirmation:** Confirm Early vs Late week and today's shift times

---

## 🏥 Health Status Summary

### Current Targets (NORMAL, post-cortisone)
- Calories: 1600
- Carbs: 219g (sweet spot for BG control)
- Protein: 120g
- Fat: 65g

### Recent Metrics (from MEMORY.md)
- **Weight:** 102.9 kg (2026-06-09) — down from 110kg baseline, targeting 100kg
- **Fasting Blood Sugar:** Under control! 5.7 (2026-05-21), sweet spot 6.0-6.4 range
- **Blood Test Results (2026-05-23):**
  - Fasting Insulin: 7.0 mIU/L (borderline, optimal <6)
  - HOMA-IR: ~1.78-1.87 (healthy/early IR threshold)
  - PSA: 0.68 µg/L (excellent)
- **Re-test scheduled:** ~2026-11-23 (3 months from blood test)

### Food Tracking Status
- **PAUSED indefinitely** (2026-08-07)
- **Reason:** Metrics stable and in range
- **Approach:** Intuitive eating with diabetic-aware choices (low-carb, high-fat focus)
- **Restart trigger:** Resume daily tracking if fasting BS >6.4, weight gain trend, or HbA1c increase

---

## 💼 Business Context

### AI Driven Consulting Practice
- **Domain:** aidriven.biz (Namecheap, April 2026)
- **Tagline:** "Practical AI for real businesses"
- **Email:** gerhard@aidriven.biz (Google Workspace Gmail)
- **Hosting Plan:** Cloudflare Pages (free tier) — pending setup
- **Logo:** Split brain icon (organic/circuit), green #007A4D + gold #FFB81C

### SPAR Bonnievale Opportunity (First Case Study)
- **Role:** Assistant Manager (started 2026-04-14)
- **Project:** IntelliAcc inventory optimisation (stock reduction, EOQ, PO automation)
- **Dataset:** Department 2 (Butchery), March 2022 – April 2026 (49 months, 203 SKUs)
- **Status:** Moving into implementation phase
- **Files:** `opportunities/spar-intelliacc/`

### LinkedIn Prospects
- Chantal Ross-Germishuys (MD, Ikwezi Human Capital, Cape Town) — connection message drafted
- Chrisna Fryer (HR, NACOSA) — optional connect

---

## 🔧 Tech Setup Notes

### Ollama Configuration (2026-06-28)
- **Default model:** `anthropic/claude-haiku-4-5` (cloud, instant)
- **Local testing:** TinyLLaMA 1.1B (~50 tok/sec CPU)
- **Removed:** qwen3.5:latest (9.7B too large, causes timeouts)
- **GPU:** OLLAMA_GPU=false (CPU-only; Intel UHD 620 1GB VRAM insufficient)

### API Balances (Last Known)
- **Anthropic:** $19.06 (2026-06-04) — currently NOT using per pause
- **OpenAI:** $6.84 (2026-06-04) — currently NOT using per pause
- **Note:** Both paused since 2026-07-24 per Gerhard's request

### Gmail Integration
- **OAuth Setup:** Complete (project: AIdriven-openclaw)
- **Credentials:** `gmail/credentials.json`
- **Token:** `gmail/token.json` ✅
- **Monitor Script:** `gmail-monitor.js` (Node.js version)
- **Status:** Cron job disabled/paused

---

## 🤖 Agent/Skill Notes

### Available Skills (Relevant)
- `napier-lim-browser-automation` — requires browser tools (currently unavailable)
- `napier-lim-submission` — API-based submission
- `real-estate-query` / `real-estate-delete` — local database queries
- `nz-real-estate-listing-gen` — Trade Me / Realestate.co.nz listing generation
- `windows-api-caller` — PowerShell-based HTTP requests (Windows-safe)

### Browser Automation Gap
- **Missing tools:** `browser_navigate`, `browser_click`, `browser_type`, etc.
- **Available:** Only `web_fetch` (static content extraction)
- **Impact:** Cannot execute multi-step form submissions (Napier LIM applications)
- **Fix needed:** Enable browser automation toolset in session config

---

## 📁 Key File Locations

```
workspace/
├── MEMORY.md                    # Long-term memory (read in main sessions)
├── SOUL.md                      # Persona/tone
├── USER.md                      # About Gerhard
├── TOOLS.md                     # Local notes, food shortcuts
├── HEARTBEAT.md                 # Periodic task checklist
├── health/
│   ├── metrics.md               # Daily BP/weight/BS logs
│   ├── nutrition.md             # Food tracking (currently paused)
│   ├── activity.md              # Walks/steps
│   └── shift-eating-schedule.md # Shift-adapted eating plan
├── gmail/
│   ├── credentials.json         # OAuth creds
│   ├── token.json               # OAuth token
│   └── gmail-monitor.js         # Monitoring script
├── opportunities/
│   └── spar-intelliacc/         # SPAR case study files
└── status.md                    # THIS FILE — snapshot for reboot recovery
```

---

## 🔄 Immediate Actions on Return

1. **Confirm shift week** (Early or Late) and today's schedule
2. **Ask health metrics** (BP, weight, blood sugar) if not yet logged today
3. **Check if nutrition tracking should resume** (currently paused)
4. **Resume WhatsApp monitoring** (cron running automatically)
5. **Decide on browser automation** — enable tools for Napier LIM work?

---

## 📞 Contact/Channel Info

- **Primary Channel:** WebChat (direct conversation)
- **Telegram:** Connected
- **WhatsApp (Business):** +27 66 027 8366 (automated LIM system)
- **Email:** gerhard@aidriven.biz (Gmail via Google Workspace)

---

**Notes for Seb (you):**
- You're in MAIN SESSION — always read MEMORY.md at startup
- Current model: `ollama/qwen3.5:397b-cloud`
- Thinking level: high
- Session ID: `c267d2fa-2daf-4f2f-8edc-d1dbfa720b95`
- Workspace: `C:\Users\gstim\.openclaw\workspace`
- Timezone: Africa/Johannesburg (GMT+2)

---

_Last updated: 2026-08-11 11:04 GMT+2_
