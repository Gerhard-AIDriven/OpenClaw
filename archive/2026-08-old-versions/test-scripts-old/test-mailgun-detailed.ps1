# Test Mailgun with Detailed Logging
# This version shows more details about what's happening

# ============================================
# CONFIGURATION
# ============================================

$apiKey = "YOUR_MAILGUN_API_KEY_HERE"  # Paste your EXACT API key from Mailgun
$domain = "aidriven.biz"
$fromEmail = "support@aidriven.biz"
$toEmail = "gerhard@aidriven.biz"

# ============================================
# BUILD THE REQUEST
# ============================================

$pair = "api:$apiKey"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encodedCredentials = [Convert]::ToBase64String($bytes)

$headers = @{
    "Authorization" = "***"
}

$body = @{
    from = "AI Driven <$fromEmail>"
    to = $toEmail
    subject = "Mailgun Test - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    text = "Test email sent at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`nIf you see this, delivery worked!"
}

# ============================================
# SEND WITH VERBOSE OUTPUT
# ============================================

Write-Host "📧 Sending test email..." -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

try {
    # Use Invoke-WebRequest for more detailed response
    $response = Invoke-WebRequest `
        -Uri "https://api.mailgun.net/v3/$domain/messages" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing

    Write-Host "✅ HTTP Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Response:" -ForegroundColor Green
    
    # Parse and display the response
    $responseObj = $response.Content | ConvertFrom-Json
    Write-Host "   Message: $($responseObj.message)" -ForegroundColor White
    Write-Host "   ID: $($responseObj.id)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📬 Email queued successfully!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check gerhard@aidriven.biz inbox (and spam/junk folder)" -ForegroundColor Gray
    Write-Host "2. Wait up to 2-3 minutes for delivery" -ForegroundColor Gray
    Write-Host "3. Check Mailgun logs at: https://app.mailgun.com/mg/sending/aidriven.biz/logs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Email ID for tracking: $($responseObj.id)" -ForegroundColor Gray

} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Error 401: Unauthorized - API key or domain issue" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "Error 403: Forbidden - Domain not verified or sandbox mode" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Error 400: Bad Request - Invalid parameters" -ForegroundColor Red
    }
    
    Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor White
    }
}
