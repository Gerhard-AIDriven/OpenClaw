#!/usr/bin/env node
/**
 * Gmail Monitor for OpenClaw
 * Reads unread emails, flags opportunities, sends alerts
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const LOG_FILE = path.join(__dirname, '..', 'health', 'gmail-log.json');

// Configuration
const OPPORTUNITY_KEYWORDS = ['consulting', 'inquiry', 'proposal', 'information'];
const HIGH_PRIORITY_DOMAINS = ['.nz', '.co.nz']; // New Zealand

/**
 * Load saved token
 */
async function loadSavedCredentials() {
  try {
    const content = fs.readFileSync(TOKEN_FILE);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    console.error('✗ No token found. Run token-server.js first.');
    process.exit(1);
  }
}

/**
 * Get unread emails
 */
async function getUnreadEmails(gmail, maxResults = 20) {
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults,
    });

    return res.data.messages || [];
  } catch (err) {
    console.error('Error fetching emails:', err.message);
    return [];
  }
}

/**
 * Get message details
 */
async function getMessageDetails(gmail, messageId) {
  try {
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const headers = message.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
    const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
    const date = headers.find(h => h.name === 'Date')?.value || '';

    return {
      id: messageId,
      subject,
      from,
      date,
      snippet: message.data.snippet?.substring(0, 200) || '',
    };
  } catch (err) {
    console.error('Error getting message details:', err.message);
    return null;
  }
}

/**
 * Classify email importance
 */
function classifyEmail(email) {
  const classification = {
    isOpportunity: false,
    isHighPriority: false,
    reason: ''
  };

  // Check for .nz domain
  const fromLower = email.from.toLowerCase();
  const isNZDomain = HIGH_PRIORITY_DOMAINS.some(domain => fromLower.includes(domain));
  if (isNZDomain) {
    classification.isHighPriority = true;
    classification.reason = '🌍 New Zealand domain detected';
  }

  // Check for opportunity keywords
  const subjectLower = email.subject.toLowerCase();
  const hasOpportunityKeyword = OPPORTUNITY_KEYWORDS.some(keyword => 
    subjectLower.includes(keyword)
  );
  if (hasOpportunityKeyword) {
    classification.isOpportunity = true;
    if (classification.reason) {
      classification.reason += ' + ';
    }
    classification.reason += '💼 Opportunity keyword detected';
  }

  return classification;
}

/**
 * Log emails to JSON
 */
function logEmails(emails) {
  const logData = {
    timestamp: new Date().toISOString(),
    count: emails.length,
    opportunities: emails.filter(e => e.classification.isOpportunity || e.classification.isHighPriority),
    emails,
  };

  fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2));
  console.log(`✓ Logged ${emails.length} unread emails`);
  
  if (logData.opportunities.length > 0) {
    console.log(`⚠️  Found ${logData.opportunities.length} important/opportunity email(s)`);
  }
}

/**
 * Format alert message for Telegram/WhatsApp
 */
function formatAlert(email) {
  const classification = email.classification;
  const isOpportunity = classification.isOpportunity || classification.isHighPriority;
  
  if (!isOpportunity) return null;

  return {
    subject: email.subject,
    from: email.from,
    date: email.date,
    snippet: email.snippet,
    classification: classification.reason,
    message: `
📧 *Important Email Alert*

*From:* ${email.from}
*Subject:* ${email.subject}
*Time:* ${email.date}

${classification.reason}

_Preview:_ ${email.snippet}

---
Check your Gmail for full message.
    `.trim()
  };
}

async function main() {
  try {
    console.log('🔍 Checking Gmail inbox...');
    const auth = await loadSavedCredentials();

    const gmail = google.gmail({ version: 'v1', auth });

    console.log('📬 Fetching unread emails...');
    const messages = await getUnreadEmails(gmail);

    if (messages.length > 0) {
      const emailList = [];
      const alerts = [];

      for (const msg of messages) {
        const details = await getMessageDetails(gmail, msg.id);
        if (details) {
          const classification = classifyEmail(details);
          details.classification = classification;
          emailList.push(details);

          // Build alert if needed
          const alert = formatAlert(details);
          if (alert) {
            alerts.push(alert);
          }
        }
      }

      logEmails(emailList);
      
      // Print summary
      console.log(`\n✅ Summary:`);
      console.log(`   Total unread: ${emailList.length}`);
      console.log(`   Opportunities/Important: ${alerts.length}`);

      if (alerts.length > 0) {
        console.log(`\n⚠️  ALERTS TO SEND:\n`);
        alerts.forEach((alert, idx) => {
          console.log(`${idx + 1}. ${alert.subject}`);
          console.log(`   From: ${alert.from}`);
          console.log(`   Reason: ${alert.classification}\n`);
        });
        
        // Return alerts for messaging (Telegram/WhatsApp)
        console.log('\n--- ALERTS FOR DELIVERY ---');
        alerts.forEach((alert, idx) => {
          console.log(`\nALERT ${idx + 1}:`);
          console.log(alert.message);
        });
      }
    } else {
      console.log('✓ No unread emails');
    }
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

main();
