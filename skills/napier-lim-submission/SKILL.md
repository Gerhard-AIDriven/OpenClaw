---
name: "napier-lim-submission"
description: "Facilitates Napier LIM applications by collecting data via free-text, submitting to the API, and storing the confirmation JSON."
---

# Napier LIM Submission Skill

## Description
This skill enables the assistant to facilitate Land Information Memorandum (LIM) applications for properties in Napier. It uses a free-text interface to collect missing data, merges it with existing property records, and submits the final payload to the local real estate API.

## Workflow

### 1. Initiation
When the user requests a LIM for a property (e.g., "Start LIM for P0001"), the assistant will:
- Query the real estate database to get existing property details.
- Compare existing data against the **LIM JSON Schema** (Legal Description, Applicant Details, Application Options).
- Identify "Gaps" (missing required fields).

### 2. Data Collection (Free-Text)
The assistant will prompt the user for the missing information in a conversational manner. 
- **Example:** "I've got the address for P0001, but I'm missing the DP number and the desired delivery method. Could you provide those?"
- The assistant will continue to parse free-text replies until all critical fields for the JSON payload are satisfied.

### 3. API Submission
Once the payload is complete, the assistant will use `exec` to send a POST request to the API.

**Endpoint:** `http://127.0.0.1:8000/api/v1/realestate/lim-request` (or as specified by the current API version)
**Method:** `POST`
**Payload:** The complete LIM JSON object.

### 4. Handling the Response
The API is expected to return a formatted `.json` file containing the request confirmation and tracking details.
- The assistant will save this response to: `C:\Users\gstim\.openclaw\workspace\properties\<property_id>\lim_request_confirmation.json`.
- The assistant will then notify the user that the request has been fired and the record is updated.

## JSON Schema Reference
The payload must follow the structure:
- `property_details`: {id, legal_description {lot, dp, title}, physical_address {street, suburb, city, postcode}}
- `applicant_details`: {full_name, contact_info {email, phone}, relationship, billing_address}
- `application_options`: {request_type, additional_reports {hazard, building, resource, zoning}, delivery_method, urgency}
- `payment_info`: {payment_method, card_details {token, expiry}}

## Success Criteria
- Payload is successfully POSTed to the API.
- The returned JSON is saved to the correct property workspace folder.
- The user is informed of the successful submission.
