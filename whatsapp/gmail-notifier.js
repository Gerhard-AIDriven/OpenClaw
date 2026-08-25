const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'gmail', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, '..', 'gmail', 'token.json');

async function getGmailClient() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  
  const oauth2Client = new google.auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
  );
  
  oauth2Client.setCredentials(token);
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function sendReportEmail(customer, address, reportResult, requestId) {
  try {
    const gmail = await getGmailClient();
    
    const subject = `Property Due Diligence Report: ${address}`;
    const body = `
      Hello ${customer.name || 'there'},
      
      Your Property Due Diligence report for ${address} is now ready.
      
      You can view the interactive report online here:
      ${reportResult.reportUrl}
      
      This report includes:
      - LINZ Title Data
      - Registered Easements & Covenants
      - Hazards Assessment (Flood, Liquefaction, Erosion)
      - Council Rates & Valuation (if available)
      
      If you have any questions, please reply to this email.
      
      Regards,
      AI Driven Team
      Practical AI for real businesses
    `;
    
    // Gmail API requires base64 encoded RFC 2822 messages
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const utf8From = `<${customer.email}>`; // Note: this needs to be the authenticated user's email
    const utf8To = `<${customer.email}>`;
    const utf8Body = `From: gerhard@aidriven.biz\r\nTo: ${customer.email}\r\nSubject: ${subject}\r\n\r\n${body}`;
    
    const encodedMessage = Buffer.from(utf8Body)
      .toString('base64')
      .replace(/\s/g, '');
      
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Gmail Send Error:', error);
    throw error;
  }
}

module.exports = { sendReportEmail };
