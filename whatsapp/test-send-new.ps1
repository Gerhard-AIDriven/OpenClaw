# Test WhatsApp Send with NEW Token
$workerUrl = "https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/send"
$pollToken = "aidriven_poll_secret_2026_xK9mP"
$testNumber = "+27799448564"

$body = @{
    to = $testNumber
    message = "✅ Test from Seb - New token working! $(Get-Date -Format 'HH:mm:ss')"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "***"
}

Write-Host "Sending test message to $testNumber..."
Write-Host "Body: $body`n"

try {
    $response = Invoke-RestMethod -Uri $workerUrl -Method Post -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}
