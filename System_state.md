# SYSTEM STATE & ARCHITECTURAL TRUTH

> **DO NOT ALTER EXPLICIT CONSTRAINTS WITHOUT USER AUTHORIZATION.**
> **Always cross-reference this file before writing new code segments.**

---

## 🛠️ ENVIRONMENT & ENVIRONMENT DEFINITIONS

| Core Property | Active Specification | Notes / Details |
| :--- | :--- | :--- |
| **Project Name** | AI Driven - Property Reports | Automated due diligence reports (LINZ + Hazards + Rates) |
| **Primary Language** | Node.js / Python | Poller (Node), Scrapers (Python) |
| **Core Frameworks** | Cloudflare Workers / Meta API | WhatsApp automation pipeline |
| **Database Engine** | Cloudflare KV | Lead and request storage |
| **OS Environment** | Windows 11 Pro (Local) | GWS-Asus (i7-8550U, 16GB RAM) |

---

## 📂 PROJECT STRUCTURE & MAPPED PATHS
* **`poll-automated-reports-v2.js`** $\rightarrow$ Primary poller for requests.
* **`report-engine-v2.js`** $\rightarrow$ HTML report generator (with Leaflet.js integration).
* **`manual-trigger.js`** $\rightarrow$ Tool for testing reports manually.
* **`napier_rates_scraper.py`** $\rightarrow$ Python script for council rates/consents.
* **`C:\Users\gstim\.openclaw\workspace\reports\html\`** $\rightarrow$ Output directory for generated reports.

---

## 🔒 HARD IMMUTABLE CONSTRAINTS
* **Napier Address Format:** Must be `House Number + Street Name + Street Type` (lowercase street type). No suburb or city.
* **Map Assets:** Leaflet JS library must be in the `<head>` of the HTML to prevent rendering race conditions.
* **VRAM Boundaries:** Local inference is CPU-bound (OLLAMA_GPU=false).

---

## 🛑 STABLE DEPENDENCIES MATRIX
* `Leaflet.js` $\rightarrow$ Interactive mapping library (CDN loaded in reports).
* `python` $\rightarrow$ Required for `napier_rates_scraper.py`.
* `node` $\rightarrow$ v24.18.0 (Runtime for poller/engine).

---

## 🔄 MILESTONE HISTORY LOG
* **2026-08-25:** Initialized `system_state.md` and `current_task.md` for context fail-safe.
* **2026-08-25:** Fixed Leaflet JS loading order in `report-engine-v2.js`.
* **2026-08-25:** Fixed `execSync` import and implemented structured address cleaning for Napier scraper.
