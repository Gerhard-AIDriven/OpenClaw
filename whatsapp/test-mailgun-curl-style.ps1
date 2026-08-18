# Test using Mailgun's official cURL example format
# This matches exactly what Mailgun shows in their setup wizard

$apiKey = "0332a5020de3b1f0775d787bda764c5c-6648d8d0-4568b7c7"
$domain = "aidriven.biz"

# Using postmaster@ domain (Mailgun's default sender from their example)
$from = "Mailgun Sandbox <postmaster@$domain>"
$to = "gstimie@gmail.com"  # Your external Gmail
$subject = "Test from Mailgun Setup Wizard - $(Get-Date -Format 'HH:mm:ss')"
$text = "Congratulations! If you received this, Mailgun production sending is working!"

Write-Host "📧 Testing with Mailgun's official example format..." -ForegroundColor Cyan
Write-Host "From: $from" -ForegroundColor Gray
Write-Host "To: $to" -ForegroundColor Gray
Write-Host "API Key ID: 6648d8d0-4568b7c7" -ForegroundColor Gray
Write-Host ""

# Build Basic Auth header exactly like cURL --user 'api:APIKEY'
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

    Write-Host "✅ SUCCESS! Email queued." -ForegroundColor Green
    Write-Host "Message ID: $($response.id)" -ForegroundColor White
    Write-Host ""
    Write-Host "Check your Gmail inbox ($to) in 1-2 minutes!" -ForegroundColor Cyan

} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host ""
        Write-Host "401 Unauthorized - This means:" -ForegroundColor Yellow
        Write-Host "  • API key is invalid/expired, OR" -ForegroundColor Gray
        Write-Host "  • Domain has restrictions (sandbox mode), OR" -ForegroundColor Gray
        Write-Host "  • From address not authorized" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Let's check your API key in Mailgun dashboard." -ForegroundColor Cyan
    }
    
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Response from Mailgun:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor White
    }
}
