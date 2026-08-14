# Debug WhatsApp Send
$workerUrl = "https://aidriven-whatsapp-webhook.gerhard-8a6.workers.dev/send"
$pollToken = "aidriven_poll_secret_2026_xK9mP"
$testNumber = "+27799448564"

$body = @{
    to = $testNumber
    message = "Debug test $(Get-Date -Format 'HH:mm:ss')"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $pollToken"
}

Write-Host "=== Testing /send endpoint ===" -ForegroundColor Cyan
Write-Host "URL: $workerUrl"
Write-Host "Token: $pollToken"
Write-Host "To: $testNumber"
Write-Host "Body: $body`n"

try {
    $response = Invoke-RestMethod -Uri $workerUrl -Method Post -Headers $headers -Body $body
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "`n❌ FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
