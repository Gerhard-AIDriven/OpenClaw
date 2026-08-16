# archive-reports-before-push.ps1
# Run this before every `git push` to clean generated files

$workspaceRoot = "C:\Users\gstim\.openclaw\workspace"
$archiveRoot = Join-Path $workspaceRoot ".git-ignored-archive"
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"

Write-Host "Archiving reports and caches..." -ForegroundColor Cyan

# Create timestamped archive folders
$reportArchive = Join-Path $archiveRoot "reports\$timestamp"
New-Item -ItemType Directory -Force -Path $reportArchive | Out-Null

# Move all report files from working directories
$reportDirs = @(
    "automation/whatsapp-property-report/reports",
    "due-diligence-mvp/reports",
    "due-diligence-mvp/sample-reports",
    "aidriven-website/reports"
)

$count = 0
foreach ($dir in $reportDirs) {
    $fullPath = Join-Path $workspaceRoot $dir
    if (Test-Path $fullPath) {
        $files = Get-ChildItem -Path $fullPath -File -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Move-Item -Path $file.FullName -Destination $reportArchive -Force -ErrorAction SilentlyContinue
            $count++
        }
    }
}

Write-Host "Archived $count files to $reportArchive" -ForegroundColor Green
Write-Host ""
Write-Host "Now run:" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Gray
Write-Host "  git status   # Verify only source code remains" -ForegroundColor Gray
Write-Host "  git push origin master" -ForegroundColor Gray
