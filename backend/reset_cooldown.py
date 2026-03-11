import sqlite3
import os

db_path = "career_drift.db"

def reset_email_cooldown():
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("UPDATE student SET last_emailed_at = NULL WHERE email = 'tester@example.com'")
        conn.commit()
        if cursor.rowcount > 0:
            print("Successfully reset last_emailed_at for tester@example.com")
        else:
            print("User tester@example.com not found.")
    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    reset_email_cooldown()
