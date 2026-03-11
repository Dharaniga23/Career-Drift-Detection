import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_drift_emails():
    print("--- Starting Career Drift Email Test ---")
    
    # 1. Register a test student
    test_student = {
        "name": "Drift Tester",
        "email": "tester@example.com",
        "password": "password123",
        "target_career": "Backend Dev"
    }
    
    print(f"Registering/Logging in test student: {test_student['email']}...")
    try:
        response = requests.post(f"{BASE_URL}/register", json=test_student)
        if response.status_code == 200:
            student_data = response.json()
            print("Successfully registered new student.")
        elif response.status_code == 400: # Already registered
            response = requests.post(f"{BASE_URL}/login", json={
                "email": test_student["email"],
                "password": test_student["password"]
            })
            student_data = response.json()
            print("Successfully logged in existing student.")
        else:
            print(f"Error during registration/login: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"Connection failed: {e}. Is the server running?")
        return

    student_id = student_data["id"]

    # 2. Add drifting activities (Frontend focus for a Backend target)
    drifting_activities = [
        {"student_id": student_id, "name": "Deep Dive into React Hooks", "category": "Frontend Dev", "type": "Learning"},
        {"student_id": student_id, "name": "Advanced CSS Animations", "category": "Frontend Dev", "type": "Learning"},
        {"student_id": student_id, "name": "Designing UI with Figma", "category": "Frontend Dev", "type": "Project"}
    ]

    print("Adding 3 drifting activities (Frontend topics for a Backend student)...")
    for act in drifting_activities:
        resp = requests.post(f"{BASE_URL}/activities/", json=act)
        if resp.status_code == 200:
            print(f"Added activity: {act['name']}")
        else:
            print(f"Failed to add activity: {resp.text}")

    # 3. Trigger the drift audit endpoint
    print("Triggering /audit_drift endpoint...")
    audit_resp = requests.post(f"{BASE_URL}/audit_drift")
    if audit_resp.status_code == 200:
        results = audit_resp.json()
        print(f"Audit response: {json.dumps(results, indent=2)}")
        
        # Check if our tester was emailed
        emailed = any(d["name"] == "Drift Tester" and d["status"] == "Emailed" for d in results.get("details", []))
        if emailed:
            print("\nSUCCESS: 'Drift Tester' was identified for drift and an email was triggered!")
            print("Check the server terminal output for '--- SIMULATED EMAIL SENT ---'.")
        else:
            print("\nWARNING: 'Drift Tester' was NOT emailed. This might be due to the 24-hour spam guard.")
            print("Check if you've already run this test in the last 24 hours for this user.")
    else:
        print(f"Audit failed: {audit_resp.status_code} - {audit_resp.text}")

if __name__ == "__main__":
    test_drift_emails()
