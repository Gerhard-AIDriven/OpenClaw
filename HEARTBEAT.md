# HEARTBEAT.md

## Daily Tasks

### Health Metrics (ask once per day, morning)
- Ask Gerhard for his blood pressure, weight, and blood sugar
- Log to health/metrics.md
- Treat `health/metrics.md` as the only source of truth for daily metrics
- Never scan or store health metrics in `health/nutrition.md`
- Log walks/steps to health/activity.md
- If not yet asked today, ask now
- Check health/metrics.md to see if today's entry already exists before asking
- **Daily nutrition targets (NORMAL, post-cortisone from 2026-05-28):** 1600 cal | Carbs 219g | Protein 120g | Fat 65g
  - Ask if he's tracking food today and what he's eaten so far

### Anthropic Balance Reminder (once per day, morning)
- Remind Gerhard to check his Anthropic balance at console.anthropic.com → Billing
- Last known balance: $19.06 (2026-06-04)
- If Gerhard reports balance is $2 or below → alert him to top up immediately
- Update the "Last known balance" above when Gerhard reports it

### OpenAI Balance Reminder (once per day, morning)
- Remind Gerhard to check his OpenAI balance daily (console.openai.com → Billing)
- Last known balance: $6.84 (2026-06-04)
- Update the "Last known balance" above when Gerhard reports it

### Tomorrow (2026-04-09) — One-time reminders
- 9am: Send medical reports to Maryanne ✅ (cron job set)
- 1pm: ABSA bank appointment at 2pm (check during heartbeat)

### Shift-Aware Eating (from 2026-06-01)
- Each morning, check which shift week Gerhard is on (Early or Late) and what day
- Reference `health/shift-eating-schedule.md` for the right eating plan that day
- Rotation reference: Wk1 (1–7 Jun) **LATE** → Wk2 (8–14 Jun) Early → Wk3 (15–21 Jun) Late → Wk4 (22–28 Jun) Early → alternating (corrected 2026-06-02)
- **Sleep targets:** Early week bed by 21:00; Late week bed by 23:00
- **No food within 2h of bedtime** — remind if logging late evening meals
