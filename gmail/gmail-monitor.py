#!/usr/bin/env python3
"""
Gmail Monitor for OpenClaw
Reads unread emails and logs them
"""

import os
import pickle
import json
from datetime import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.apps import gmail_v1
import base64

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token.json'
LOG_FILE = '../health/gmail-log.json'  # Adjust path as needed

def authenticate():
    """Get authenticated Gmail service"""
    creds = None
    
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
    
    return creds

def get_unread_emails(service, max_results=10):
    """Fetch unread emails from inbox"""
    try:
        results = service.users().messages().list(
            userId='me',
            q='is:unread',
            maxResults=max_results
        ).execute()
        
        messages = results.get('messages', [])
        return messages
    except Exception as e:
        print(f"Error fetching emails: {e}")
        return []

def get_message_details(service, message_id):
    """Get full message details"""
    try:
        message = service.users().messages().get(
            userId='me',
            id=message_id,
            format='full'
        ).execute()
        
        headers = message['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
        date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
        
        # Try to get body
        body = ''
        if 'parts' in message['payload']:
            for part in message['payload']['parts']:
                if part['mimeType'] == 'text/plain':
                    data = part['body'].get('data', '')
                    if data:
                        body = base64.urlsafe_b64decode(data).decode('utf-8')
                    break
        else:
            data = message['payload']['body'].get('data', '')
            if data:
                body = base64.urlsafe_b64decode(data).decode('utf-8')
        
        return {
            'id': message_id,
            'subject': subject,
            'from': sender,
            'date': date,
            'snippet': message.get('snippet', '')[:200]
        }
    except Exception as e:
        print(f"Error getting message details: {e}")
        return None

def log_emails(emails):
    """Log emails to JSON file"""
    log_data = {
        'timestamp': datetime.now().isoformat(),
        'count': len(emails),
        'emails': emails
    }
    
    with open(LOG_FILE, 'w') as f:
        json.dump(log_data, f, indent=2)
    
    print(f"✓ Logged {len(emails)} unread emails")

if __name__ == '__main__':
    try:
        print("Authenticating with Gmail...")
        creds = authenticate()
        
        # Build service
        from googleapiclient.discovery import build
        service = build('gmail', 'v1', credentials=creds)
        
        print("Fetching unread emails...")
        messages = get_unread_emails(service)
        
        if messages:
            email_list = []
            for msg in messages:
                details = get_message_details(service, msg['id'])
                if details:
                    email_list.append(details)
            
            log_emails(email_list)
            print(f"\nFound {len(email_list)} unread emails")
            for email in email_list:
                print(f"  • {email['from']}: {email['subject']}")
        else:
            print("No unread emails found")
    
    except Exception as e:
        print(f"✗ Error: {e}")
        exit(1)
