$body = @{
    raw_text = "3 bed 2 bath home on low maintenance plot. Double garaging with double carport for boat trailer or caravan. Low maintenance garden. Modern kitchen. In Ahuriri with sea views. Price 1.9million."
    agent_id = "sebastian"
    session_id = "85e79f95-3f0a-4d37-94b7-b6eeb9a90fd8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000" -Method Post -Body $body -ContentType "application/json"
