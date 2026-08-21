# OpenClaw Restoration Script
# Restores OpenClaw from backup on new machine
# Run this AFTER installing Node.js and OpenClaw on the new machine

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupPath
)

$ErrorActionPreference = "Stop"
$OpenClawPath = "C:\Users\$env:USERNAME\.openclaw"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OpenClaw Restoration" -ForegroundColor Cyan
Write-Host "  Backup Source: $BackupPath" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verify backup exists
if (-not (Test-Path $BackupPath)) {
    Write-Host "❌ ERROR: Backup folder not found at $BackupPath" -ForegroundColor Red
    exit 1
}

Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "  ✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js not found! Install Node.js first." -ForegroundColor Red
    Write-Host "     Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if OpenClaw is installed
try {
    $openclawVersion = openclaw --version 2>&1 | Select-Object -First 1
    Write-Host "  ✅ OpenClaw detected: $openclawVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  OpenClaw not found. Installing..." -ForegroundColor Yellow
    npm install -g openclaw@latest
    Write-Host "  ✅ OpenClaw installed" -ForegroundColor Green
}

# Create OpenClaw directory structure
Write-Host "[2/6] Creating OpenClaw directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $OpenClawPath | Out-Null
New-Item -ItemType Directory -Force -Path "$OpenClawPath\credentials" | Out-Null
New-Item -ItemType Directory -Force -Path "$OpenClawPath\cron" | Out-Null
New-Item -ItemType Directory -Force -Path "$OpenClawPath\state" | Out-Null
New-Item -ItemType Directory -Force -Path "$OpenClawPath\settings" | Out-Null
New-Item -ItemType Directory -Force -Path "$OpenClawPath\skill-workshop" | Out-Null
Write-Host "  ✅ Directory structure created" -ForegroundColor Green

# Restore folders
Write-Host "[3/6] Restoring credentials..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\credentials") {
    Copy-Item -Path "$BackupPath\credentials\*" -Destination "$OpenClawPath\credentials\" -Recurse -Force
    Write-Host "  ✅ Credentials restored" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  No credentials in backup" -ForegroundColor Yellow
}

Write-Host "[4/6] Restoring cron jobs..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\cron") {
    Copy-Item -Path "$BackupPath\cron\*" -Destination "$OpenClawPath\cron\" -Recurse -Force
    Write-Host "  ✅ Cron jobs restored" -ForegroundColor Green
}

Write-Host "[5/6] Restoring state, settings, and skills..." -ForegroundColor Yellow
if (Test-Path "$BackupPath\state") {
    Copy-Item -Path "$BackupPath\state\*" -Destination "$OpenClawPath\state\" -Recurse -Force
    $StateSize = (Get-ChildItem "$OpenClawPath\state" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  ✅ State restored ($([math]::Round($StateSize, 2)) MB)" -ForegroundColor Green
}
if (Test-Path "$BackupPath\settings") {
    Copy-Item -Path "$BackupPath\settings\*" -Destination "$OpenClawPath\settings\" -Recurse -Force
    Write-Host "  ✅ Settings restored" -ForegroundColor Green
}
if (Test-Path "$BackupPath\skill-workshop") {
    Copy-Item -Path "$BackupPath\skill-workshop\*" -Destination "$OpenClawPath\skill-workshop\" -Recurse -Force
    Write-Host "  ✅ Skill workshop restored" -ForegroundColor Green
}

# Restore workspace (Git clone or copy)
Write-Host "[6/6] Setting up workspace..." -ForegroundColor Yellow
$WorkspacePath = "$OpenClawPath\workspace"
if (Test-Path "$BackupPath\workspace") {
    # Check if it's a Git repo
    if (Test-Path "$BackupPath\workspace\.git") {
        Write-Host "  Workspace is a Git repository. Recommended steps:" -ForegroundColor Yellow
        Write-Host "  1. cd $WorkspacePath" -ForegroundColor Gray
        Write-Host "  2. git remote -v  (check GitHub account)" -ForegroundColor Gray
        Write-Host "  3. git pull origin master" -ForegroundColor Gray
        Write-Host "  OR clone fresh from GitHub if preferred" -ForegroundColor Gray
    } else {
        Copy-Item -Path "$BackupPath\workspace\*" -Destination "$WorkspacePath\" -Recurse -Force
        Write-Host "  ✅ Workspace restored from backup" -ForegroundColor Green
    }
} else {
    Write-Host "  ℹ️  No workspace in backup. Clone from GitHub:" -ForegroundColor Yellow
    Write-Host "  git clone https://github.com/Gerhard-AIDriven/OpenClaw.git $WorkspacePath" -ForegroundColor Gray
}

# Display migration info
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Restoration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

if (Test-Path "$BackupPath\MIGRATION_INFO.md") {
    Write-Host "`n📄 Migration Info File:" -ForegroundColor Cyan
    Write-Host "   $BackupPath\MIGRATION_INFO.md" -ForegroundColor Yellow
    Write-Host "   Review this for environment variables to set!" -ForegroundColor Yellow
}

Write-Host "`n🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set environment variables (see MIGRATION_INFO.md):" -ForegroundColor White
Write-Host "   - OPENCLAW_GATEWAY_TOKEN" -ForegroundColor Gray
Write-Host "   - API keys (Anthropic, OpenAI, etc.)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start OpenClaw Gateway:" -ForegroundColor White
Write-Host "   openclaw gateway start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Re-authenticate Gmail if needed:" -ForegroundColor White
Write-Host "   Follow OAuth flow if token.json expires" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verify cron jobs:" -ForegroundColor White
Write-Host "   openclaw cron list" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Test everything works!" -ForegroundColor White

Write-Host "`n✅ Welcome to your new machine!" -ForegroundColor Green
Write-Host "`n" -ForegroundColor White
