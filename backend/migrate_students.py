import sqlite3
import os

db_path = "career_drift.db"

def migrate_db():
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Add last_visited_at if it doesn't exist
        try:
            cursor.execute("ALTER TABLE student ADD COLUMN last_visited_at DATETIME")
            print("Added column last_visited_at to student table.")
        except sqlite3.OperationalError:
            print("Column last_visited_at already exists.")

        # Add last_news_sent_at if it doesn't exist
        try:
            cursor.execute("ALTER TABLE student ADD COLUMN last_news_sent_at DATETIME")
            print("Added column last_news_sent_at to student table.")
        except sqlite3.OperationalError:
            print("Column last_news_sent_at already exists.")

        # Set default for existing records
        import datetime
        now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("UPDATE student SET last_visited_at = ? WHERE last_visited_at IS NULL", (now,))
        
        conn.commit()
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_db()
