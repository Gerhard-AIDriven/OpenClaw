# Test WhatsApp Send via Cloudflare Worker
$workerUrl = "https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/send"
$pollToken = "aidriven_poll_secret_2026_xK9mP"
$testNumber = "+27799448564"

$body = @{
    to = $testNumber
    message = "Test from Seb - webhook send test $(Get-Date -Format 'HH:mm:ss')"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $pollToken"
}

Write-Host "Sending test message to $testNumber..."
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri $workerUrl -Method Post -Headers $headers -Body $body
    Write-Host "`n✅ Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "`n❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host $_.ErrorDetails.Message
}
