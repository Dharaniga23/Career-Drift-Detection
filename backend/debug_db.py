from database import engine, create_db_and_tables
from sqlmodel import Session, select
from models import Student
import traceback

def debug_db():
    print("Initializing DB and tables...")
    try:
        create_db_and_tables()
        print("DB initialized.")
    except Exception:
        print("Error during initialization:")
        traceback.print_exc()
        return

    print("Attempting to select students...")
    try:
        with Session(engine) as session:
            students = session.exec(select(Student)).all()
            print(f"Success! Found {len(students)} students.")
            for s in students:
                print(f" - {s.name}: last_emailed_at = {s.last_emailed_at}")
    except Exception:
        print("Error during selection:")
        traceback.print_exc()

if __name__ == "__main__":
    debug_db()
