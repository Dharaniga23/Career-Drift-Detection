import requests
import json

url = "http://127.0.0.1:8000/login"
payload = {
    "email": "test101@example.com",
    "password": "password"
}
headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
