import sqlite3

db_path = "career_drift.db"
email_to_delete = "ongooyeep69@gmail.com"

def delete_user():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get user ID first
        cursor.execute("SELECT id FROM student WHERE email = ?", (email_to_delete,))
        user = cursor.fetchone()
        
        if user:
            user_id = user[0]
            # Delete their activities
            cursor.execute("DELETE FROM activity WHERE student_id = ?", (user_id,))
            print(f"Deleted {cursor.rowcount} associated activities.")
            
            # Delete the user
            cursor.execute("DELETE FROM student WHERE id = ?", (user_id,))
            print(f"Deleted user: {email_to_delete}")
            
            conn.commit()
            print("Successfully removed the user.")
        else:
            print(f"User {email_to_delete} not found in the database.")
            
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    delete_user()
