
$body = @{
    raw_text = "New listing in Napier. 1000 square meter plot with approved plan for construction of 3 bedroom 2 bathroom house with modern upmarket finishes in kitchen and bathrooms. Double lockup car parking is optional. Price 1.5 million."
    agent_id = "seb"
    session_id = "661a3c71-3804-4d6c-ab04-fc2d59d4e238"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json
