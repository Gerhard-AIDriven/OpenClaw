# OpenClaw Migration Guide

**For Gerhard:** This is your complete backup and recovery system for moving OpenClaw to a new machine (e.g., Mac M4 Pro).

---

## 📦 Quick Backup (Before Moving)

On your current Windows machine, run:

```powershell
cd C:\Users\gstim\.openclaw\workspace
.\backup-openclaw.ps1
```

This creates a timestamped backup folder: `C:\Users\gstim\.openclaw-backup-YYYY-MM-DD_HH-mm`

**Then:** Copy that entire backup folder to:
- External USB drive, OR
- Cloud storage (OneDrive, Google Drive, Dropbox), OR
- Both (recommended!)

---

## 🔄 Restoration on New Machine

### Step 1: Install Prerequisites
1. Install Node.js (same version if possible: v24.18.0)
   - Download from: https://nodejs.org/
   
2. Open Terminal/PowerShell and install OpenClaw:
   ```bash
   npm install -g openclaw@latest
   ```

### Step 2: Run Restore Script
```powershell
# Point to your backup folder
.\restore-openclaw.ps1 -BackupPath "C:\path\to\your\backup-folder"
```

### Step 3: Set Environment Variables
Open the `MIGRATION_INFO.md` file from your backup and set these environment variables on the new machine:
- `OPENCLAW_GATEWAY_TOKEN` (critical!)
- Any API keys (Anthropic, OpenAI, etc.)

**On Mac/Linux:**
```bash
export OPENCLAW_GATEWAY_TOKEN="your-token-here"
# Add to ~/.zshrc or ~/.bashrc for persistence
```

### Step 4: Start OpenClaw
```bash
openclaw gateway start
```

### Step 5: Verify Everything
```bash
# Check cron jobs
openclaw cron list

# Check workspace files
cd ~/.openclaw/workspace
git status

# Test Gmail (if configured)
# Follow OAuth flow if token expired
```

---

## 🎯 What's Backed Up

| Component | Backed Up? | Notes |
|-----------|-----------|-------|
| **Workspace files** | ✅ Git-backed | SOUL.md, USER.md, MEMORY.md, scripts, docs |
| **Credentials** | ✅ Manual backup | OAuth tokens, API keys (critical!) |
| **Cron jobs** | ✅ Manual backup | Scheduled automations |
| **Session state** | ✅ Manual backup | Active conversations, context |
| **Settings** | ✅ Manual backup | Your preferences |
| **Custom skills** | ✅ Manual backup | Skill workshop creations |
| **Gmail OAuth** | ✅ In workspace | May need re-authentication |
| **Node modules** | ❌ Reinstallable | Recreated by `npm install` |

---

## 🔐 Security Notes

- **Backup contains sensitive data** (API keys, OAuth tokens)
- Store backup securely (encrypted drive, private cloud folder)
- Delete backup after successful migration
- Never commit credentials to Git

---

## 🆘 Emergency Recovery (Lost Laptop)

If you lose your laptop during the move:

1. **Get to any computer** with internet
2. **Install Node.js and OpenClaw** (Step 1 above)
3. **Clone your workspace from GitHub:**
   ```bash
   git clone https://github.com/Gerhard-AIDriven/OpenClaw.git ~/.openclaw/workspace
   ```
4. **Set environment variables** (from memory or password manager):
   - `OPENCLAW_GATEWAY_TOKEN`
5. **Start Gateway:**
   ```bash
   openclaw gateway start
   ```
6. **Reconfigure channels** (Telegram, WhatsApp, etc.) as needed

**You'll be back online in ~15 minutes!** The workspace Git repo has all your files, memory, and production scripts.

---

## 📞 Support Checklist

Before asking for help, check:
- [ ] Node.js installed? (`node --version`)
- [ ] OpenClaw installed? (`openclaw --version`)
- [ ] Backup folder accessible?
- [ ] Environment variables set?
- [ ] Gateway started? (`openclaw gateway status`)

---

**Created:** 2026-08-21  
**Backup Scripts:** `backup-openclaw.ps1`, `restore-openclaw.ps1`  
**GitHub Repo:** https://github.com/Gerhard-AIDriven/OpenClaw
