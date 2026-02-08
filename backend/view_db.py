import sqlite3
import os

db_path = "database.db"
output_path = "db_data.md"

def view_data():
    if not os.path.exists(db_path):
        return f"Error: {db_path} not found."

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    output = "# Database Content Snapshot\n\n"
    output += "## Students\n\n"
    
    try:
        cursor.execute("SELECT id, name, target_career, current_drift_score FROM student")
        students = cursor.fetchall()
        
        output += "| ID | Name | Target Career | Drift Score |\n"
        output += "|----|------|---------------|-------------|\n"
        for s in students:
            output += f"| {s[0]} | {s[1]} | {s[2]} | {s[3]:.2f} |\n"
    except Exception as e:
        output += f"Error reading students: {e}\n"

    output += "\n## Recent Activities (Last 20)\n\n"
    
    try:
        cursor.execute("SELECT id, student_id, name, category, type FROM activity ORDER BY id DESC LIMIT 20")
        activities = cursor.fetchall()
        
        output += "| ID | SID | Activity Name | Category | Type |\n"
        output += "|----|-----|---------------|----------|------|\n"
        for a in activities:
            output += f"| {a[0]} | {a[1]} | {a[2]} | {a[3]} | {a[4]} |\n"
    except Exception as e:
        output += f"Error reading activities: {e}\n"

    conn.close()
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(output)
    
    return f"Data written to {output_path}"

if __name__ == "__main__":
    print(view_data())
