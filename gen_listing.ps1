
$body = @{
    raw_text = "2 bedroom 1 bathroom apartment for 400k in Orewa"
    agent_id = "seb"
    session_id = "661a3c71-3804-4d6c-ab04-fc2d59d4e238"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json
