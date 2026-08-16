---
name: "real-estate-add"
description: "Add a new property listing to the local real estate database via API."
---

# Real Estate Property Addition Skill

## Description
This skill allows the assistant to add new property listings to the local real estate database. It is designed to support API debugging by providing full error details upon failure.

## API Specification
- **Base URL:** `http://127.0.0.1:8000` (Ensure this is used instead of http://localhost:11434/)
- **Endpoint:** `/api/v1/realestate/listing`
- **Method:** `POST`
- **Payload:** JSON object containing the property details.
- **Expected Response:** Confirmation of creation and the assigned property ID.

## Procedure

### 1. Extract Property Data
When the user provides a new listing, extract the key attributes:
- **Location/Address**
- **Bedrooms/Bathrooms**
- **Features** (e.g., open plan, patio, parking)
- **Price**

### 2. Construct the API Call
Use a direct `exec` call to send a POST request to the local endpoint. 

**Example Request:**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/realestate/listing -H "Content-Type: application/json" -d '{"location": "Orewa", "bedrooms": 2, "bathrooms": 1, "price": 3500000, "notes": "Open plan kitchen, ground floor, undercover patio"}'
```

### 3. Handle the Response (Debugging Mode)
- **Success:** Confirm that the property has been successfully added to the database.
- **Failure:** If the API returns an error (4xx or 5xx), **provide the full, raw error response** to the user to assist with debugging. Do not summarize the error; deliver the exact output from the API.

## Example Workflow
- **User:** "Add a 2 bed apartment in Orewa for 3.5M"
- **Assistant:** (Calls API)
- **Outcome A (Success):** "Property successfully added to the database."
- **Outcome B (Failure):** "The API request failed. Here is the full error detail: [Raw API Output]"
