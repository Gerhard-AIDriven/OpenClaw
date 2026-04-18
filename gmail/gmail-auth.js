#!/usr/bin/env node
/**
 * Gmail OAuth Token Generator for OpenClaw
 * Generates and stores a token.json file for Gmail API access
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');

/**
 * Load or request or refresh saved credentials.
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = fs.readFileSync(TOKEN_FILE);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serialize credentials to a file comptible with GoogleAUth.fromJSON.
 */
async function saveCredentials(client) {
  const content = fs.readFileSync(CREDENTIALS_FILE);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = {
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  };
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(payload));
  console.log('Token saved to', TOKEN_FILE);
}

/**
 * Load or request or refresh saved credentials.
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_FILE,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function main() {
  try {
    console.log('Starting Gmail OAuth authentication...');
    const auth = await authorize();
    console.log('✓ Authentication successful!');
    console.log('✓ Token saved to', TOKEN_FILE);
    console.log('\nYour Gmail API is now configured for OpenClaw.');
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

main();
