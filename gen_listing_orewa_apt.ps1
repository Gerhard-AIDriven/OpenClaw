$body = @{
    raw_text = "2 bedroom 1 bathroom apartment in Orewa for 400k"
    agent_id = "sebastian"
    session_id = "85e79f95-3f0a-4d37-94b7-b6eeb9a90fd8"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000" -Method Post -Body $body -ContentType "application/json"
