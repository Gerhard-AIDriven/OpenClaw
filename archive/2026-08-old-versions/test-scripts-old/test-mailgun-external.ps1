# Send test email to EXTERNAL address (not @aidriven.biz)
# This tests if Mailgun can actually deliver emails

$apiKey = "6648d8d0-c028d450"  # Paste your EXACT API key
$domain = "aidriven.biz"
$fromEmail = "support@aidriven.biz"

# CHANGE THIS to your personal Gmail, Outlook, or other non-aidriven email
$toEmail = "gstimie@gmail.com"  # <-- UPDATE THIS!

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$uniqueId = Get-Random -Maximum 9999

$pair = "api:$apiKey"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encodedCredentials = [Convert]::ToBase64String($bytes)

$headers = @{
    "Authorization" = "***"
}

$body = @{
    from = "AI Driven <$fromEmail>"
    to = $toEmail
    subject = "🎩 EXTERNAL TEST #$uniqueId - Mailgun Delivery Check"
    text = "AI Driven Email Delivery Test`n`nSent at: $timestamp`nTest ID: #$uniqueId`n`nThis is being sent to an external email address to verify Mailgun can deliver outside the aidriven.biz domain.`n`nIf you receive this, Mailgun delivery is working correctly!`n`n--`nAI Driven | Practical AI for real businesses`naidriven.biz"
}

Write-Host "📧 Sending test email to EXTERNAL address..." -ForegroundColor Cyan
Write-Host "From: $fromEmail" -ForegroundColor Gray
Write-Host "To: $toEmail" -ForegroundColor Gray
Write-Host "Time: $timestamp" -ForegroundColor Gray
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
    Write-Host "🔍 Now check:" -ForegroundColor Yellow
    Write-Host "1. Your personal email inbox ($toEmail) for subject: '🎩 EXTERNAL TEST #$uniqueId'" -ForegroundColor Cyan
    Write-Host "2. Wait 1-2 minutes for delivery" -ForegroundColor Gray
    Write-Host "3. Check spam folder if not in inbox" -ForegroundColor Gray
    Write-Host ""
    Write-Host "If this arrives but the aidriven.biz email doesn't, the issue is with your MX/DNS routing." -ForegroundColor Yellow

} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
