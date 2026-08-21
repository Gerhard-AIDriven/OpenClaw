# Send test email to EXTERNAL address - Version 2
# Uses support@aidriven.biz as from address (verified sender)

$apiKey = "0332a5020de3b1f0775d787bda764c5c-6648d8d0-4568b7c7"
$domain = "aidriven.biz"
$fromEmail = "support@aidriven.biz"  # Use verified sender
$toEmail = "gstimie@gmail.com"

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$uniqueId = Get-Random -Maximum 9999

$pair = "api:$apiKey"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encodedCredentials = [Convert]::ToBase64String($bytes)

$headers = @{
    "Authorization" = "***" + $encodedCredentials
}

$body = @{
    from = "AI Driven <$fromEmail>"
    to = $toEmail
    subject = "🎩 TEST EXTERNAL #$uniqueId - $(Get-Date -Format 'HH:mm:ss')"
    text = "AI Driven External Delivery Test`n`nSent: $timestamp`nTest ID: #$uniqueId`n`nFrom: $fromEmail`nTo: $toEmail`n`nIf you receive this, Mailgun external delivery is WORKING!`n`n--`nAI Driven | aidriven.biz"
}

Write-Host "📧 Testing EXTERNAL email delivery..." -ForegroundColor Cyan
Write-Host "From: $fromEmail" -ForegroundColor Gray
Write-Host "To: $toEmail" -ForegroundColor Gray
Write-Host "Time: $timestamp" -ForegroundColor Gray
Write-Host "API Key ID: 6648d8d0-4568b7c7" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.mailgun.net/v3/$domain/messages" `
        -Method Post `
        -Headers $headers `
        -Body $body

    Write-Host "✅ QUEUED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "Message ID: $($response.id)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Check your Gmail inbox ($toEmail) in 1-2 minutes!" -ForegroundColor Cyan
    Write-Host "Also check spam folder just in case." -ForegroundColor Gray

} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host ""
        Write-Host "401 Unauthorized - Possible causes:" -ForegroundColor Yellow
        Write-Host "1. API key is restricted to specific sending domains" -ForegroundColor Gray
        Write-Host "2. From address not verified in Mailgun" -ForegroundColor Gray
        Write-Host "3. Domain still in sandbox mode despite DNS verification" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Try checking Mailgun dashboard for domain restrictions." -ForegroundColor Cyan
    }
    
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
