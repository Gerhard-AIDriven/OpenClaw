#!/usr/bin/env node
/**
 * Simple server to exchange OAuth code for Gmail access token
 * Run: node token-server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const TOKEN_FILE = path.join(__dirname, 'token.json');

// Read credentials
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  credentials = credentials.installed || credentials.web;
} catch (err) {
  console.error('Error reading credentials.json:', err.message);
  process.exit(1);
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code) {
  const tokenUrl = credentials.token_uri;
  
  const params = new URLSearchParams({
    code,
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    redirect_uri: credentials.redirect_uris[0],
    grant_type: 'authorization_code'
  });

  return new Promise((resolve, reject) => {
    const requestModule = tokenUrl.startsWith('https') ? https : http;
    const req = requestModule.request(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString())
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

/**
 * Save token to file
 */
function saveToken(tokenData) {
  const tokenObj = {
    type: 'authorized_user',
    client_id: credentials.client_id,
    client_secret: credentials.client_secret,
    refresh_token: tokenData.refresh_token,
    access_token: tokenData.access_token,
    expires_at: Date.now() + (tokenData.expires_in * 1000)
  };

  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenObj, null, 2));
  console.log('✓ Token saved to:', TOKEN_FILE);
}

/**
 * HTTP Server
 */
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Serve HTML
  if (pathname === '/' && req.method === 'GET') {
    const html = fs.readFileSync(path.join(__dirname, 'get-auth-code.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Exchange code for token
  if (pathname === '/api/gmail/token' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { code } = JSON.parse(body);
        
        if (!code) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'No code provided' }));
          return;
        }

        console.log('Exchanging code for token...');
        const tokenData = await exchangeCodeForToken(code);
        
        saveToken(tokenData);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Token saved successfully!' 
        }));

      } catch (err) {
        console.error('Error:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: err.message 
        }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n✓ Server running at http://localhost:${PORT}`);
  console.log('✓ Open this URL in your browser to authorize Gmail access\n');
});
