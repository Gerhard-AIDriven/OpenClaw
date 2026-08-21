# Diagnostic Test - Checks Mailgun Account Status
# This will help us understand WHY 401 is happening

$apiKey = "dea06fd768f566dfd3a35de38e3ddbb0-6648d8d0-c028d450"
$domain = "aidriven.biz"

Write-Host "🔍 MAILGUN DIAGNOSTIC TEST" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Build auth header
$pair = "api:$apiKey"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$encodedCredentials = [Convert]::ToBase64String($bytes)
$headers = @{ "Authorization" = "***" + $encodedCredentials }

# Test 1: Check Domain Status via API
Write-Host "Test 1: Checking domain status..." -ForegroundColor Gray
try {
    $domainResponse = Invoke-RestMethod `
        -Uri "https://api.mailgun.net/v3/domains/$domain" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Domain API accessible" -ForegroundColor Green
    Write-Host "   State: $($domainResponse.domain.state)" -ForegroundColor White
    if ($domainResponse.domain.receiving_dns_records) {
        Write-Host "   DNS: Configured" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Domain API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Try sending to authorized recipient
Write-Host "Test 2: Sending to authorized recipient (gstimie@gmail.com)..." -ForegroundColor Gray
$body = @{
    from = "AI Driven <postmaster@$domain>"
    to = "gstimie@gmail.com"
    subject = "🔬 DIAGNOSTIC TEST - $(Get-Date -Format 'HH:mm:ss')"
    text = "Diagnostic test email.`n`nIf you receive this, authorized recipients are working.`n`nTime: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.mailgun.net/v3/$domain/messages" `
        -Method Post `
        -Headers $headers `
        -Body $body
    
    Write-Host "✅ EMAIL QUEUED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "   Message ID: $($response.id)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 IT WORKS! Check gstimie@gmail.com inbox now!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If it queued but you don't receive it, check:" -ForegroundColor Yellow
    Write-Host "  1. Gmail spam folder" -ForegroundColor Gray
    Write-Host "  2. Mailgun logs for 'delivered' vs 'failed' status" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host ""
        Write-Host "   Mailgun Response Details:" -ForegroundColor Yellow
        Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor White
        
        # Parse common error patterns
        if ($_.ErrorDetails.Message -like "*sandbox*") {
            Write-Host ""
            Write-Host "   ⚠️  Sandbox mode detected - domain not in production" -ForegroundColor Red
        }
        if ($_.ErrorDetails.Message -like "*unverified*") {
            Write-Host ""
            Write-Host "   ⚠️  Recipient not verified - add to authorized list" -ForegroundColor Red
        }
        if ($_.ErrorDetails.Message -like "*forbidden*" -or $_.Exception.Response.StatusCode -eq 401) {
            Write-Host ""
            Write-Host "   ⚠️  Account/Key restriction - likely free tier without phone verification" -ForegroundColor Red
            Write-Host "   ACTION: Go to Settings → Account Settings → Verify Phone" -ForegroundColor Cyan
        }
    }
}

Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Diagnostic complete." -ForegroundColor Cyan
