# Gmail Integration for OpenClaw

This folder contains scripts to authenticate with Gmail API and monitor your inbox.

## Setup

### 1. Install Required Python Packages

```bash
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### 2. Generate OAuth Token

```bash
cd gmail
python gmail-auth.py
```

This will:
- Open your browser to authenticate with your Gmail account
- Generate a `token.json` file (stored locally, never shared)
- Return you to the console when done

**Important:** Approve access when prompted in the browser.

### 3. Test the Monitor

```bash
python gmail-monitor.py
```

This will:
- Fetch your unread emails
- Log them to `../health/gmail-log.json`
- Print a summary to console

## Files

- **credentials.json** — Your OAuth client credentials (keep safe!)
- **token.json** — Your authentication token (generated after first run)
- **gmail-auth.py** — One-time authentication script
- **gmail-monitor.py** — Monitor script (run periodically via cron)

## Automate with OpenClaw Cron

Once authenticated, add a cron job to check emails periodically:

```json
{
  "schedule": { "kind": "cron", "expr": "*/30 * * * *", "tz": "Africa/Johannesburg" },
  "payload": {
    "kind": "agentTurn",
    "message": "Check my Gmail inbox for unread emails and summarise any important messages"
  }
}
```

This runs every 30 minutes.

## Security

- Credentials are stored locally in your workspace
- Token is encrypted by Google's standards
- Never commit these files to version control
- Your API key is tied to your Google Cloud project only

## Troubleshooting

**"ModuleNotFoundError: No module named 'google'"**
→ Run: `pip install google-auth-oauthlib google-api-python-client`

**"403 Forbidden"**
→ Make sure Gmail API is enabled in Google Cloud Console

**"redirect_uri_mismatch"**
→ The redirect URI must match your credentials. Desktop app should use `http://localhost`
