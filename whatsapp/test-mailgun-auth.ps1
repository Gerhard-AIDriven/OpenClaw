# Test Mailgun API Authentication
# Run this to verify your Mailgun API key is working before deploying to Cloudflare

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================

$apiKey = "0332a5020de3b1f0775d787bda764c5c-6648d8d0-4568b7c7"  # Paste your EXACT API key from Mailgun (no modifications!)
$domain = "aidriven.biz"
$fromEmail = "support@aidriven.biz"
$toEmail = "gerhard@aidriven.biz"  # Change to your test email if needed

# ============================================
# BUILD THE REQUEST
# ============================================

# Create credentials object for Basic Auth
$pair = "api:$apiKey"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encodedCredentials = [Convert]::ToBase64String($bytes)

$headers = @{
    "Authorization" = "Basic $encodedCredentials"
}

$body = @{
    from = "AI Driven <$fromEmail>"
    to = $toEmail
    subject = "Mailgun Auth Test - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    text = "This is a test email to verify Mailgun API authentication is working correctly.`n`nIf you received this, the API key is valid!`n`nAI Driven | Practical AI for real businesses"
}

# ============================================
# SEND THE REQUEST
# ============================================

Write-Host "📧 Testing Mailgun API authentication..." -ForegroundColor Cyan
Write-Host "Domain: $domain" -ForegroundColor Gray
Write-Host "From: $fromEmail" -ForegroundColor Gray
Write-Host "To: $toEmail" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.mailgun.net/v3/$domain/messages" `
        -Method Post `
        -Headers $headers `
        -Body $body

    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response.message)" -ForegroundColor Green
    Write-Host "ID: $($response.id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Check your inbox at $toEmail for the test email!" -ForegroundColor Cyan

} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Troubleshooting tips:" -ForegroundColor Cyan
    Write-Host "1. Check that API key is copied EXACTLY from Mailgun (no extra spaces)" -ForegroundColor Gray
    Write-Host "2. Verify domain 'aidriven.biz' is active in Mailgun dashboard" -ForegroundColor Gray
    Write-Host "3. Make sure you're using Private API Key, not Public" -ForegroundColor Gray
    Write-Host "4. If key starts with 'key-' in Mailgun, include it. If not, don't add it." -ForegroundColor Gray
}
