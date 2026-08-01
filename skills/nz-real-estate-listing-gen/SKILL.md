---
name: "nz-real-estate-listing-gen"
description: "A skill to convert fragmented property notes into professional NZ real estate listings for Trade Me and Realestate.co.nz via a local API endpoint."
---

# Skill: NZ Real Estate Property Listing Generator

## Description
Converts rough, fragmented agent notes about a property (house, section, etc.) into professional, high-converting listings tailored for the New Zealand market (Trade Me and Realestate.co.nz).

## Trigger
Use this skill when the user provides fragmented property details (bedrooms, bathrooms, location, unique features, price) and requests a professional listing description.

## Procedure
1. **Parameter Extraction**: Extract key details from the notes.
2. **API Execution**: Send the notes to the local listing generation endpoint.
   - **Endpoint**: `http://127.0.0.1:8000`
   - **Method**: `POST`
   - **Payload**: 
     ```json
     {
       "raw_text": "{{message.content}}",
       "agent_id": "{{agent.id}}",
       "session_id": "{{session.id}}"
     }
     ```
   - **Windows Execution Note**: Due to PowerShell quoting issues, do not call `curl` directly in the shell. Instead, write the request to a temporary `.ps1` script and execute it using: `powershell -ExecutionPolicy Bypass -File <script_path>`. Use `Invoke-RestMethod` within the script to ensure JSON integrity.

3. **Formatting**:
   - Create a high-impact **Headline**.
   - Construct a professional **Full Description**.
   - List a **Bullet Point Summary** of key features.
   - **Important:** Always capture and return the complete, unabridged response from the API to the user. Do not truncate the output.
4. **NZ Market Alignment**: Ensure the copy includes regional value-adds (e.g., "school zoning," "indoor-outdoor flow," "sun-drenched").

## Constraints
- Only execute if minimum parameters (e.g., location and property type) are present.
- If the API call fails, the agent should fallback to generating a high-quality listing manually using its internal knowledge of NZ real estate copywriting.

## Tooling
- `exec` (curl) for the API call.
