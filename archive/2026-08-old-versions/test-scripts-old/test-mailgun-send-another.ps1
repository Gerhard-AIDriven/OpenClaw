# Send another test email with timestamp tracking
# This helps us identify the exact email in Mailgun dashboard

$apiKey = "YOUR_MAILGUN_API_KEY_HERE"  # Paste your EXACT API key
$domain = "aidriven.biz"
$fromEmail = "support@aidriven.biz"
$toEmail = "gerhard@aidriven.biz"

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
    subject = "🎩 TEST #$uniqueId - $timestamp"
    text = "AI Driven Email Test`n`nSent at: $timestamp`nTest ID: #$uniqueId`n`nIf you receive this, Mailgun delivery is working!`n`n--`nAI Driven | Practical AI for real businesses`naidriven.biz"
}

Write-Host "📧 Sending test email #$uniqueId..." -ForegroundColor Cyan
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
    Write-Host "1. Gmail inbox (and spam) for subject: '🎩 TEST #$uniqueId - $timestamp'" -ForegroundColor Cyan
    Write-Host "2. Mailgun Dashboard → Sending → Logs (search for ID: $($response.id))" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Waiting ~30 seconds for delivery..." -ForegroundColor Gray

} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
