# OpenClaw Backup Script
# Creates a complete backup package for migration to new machine
# Run this before moving to new hardware

$ErrorActionPreference = "Stop"
$BackupDate = Get-Date -Format "yyyy-MM-dd_HH-mm"
$BackupRoot = "C:\Users\gstim\.openclaw-backup-$BackupDate"
$OpenClawPath = "C:\Users\gstim\.openclaw"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OpenClaw Backup Creator" -ForegroundColor Cyan
Write-Host "  Date: $BackupDate" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Create backup directory structure
Write-Host "[1/7] Creating backup directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupRoot\credentials" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupRoot\cron" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupRoot\state" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupRoot\settings" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupRoot\skill-workshop" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupRoot\workspace" | Out-Null

# Copy critical folders
Write-Host "[2/7] Backing up credentials..." -ForegroundColor Yellow
if (Test-Path "$OpenClawPath\credentials") {
    Copy-Item -Path "$OpenClawPath\credentials\*" -Destination "$BackupRoot\credentials\" -Recurse -Force
    Write-Host "  ✅ Credentials backed up" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Credentials folder not found" -ForegroundColor Yellow
}

Write-Host "[3/7] Backing up cron jobs..." -ForegroundColor Yellow
if (Test-Path "$OpenClawPath\cron") {
    Copy-Item -Path "$OpenClawPath\cron\*" -Destination "$BackupRoot\cron\" -Recurse -Force
    Write-Host "  ✅ Cron jobs backed up" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Cron folder not found" -ForegroundColor Yellow
}

Write-Host "[4/7] Backing up state..." -ForegroundColor Yellow
if (Test-Path "$OpenClawPath\state") {
    Copy-Item -Path "$OpenClawPath\state\*" -Destination "$BackupRoot\state\" -Recurse -Force
    $StateSize = (Get-ChildItem "$BackupRoot\state" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  ✅ State backed up ($([math]::Round($StateSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  State folder not found" -ForegroundColor Yellow
}

Write-Host "[5/7] Backing up settings and skill-workshop..." -ForegroundColor Yellow
if (Test-Path "$OpenClawPath\settings") {
    Copy-Item -Path "$OpenClawPath\settings\*" -Destination "$BackupRoot\settings\" -Recurse -Force
    Write-Host "  ✅ Settings backed up" -ForegroundColor Green
}
if (Test-Path "$OpenClawPath\skill-workshop") {
    Copy-Item -Path "$OpenClawPath\skill-workshop\*" -Destination "$BackupRoot\skill-workshop\" -Recurse -Force
    Write-Host "  ✅ Skill workshop backed up" -ForegroundColor Green
}

# Export cron jobs via OpenClaw CLI
Write-Host "[6/7] Exporting cron job definitions..." -ForegroundColor Yellow
try {
    Set-Location $OpenClawPath
    $cronExport = openclaw cron list --includeDisabled true 2>&1 | Out-String
    $cronExport | Out-File -FilePath "$BackupRoot\cron-export.txt" -Encoding UTF8
    Write-Host "  ✅ Cron jobs exported" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Could not export cron jobs (OpenClaw may not be running)" -ForegroundColor Yellow
}

# Collect system information
Write-Host "[7/7] Collecting system information..." -ForegroundColor Yellow
$systemInfo = @"
# OpenClaw Migration Backup Information
# Created: $BackupDate
# Machine: $env:COMPUTERNAME
# User: $env:USERNAME

## System Versions
Node.js: $(node --version 2>$null)
OpenClaw: $(openclaw --version 2>&1 | Select-Object -First 1)
Windows: $(Get-ComputerInfo | Select-Object WindowsVersion, OsBuildNumber | Format-Table -HideTableHeaders | Out-String)

## Environment Variables to Recreate
Check these in Windows Environment Variables (System Properties > Advanced > Environment Variables):
- OPENCLAW_GATEWAY_TOKEN
- ANTHROPIC_API_KEY (if used)
- OPENAI_API_KEY (if used)
- MAILGUN_API_KEY (stored in Cloudflare Worker, not here)

## Gmail OAuth Files
Location: C:\Users\gstim\.openclaw\workspace\gmail\
- credentials.json (OAuth client credentials)
- token.json (OAuth access token - may need re-authentication on new machine)

## Backup Contents
- credentials/: OAuth tokens and API keys
- cron/: Scheduled job configurations
- state/: Session state ($(Get-ChildItem "$BackupRoot\state" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB MB)
- settings/: User preferences
- skill-workshop/: Custom skills
- cron-export.txt: Human-readable cron job list

## Next Steps
1. Copy this entire backup folder to external drive or cloud storage
2. On new machine, run restore-openclaw.ps1 script
3. Re-authenticate Gmail if token.json expires
4. Verify all API keys are set in environment variables
"@

$systemInfo | Out-File -FilePath "$BackupRoot\MIGRATION_INFO.md" -Encoding UTF8
Write-Host "  ✅ System info collected" -ForegroundColor Green

# Calculate total backup size
$TotalSize = (Get-ChildItem $BackupRoot -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Backup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Location: $BackupRoot" -ForegroundColor Yellow
Write-Host "Total Size: $([math]::Round($TotalSize, 2)) MB" -ForegroundColor Yellow
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Copy this folder to external drive or cloud storage" -ForegroundColor White
Write-Host "2. Keep it safe until migration is complete" -ForegroundColor White
Write-Host "3. On new machine, run restore-openclaw.ps1" -ForegroundColor White
Write-Host "`n" -ForegroundColor White

Set-Location "C:\Users\gstim\.openclaw\workspace"
