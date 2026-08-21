# Final test: Send to internal address to confirm API key works
# If this fails, the API key itself is broken

$apiKey = "0332a5020de3b1f0775d787bda764c5c-6648d8d0-4568b7c7"
$domain = "aidriven.biz"

# Send to YOURSELF at aidriven.biz (this SHOULD work)
$from = "AI Driven Test <postmaster@$domain>"
$to = "gerhard@aidriven.biz"  # Internal address - should always work
$subject = "🔧 INTERNAL TEST - $(Get-Date -Format 'HH:mm:ss')"
$text = "Internal delivery test.`n`nIf you receive this, the API key is working fine.`n`nThe issue is specifically with EXTERNAL sending (sandbox/verified recipients restriction).`n`n--`nAI Driven"

Write-Host "📧 Testing INTERNAL delivery (should work)..." -ForegroundColor Cyan
Write-Host "From: $from" -ForegroundColor Gray
Write-Host "To: $to" -ForegroundColor Gray
Write-Host ""

$pair = "api:$apiKey"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encodedCredentials = [Convert]::ToBase64String($bytes)

$headers = @{
    "Authorization" = "***" + $encodedCredentials
}

$body = @{
    from = $from
    to = $to
    subject = $subject
    text = $text
}

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.mailgun.net/v3/$domain/messages" `
        -Method Post `
        -Headers $headers `
        -Body $body

    Write-Host "✅ QUEUED!" -ForegroundColor Green
    Write-Host "Message ID: $($response.id)" -ForegroundColor White
    Write-Host ""
    Write-Host "Check gerhard@aidriven.biz inbox now!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "RESULT INTERPRETATION:" -ForegroundColor Yellow
    Write-Host "  ✅ If this arrives = API key works, but domain has EXTERNAL sending restrictions" -ForegroundColor White
    Write-Host "  ❌ If this FAILS = API key itself is invalid/broken" -ForegroundColor White

} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "CONCLUSION: Your API key is broken or expired." -ForegroundColor Red
    Write-Host "ACTION: Delete both API keys and create a fresh one in Mailgun Settings → API Keys" -ForegroundColor Yellow
}
