const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const gmailDir = path.join(__dirname, '..', 'gmail');
const credentials = JSON.parse(fs.readFileSync(path.join(gmailDir, 'credentials.json'), 'utf8'));
const token = JSON.parse(fs.readFileSync(path.join(gmailDir, 'token.json'), 'utf8'));

const { OAuth2 } = require('google-auth-library');
const oauth2Client = new OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);
oauth2Client.setCredentials(token);

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

(async () => {
  try {
    console.log('📧 Checking Gmail for recent due diligence emails...\n');
    
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'from:mg.aidriven.biz OR from:gerhard@mg.aidriven.biz OR subject:"Due Diligence" OR subject:"property due diligence"'
    });
    
    if (res.messages && res.messages.length > 0) {
      console.log(`✅ Found ${res.messages.length} matching email(s):\n`);
      for (const msg of res.messages) {
        const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id });
        const subject = detail.data.payload.headers.find(h => h.name === 'Subject');
        const from = detail.data.payload.headers.find(h => h.name === 'From');
        const date = detail.data.payload.headers.find(h => h.name === 'Date');
        console.log('---');
        console.log(`Subject: ${subject?.value}`);
        console.log(`From: ${from?.value}`);
        console.log(`Date: ${date?.value}`);
        console.log('');
      }
    } else {
      console.log('❌ No matching emails found in last 10 messages.');
      console.log('\n💡 Tip: Check spam/junk folder or verify Mailgun is sending.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
