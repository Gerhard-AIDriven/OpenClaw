import requests

url = "http://127.0.0.1:8000/api/v1/realestate/query"
payload = {"question": "properties priced between 1 million and 2 million"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
