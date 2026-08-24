#!/usr/bin/env node
/**
 * Exchange OAuth code for token - pass code as argument
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');

// Get code from command line
const code = process.argv[2];

if (!code) {
  console.error('Usage: node exchange-code.js <authorization_code>');
  console.error('Example: node exchange-code.js 4/0ATs...');
  process.exit(1);
}

// Read credentials
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

async function main() {
  try {
    console.log('Exchanging code for token...');
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save token
    const tokenData = {
      type: 'authorized_user',
      client_id: client_id,
      client_secret: client_secret,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_at: tokens.expiry_date
    };
    
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    console.log('\n✓ Token saved successfully to:', TOKEN_FILE);
    console.log('✓ Refresh token present:', !!tokens.refresh_token);
    console.log('\nYou can now run: node gmail-monitor.js\n');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    process.exit(1);
  }
}

main();
