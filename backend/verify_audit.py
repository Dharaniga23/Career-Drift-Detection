import requests
import time

BASE_URL = "http://localhost:8000"

def test_drift_audit():
    print("Step 1: Adding drifting activities to Student 4 (bob - Frontend Dev)")
    activities = [
        {"student_id": 4, "name": "Deep Learning with PyTorch", "category": "ML", "type": "Learning"},
        {"student_id": 4, "name": "SQL Performance Tuning", "category": "Backend", "type": "Learning"},
        {"student_id": 4, "name": "Dockerizing Microservices", "category": "DevOps", "type": "Learning"},
        {"student_id": 4, "name": "Advanced PostgreSQL Indexing", "category": "Backend", "type": "Learning"}
    ]
    
    for act in activities:
        resp = requests.post(f"{BASE_URL}/activities/", json=act)
        print(f"Added activity: {act['name']} - Status: {resp.status_code}")

    print("\nStep 2: Triggering Drift Audit...")
    audit_resp = requests.post(f"{BASE_URL}/audit_drift")
    print(f"Audit Status: {audit_resp.status_code}")
    print(f"Audit Result: {audit_resp.json()}")

if __name__ == "__main__":
    test_drift_audit()
