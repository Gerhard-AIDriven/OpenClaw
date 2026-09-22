import requests

# 1. Define your exact endpoint and your actual secret API key value
API_URL = "https://api.mailgun.net/v3/mg.aidriven.biz/messages"
API_KEY = "46490b2301ebf73fa76a2d5c29b60930-6648d8d0-96b41ae8"  # Replace with your long alphanumeric key

# 2. Construct the email payload parameters
email_data = {
    "from": "Gerhard <gerhard@mg.aidriven.biz>",
    "to": ["support@aidriven."],  # Sends a test straight to your Google Workspace inbox
    "subject": "Mailgun Pipeline Success!",
    "text": "Hello! This message confirms that the Cloudflare DNS and Mailgun subdomain integration is fully operational."
}

# 3. Execute the secure POST request
response = requests.post(
    API_URL,
    auth=("api", API_KEY),
    data=email_data
)

# 4. Print the output status to verify success
print(f"Status Code: {response.status_code}")
print(f"Raw Response: {response.text}")