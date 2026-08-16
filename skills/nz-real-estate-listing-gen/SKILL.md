---
name: "nz-real-estate-listing-gen"
description: "A skill to convert fragmented property notes into professional NZ real estate listings for Trade Me and Realestate.co.nz via a local API endpoint."
---

# NZ Real Estate Listing Generator Skill

## Description
This skill transforms raw property notes into professional real estate advertisements and integrates with the local real estate API to save the property data.

## API Specification
- **Base URL:** `http://127.0.0.1:8000` (Ensure this is used instead of http://localhost:11434/)
- **Endpoint:** `/api/v1/realestate/listing`
- **Method:** `POST`
- **Payload:** JSON object containing property details.

## Procedure

### 1. Gather and Extract Property Data
Extract key features from the user's input (Location, Bedrooms, Bathrooms, Price, Features).

### 2. Automatically Save to Database
Send the extracted data to the local API.

**Handling the API Result (Debugging Priority):**
- **Success:** Proceed to generate the full advertisement.
- **Failure:** Stop and provide the **full, raw error detail** from the API.

### 3. Generate and Present FULL Advertisement
When a **new** listing is provided by the user, always generate and present the **full listing text** (the comprehensive ad) as the primary response. This allows the user to review the marketing copy immediately.

## Example Workflow
- **User:** "New listing in Orewa, 4 bed, 2 bath, 1.4M..."
- **Assistant:** (Saves to API) $\rightarrow$ (API Success) $\rightarrow$ "Property saved. Here is the full advertisement: [Full Detailed Ad Text]"
