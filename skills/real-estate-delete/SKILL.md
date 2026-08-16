---
name: "real-estate-delete"
description: "Delete a property listing from the local real estate database using its unique property ID."
---

# Real Estate Property Deletion Skill

## Description
This skill allows the assistant to remove a specific property listing from the local real estate database using its unique property identifier (e.g., "P0001").

## API Specification
- **Base URL:** `http://127.0.0.1:8000`
- **Endpoint:** `/api/v1/realestate/listing/{property_id}`
- **Method:** `DELETE`
- **Expected Response:** A confirmation that the property was successfully deleted or an error message.

## Procedure

### 1. Identify the Property ID
When the user asks to delete a property, ensure a unique identifier (like "P0001") is provided. If the user just gives a name or address, use the `real-estate-query` skill first to find the associated ID.

### 2. Confirm the Action
Since this is a destructive action, always confirm the property details (ID and Address/Title) with the user before proceeding to the deletion step.

### 3. Construct the API Call
Use a direct `exec` call to send a DELETE request to the local endpoint.

**Request Format:**
```bash
curl -X DELETE http://127.0.0.1:8000/api/v1/realestate/listing/P0001
```

### 4. Handle the Response
- **Success:** Confirm to the user that the property with the specified ID has been removed from the database.
- **Error (404):** Inform the user that the property ID was not found.
- **Error (Other):** Report the API error and suggest checking the local server status.

## Example Workflow
- **User:** "Delete property P0001"
- **Assistant:** "Just to confirm, you want to delete property P0001 (The Ahuriri Home). Should I proceed?"
- **User:** "Yes"
- **Assistant:** (Calls API) "Property P0001 has been successfully deleted."
