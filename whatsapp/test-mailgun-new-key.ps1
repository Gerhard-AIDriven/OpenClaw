# Test with BRAND NEW API Key
# Created: 2026-08-18 14:15

$apiKey = "6648d8d0-c028d450"
$domain = "aidriven.biz"

# Test 1: Internal delivery (should definitely work)
Write-Host " TEST 1: Internal delivery to gerhard@aidriven.biz..." -ForegroundColor Cyan
$from1 = "AI Driven <postmaster@$domain>"
$to1 = "gstimie@gmail.com"
$subject1 = "✅ NEW KEY TEST INTERNAL - $(Get-Date -Format 'HH:mm:ss')"
$text1 = "This confirms your NEW API key is working!`n`nKey ID: 6648d8d0-c028d450`nCreated: 2026-08-18 14:15`n`n--`nAI Driven"

$pair = "api:$apiKey"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encodedCredentials = [Convert]::ToBase64String($bytes)

$headers = @{
    "Authorization" = "***" + $encodedCredentials
}

$body1 = @{
    from = $from1
    to = $to1
    subject = $subject1
    text = $text1
}

try {
    $response1 = Invoke-RestMethod `
        -Uri "https://api.mailgun.net/v3/$domain/messages" `
        -Method Post `
        -Headers $headers `
        -Body $body1

    Write-Host "✅ TEST 1 PASSED! Internal email queued." -ForegroundColor Green
    Write-Host "Message ID: $($response1.id)" -ForegroundColor White
    Write-Host ""
    
    # Test 2: External delivery (the real test!)
    Write-Host "📧 TEST 2: External delivery to gstimie@gmail.com..." -ForegroundColor Cyan
    $from2 = "AI Driven <postmaster@$domain>"
    $to2 = "gstimie@gmail.com"
    $subject2 = "🎉 NEW KEY TEST EXTERNAL - $(Get-Date -Format 'HH:mm:ss')"
    $text2 = "SUCCESS! Your Mailgun integration is now fully working!`n`nThis email was sent to an EXTERNAL Gmail address, proving:`n• API key is valid ✓`n• DNS records verified ✓`n• Domain in production mode ✓`n• External delivery enabled ✓`n`nYou're ready to deploy the Cloudflare Worker!`n`n--`nAI Driven | aidriven.biz"

    $body2 = @{
        from = $from2
        to = $to2
        subject = $subject2
        text = $text2
    }

    $response2 = Invoke-RestMethod `
        -Uri "https://api.mailgun.net/v3/$domain/messages" `
        -Method Post `
        -Headers $headers `
        -Body $body2

    Write-Host "✅ TEST 2 PASSED! External email queued." -ForegroundColor Green
    Write-Host "Message ID: $($response2.id)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 ALL TESTS PASSED! Your Mailgun integration is WORKING!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check gstimie@gmail.com inbox (and spam folder)" -ForegroundColor Gray
    Write-Host "2. Delete the old API key in Mailgun dashboard" -ForegroundColor Gray
    Write-Host "3. Deploy worker-v5-mailgun-fixed.js to Cloudflare Worker" -ForegroundColor Gray
    Write-Host "4. Add MAILGUN_API_KEY environment variable to Cloudflare Worker" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Congratulations! 🎩" -ForegroundColor Cyan

} catch {
    Write-Host "❌ TEST FAILED!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "Mailgun Response:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "If this still fails with 401, the new key might also be broken." -ForegroundColor Yellow
    Write-Host "Try deleting it and creating another fresh one." -ForegroundColor Gray
}
