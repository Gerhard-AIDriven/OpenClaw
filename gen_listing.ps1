$body = @{
    raw_text = "New apartment in Napier. 3bed 1.5 bath. 2 beds on 1st floor, 1 bed on ground floor. Openplan lounge and kitchen. 2 Open parkings. Price 999000."
    agent_id = "sebastian"
    session_id = "85e79f95-3f0a-4d37-94b7-b6eeb9a90fd8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000" -Method Post -Body $body -ContentType "application/json"
