import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_signup():
    import random
    import string
    
    # Generate random email to avoid collision
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    email = "carrercompassai@gmail.com"
    # To bypass unique email constraint if we run multiple times, maybe add rand_str to the career or use a different test. Wait, I can just append a +tag.
    email = f"carrercompassai+{rand_str}@gmail.com"
    
    print(f"Testing signup with: {email}")
    
    try:
        resp = requests.post(f"{BASE_URL}/register", json={
            "name": "New Alpha Tester",
            "email": email,
            "password": "securepwd123",
            "target_career": "Frontend Dev"
        })
        
        if resp.status_code == 200:
            print("Successfully registered!")
            print(json.dumps(resp.json(), indent=2))
        else:
            print(f"Registration failed: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_signup()
