const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const gmailDir = path.join(__dirname, '..', 'gmail');
const tokenFile = path.join(gmailDir, 'token.json');

async function checkEmails() {
  try {
    // Load existing auth from gmail-monitor.js pattern
    const gmailMonitor = require(path.join(gmailDir, 'gmail-monitor.js'));
    
    // Just list recent messages
    console.log('📧 Checking last 5 emails in inbox...\n');
    
    // Read token directly
    const token = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
    
    const { OAuth2Client } = require('google-auth-library');
    const oauth2Client = new OAuth2Client(
      '1021442239216-b84kiiudc59qvhccq81uvqu0tolrdudq.apps.googleusercontent.com',
      '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',
      'http://localhost'
    );
    oauth2Client.setCredentials(token);
    
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5
    });
    
    if (res.messages && res.messages.length > 0) {
      console.log(`Found ${res.messages.length} recent emails:\n`);
      for (const msg of res.messages) {
        const detail = await gmail.users.messages.get({ 
          userId: 'me', 
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date']
        });
        
        const headers = {};
        detail.data.payload.headers.forEach(h => {
          headers[h.name] = h.value;
        });
        
        console.log('---');
        console.log(`Subject: ${headers.Subject || 'N/A'}`);
        console.log(`From: ${headers.From || 'N/A'}`);
        console.log(`Date: ${headers.Date || 'N/A'}`);
        console.log('');
      }
    } else {
      console.log('No emails found.');
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
}

checkEmails();
