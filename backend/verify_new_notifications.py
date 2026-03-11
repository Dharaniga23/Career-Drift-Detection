import sqlite3
import os
import requests
import datetime
import json

db_path = "career_drift.db"
BASE_URL = "http://127.0.0.1:8000"

def setup_test_data():
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return False

    # Create inactive tester if not exists
    try:
        resp = requests.post(f"{BASE_URL}/register", json={
            "name": "Inactive Tester",
            "email": "inactive@example.com",
            "password": "pass",
            "target_career": "Data Scientist"
        })
    except:
        pass

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Reset cooldowns and set inactivity
        two_days_ago = (datetime.datetime.utcnow() - datetime.timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.execute("""
            UPDATE student 
            SET last_visited_at = ?, 
                last_news_sent_at = ?, 
                last_emailed_at = ? 
            WHERE email = 'inactive@example.com'
        """, (two_days_ago, two_days_ago, two_days_ago))
        
        conn.commit()
        if cursor.rowcount > 0:
            print("Successfully set test state for inactive@example.com")
            return True
        else:
            print("User inactive@example.com not found.")
            return False
    except Exception as e:
        print(f"Error updating database: {e}")
        return False
    finally:
        conn.close()

def trigger_audit():
    print("Triggering /audit_drift...")
    try:
        resp = requests.post(f"{BASE_URL}/audit_drift")
        if resp.status_code == 200:
            print("Audit triggered successfully.")
            print(json.dumps(resp.json(), indent=2))
        else:
            print(f"Audit failed: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    if setup_test_data():
        trigger_audit()
