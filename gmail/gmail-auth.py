#!/usr/bin/env python3
"""
Gmail OAuth Token Generator for OpenClaw
Generates and stores a token.json file for Gmail API access
"""

import os
import pickle
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token.json'

def get_gmail_service():
    """Authenticate and return Gmail API service"""
    creds = None
    
    # Load existing token if it exists
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    # If no valid credentials, run OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save token for next time
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
    
    return creds

if __name__ == '__main__':
    try:
        print("Starting Gmail OAuth authentication...")
        creds = get_gmail_service()
        print("✓ Authentication successful!")
        print(f"✓ Token saved to {TOKEN_FILE}")
        print("\nYour Gmail API is now configured for OpenClaw.")
    except Exception as e:
        print(f"✗ Error: {e}")
        exit(1)
