---
name: "real-estate-query"
description: "Query a local real estate database API to retrieve property listings based on natural language criteria."
---

# Real Estate Property Query Skill

## Description
This skill allows the assistant to query a local real estate database API to retrieve property listings based on specific criteria (e.g., location, bedroom count, price) provided in natural language.

## API Specification
- **Base URL:** `http://127.0.0.1:8000` (Ensure this is used instead of http://localhost:11434/)
- **Endpoint:** `/api/v1/realestate/query`
- **Method:** `POST`
- **Payload:** JSON object containing the `question` field.
- **Expected Response:** A list of properties matching the criteria.

## Procedure

### 1. Analyze the Request
When the user asks for properties, identify the filtering criteria (Location, Bedrooms, etc.) and whether they requested a summary or full details.

### 2. Construct the API Call
Use a direct `exec` call to send a POST request to the local endpoint.

**Request Format:**
```json
{
  "question": "properties in Napier" 
}
```

### 3. Handle the Response
- **Success:** Parse the returned JSON list of properties.
- **No Results:** Inform the user that no properties matching those criteria were found.
- **Error:** Report the API error and suggest checking if the local API server is running.

### 4. Present the Data

**A. Summary Format (Default):**
Provide a concise overview for each property using this structure:
- **ID:** [Property ID (e.g., P0001)]
- **Title:** 🏠 [Catchy Name/Location]
- **Price:** [Price]
- **Brief Description:** A 2-3 sentence summary highlighting the main appeal.
- **Key Highlights:** A few bullet points of the most important features.

**B. Full Details Format (Explicitly Requested):**
Present the full `listing_text` provided by the API, preserving the markdown formatting. Include the Property ID at the top.

## Example Queries
- "Show me all properties in Napier" $\rightarrow$ Summary list including Property IDs.
- "Give me the full details for P0001" $\rightarrow$ Full listing text for that ID.
