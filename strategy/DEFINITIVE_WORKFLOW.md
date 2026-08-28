# Definitive Workflow: AI Driven Property Due Diligence

## 1. Vision & Objective
To provide New Zealand property investors with a high-value, automated (or semi-automated) due diligence report. The core value proposition is the aggregation of scattered public data (LINZ, Council, Hazard Maps) into a single, professional PDF/HTML report, reducing research time from days to minutes.

## 2. Product Tiers
| Tier | Focus | Delivery | Automation Level |
| :--- | :--- | :--- | :--- |
| **Basic** | Address & Basic Info | Instant | 100% Automated |
| **Standard** | LINZ Title + Hazards + Rates | 24-48 Hours | Hybrid (Auto-fetch + Human Review) |
| **Premium** | Full Council Records + Consents | 3-5 Days | Human-Led (Manual Research) |

---

## 3. The Technical Pipeline (The "New" Way)

### Phase A: Intake & Orchestration
1. **Entry Point:** Customer submits a request via the Beta Web Page (Google Form $\rightarrow$ Cloudflare Worker).
2. **Queueing:** Request is stored in Cloudflare KV.
3. **Orchestration:** Openclaw (Seb) polls the KV store and triggers the Python Backend in the current working directory.

### Phase B: Data Acquisition (The Python Backbone)
This is where we solve the previous "blockers".
1. **Geocoding:** Convert the structured address (Number, Street, Suburb, City) into precise Latitude/Longitude using the LINZ Address API.
2. **LINZ Data Fetching:**
    - **Title/Parcel:** Query LINZ for legal descriptions and parcel boundaries.
    - **Hazards:** Iterate through specific LINZ Vector Layers (e.g., Cyclone Gabrielle flood zones, Liquefaction layers).
3. **Council Data Scraping:** Use Python (Playwright/Selenium) to extract Capital Value (CV) and Annual Rates from the relevant Council portals.
4. **Hazard Mapping:** Instead of static images, generate a set of dynamic links or GeoJSON data to be rendered via Leaflet.js in the final report.

### Phase C: Report Generation
1. **Data Synthesis:** A Python "Engine" aggregates all JSON responses into a single structured data object.
2. **Templating:** Use **Jinja2** (Python) to inject this data into a professional HTML/CSS template (matching the AIdriven.biz dark theme).
3. **Output:** Generate a standalone HTML file and a PDF version.

### Phase D: Delivery
1. **Hosting:** The HTML report is pushed to GitHub Pages.
2. **Notification:** Openclaw triggers an email to the customer containing the secure link to their report.

---

## 4. Key Technical Requirements (The "Must-Haves")
- **LINZ API Key Management:** Secure handling of API keys.
- **Error Handling:** Graceful fallbacks (e.g., if the Council site is down, the report should state "Rates data temporarily unavailable" rather than crashing).
- **Coordinate Precision:** Ensuring the geocoding is accurate to the parcel level to avoid incorrect hazard reporting.
- **Mobile-First Design:** Reports must be easily readable on WhatsApp/Mobile browsers.

## 5. Success Metrics
- **Accuracy:** 100% match between report data and official LINZ/Council records.
- **Speed:** Standard reports generated and reviewed within 48 hours.
- **UX:** Customer can move from "Address Input" to "Report Received" with zero friction.
