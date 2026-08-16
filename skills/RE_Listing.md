# Skill: Generate NZ Real Estate Property Listing

## Description
Triggers when an agent provides rough, fragmented notes about a house, property, or section and requests a professional description or listing layout for Trade Me or Realestate.co.nz.

## Constraints
- Only use this tool if property parameters (like bedrooms, location, or price) are present in the text.
- Do not call this tool for general chat or basic greeting messages.

## Execution Profile
- *Protocol*: HTTP_POST
- *Endpoint*: http://127.0.0

## Payload Template (JSON)
{
  "agent_notes": "{{message.content}}"
}

## Response Mapping
- *Inject Target*: {{response.body.listing_copy}}
-