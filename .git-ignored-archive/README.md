# Local Archive Directory (NOT TRACKED BY GIT)

This directory stores generated files that should **never** be pushed to GitHub.

## Structure
```
.git-ignored-archive/
├── reports/          # All generated HTML/PDF/JSON reports (timestamped subfolders)
├── caches/           # API response caches, LINZ data
└── screenshots/      # Test screenshots, captures
```

## Why This Exists
- Prevents Git repository bloat from generated test files
- Allows unlimited report generation locally  
- Keeps Git history clean and fast to push
- Easy cleanup without losing important generated data

## Before Each Git Push - Run This:

```powershell
.\scripts\archive-reports-before-push.ps1
git add -A
git status    # Verify only source code remains
git push origin master
```

## Retention Policy
- Keep last 10 reports in working directory for quick reference
- Archive everything else with timestamps
- Monthly: Delete archives older than 90 days (or export to external storage)

## Accessing Archived Reports
Reports remain on your local machine at:
```
C:\Users\gstim\.openclaw\workspace\.git-ignored-archive\reports\YYYY-MM-DD-HHMMSS\
```

Open any HTML report directly in browser.

---

**Golden Rule:** If a script generates it (not hand-written), it goes to archive, NOT to Git!
