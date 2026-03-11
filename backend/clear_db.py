import sqlite3

db_path = "career_drift.db"

def clear_data():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Delete all records from activity table
        cursor.execute("DELETE FROM activity")
        print(f"Deleted {cursor.rowcount} activities.")
        
        # Delete all records from student table
        cursor.execute("DELETE FROM student")
        print(f"Deleted {cursor.rowcount} students.")
        
        conn.commit()
        print("Database cleared successfully.")
    except Exception as e:
        print(f"Error clearing database: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    clear_data()
