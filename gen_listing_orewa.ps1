$body = @{
    raw_text = "3 bedroom, office with seperate entrance, 3 bathrooms, large well equiped kitchen with buttlers pantry, double garage in Orewa for 2million."
    agent_id = "sebastian"
    session_id = "85e79f95-3f0a-4d37-94b7-b6eeb9a90fd8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000" -Method Post -Body $body -ContentType "application/json"
