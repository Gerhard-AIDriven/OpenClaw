import requests

# 1. Define your exact endpoint and your actual secret API key value
API_URL = "https://api.mailgun.net/v3/mg.aidriven.biz/messages"
API_KEY = "dea06fd768f566dfd3a35de38e3ddbb0-6648d8d0-c028d450"  # Replace with your long alphanumeric key

# 2. Construct the email payload parameters
email_data = {
    "from": "Gerhard <gerhard@mg.aidriven.biz>",
    "to": ["gstimie@gmail.com"],  # Sends a test straight to your Google Workspace inbox
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