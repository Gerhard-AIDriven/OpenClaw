# Technical Specification: NZ Due Diligence Integration

## 1. Overview
This project aims to integrate the existing **AIdriven.biz Backend API** (located at `C:\Users\gstim\AIdriven\backend`) with a new automation layer for property due diligence reports. The goal is to allow the system to programmatically trigger property boundary resolution, council data scraping, hazard analysis, and PDF generation without modifying the core backend source code.

The integration will mirror the logic found in the frontend `map_viewer.html` to ensure consistent behavior between the manual UI and the automated pipeline.

## 2. Current Backend Architecture (Analysis)
Based on the inspection of `C:\Users\gstim\AIdriven\backend`, the system is a **FastAPI** application with the following key capabilities:

### 2.1 Key API Endpoints (`/api/orders`)
- **Boundary Resolution:** `GET /api/orders/property/boundary`
    - Resolves Address $\rightarrow$ Coordinates $\rightarrow$ GeoJSON Boundary.
    - Returns `rid` (Record ID), `geojson`, `lon`, and `lat`.
- **Report Trigger:** `POST /api/orders/property/report`
    - Scrapes Napier Council data using `rid`.
    - Performs Neighbourhood Intelligence lookup.
    - Executes Hazard Analysis (Flood, Tsunami, Coastal) using the boundary WKT.
    - Stores the final `PropertyReport` in the database.
- **PDF Generation:** `POST /api/orders/property/pdf` or `GET /api/orders/generate-report?rid=...`
    - Generates a professional PDF report based on stored data.
    - Triggers AI risk assessment via `analysis_agent`.

### 2.2 Internal Services
- `linz_api.py`: Interface with LINZ for boundaries and addresses.
- `napier_api.py`: Scraper for Napier City Council.
- `hazard_analysis.py`: Spatial intersection checks against hazard zones.
- `report_generator.py`: HTML/PDF rendering engine.

## 3. Proposed Integration Layer (`\nz_due_diligence`)

### 3.0 Frontend Logic Mirroring (`map_viewer.html`)
The automation layer must replicate the following frontend behaviors:
- **User Confirmation:** The UI requires a "Yes, This is Correct" confirmation after boundary resolution before triggering the report. The orchestrator should either assume confirmation or implement a check-and-pause mechanism.
- **Report Levels:**
    - `basic`: No AI chat, no hazard overlays.
    - `standard`: AI chat enabled, up to 3 hazard overlays.
    - `advanced`: AI chat enabled, all hazard overlays, and an automatic `risk-assessment` call.
- **Amenity Selection:** Reports include a set of selected amenities (Schools, Supermarkets, etc.) which must be passed in the `POST /api/orders/property/report` payload.

To adhere to the constraint of **not changing anything in the original project directory**, all integration logic will be built in a separate workspace directory: `C:\Users\gstim\.openclaw\workspace\nz_due_diligence`.

### 3.1 Integration Workflow
The integration layer will act as a **client/orchestrator** that interacts with the Backend API via HTTP requests.

**Step-by-Step Flow:**
1. **Input:** Receive property address (e.g., from WhatsApp/User).
2. **Boundary Lookup:** Call `GET /api/orders/property/boundary` with address parameters.
3. **Report Trigger:** Call `POST /api/orders/property/report` using the `rid` and coordinates obtained in step 2.
4. **PDF Generation:** Call `POST /api/orders/property/pdf` (or `GET /api/orders/generate-report`) to generate the final file.
5. **Delivery:** Retrieve the PDF from the backend's `\reports` directory (or via the API response) and deliver it to the user.

### 3.2 Technical Components of `\nz_due_diligence`
- **`client.py`**: A wrapper for the Backend API endpoints (using `httpx` or `requests`).
- **`orchestrator.py`**: Logic to sequence the API calls and handle failures/retries.
- **`config.py`**: API base URL, timeout settings, and environment variables.
- **`utils.py`**: Address normalization and data cleaning.

## 4. Constraints & Safety
- **Read-Only Backend:** The integration layer will treat the `AIdriven\backend` directory as an immutable service.
- **API-First approach:** All interactions will happen via the FastAPI interface to avoid direct database manipulation from the external layer.
- **Environment Isolation:** The integration layer will maintain its own dependencies to avoid version conflicts with the backend (specifically the PROJ/PostGIS libraries noted in `main.py`).

## 5. Success Criteria
- Successfully resolve a boundary for a given Napier address via the API.
- Trigger a full report including Hazard Data.
- Generate and retrieve a PDF report without manual intervention in the backend code.
