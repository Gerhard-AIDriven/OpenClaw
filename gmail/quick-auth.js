#!/usr/bin/env node
/**
 * Simple Gmail OAuth - generates auth URL, accepts code manually
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Read credentials
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('\n=== Gmail OAuth Authentication ===\n');
console.log('1. Open this URL in your browser:');
console.log(authUrl);
console.log('\n2. Sign in and approve access');
console.log('3. You will be redirected to a page like: http://localhost/?code=4/...');
console.log('4. Copy the CODE parameter (everything after "code=")');
console.log('5. Paste it below:\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter authorization code: ', async (code) => {
  try {
    console.log('\nExchanging code for token...');
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save token
    const tokenData = {
      type: 'authorized_user',
      client_id: client_id,
      client_secret: client_secret,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_at: Date.now() + (tokens.expiry_date - Date.now())
    };
    
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    console.log('\n✓ Token saved successfully to:', TOKEN_FILE);
    console.log('✓ You can now run: node gmail-monitor.js\n');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
  } finally {
    rl.close();
  }
});
