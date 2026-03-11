import sqlite3
import os

db_path = "career_drift.db"

def fix_database():
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(student)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "last_emailed_at" not in columns:
            print("Adding column 'last_emailed_at' to 'student' table...")
            cursor.execute("ALTER TABLE student ADD COLUMN last_emailed_at DATETIME")
            conn.commit()
            print("Column added successfully.")
        else:
            print("Column 'last_emailed_at' already exists.")
            
    except Exception as e:
        print(f"Error modifying database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_database()
