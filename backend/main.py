from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import joblib
import pandas as pd
import os
from typing import List

from contextlib import asynccontextmanager

from database import engine, Session, create_db_and_tables
from models import Student, Activity

from sqlmodel import select

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    create_db_and_tables()
    yield
    # Shutdown logic (if any) could go here

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
MODEL_PATH = "drift_model.pkl"
try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Startup logic moved to lifespan

class ActivityInput(BaseModel):
    name: str
    category: str

class StudentProfile(BaseModel):
    target_career: str
    recent_activities: List[ActivityInput]

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class StudentSignup(BaseModel):
    name: str
    email: str
    password: str
    target_career: str

class StudentLogin(BaseModel):
    email: str
    password: str

CAREER_SKILLS = {
    "Data Scientist": ["Python", "Pandas", "Scikit-Learn", "SQL", "Statistics", "TensorFlow", "Keras", "Tableau", "PowerBI", "Matplotlib", "Seaborn", "NumPy", "R", "Machine Learning", "Deep Learning", "Data Analysis", "Data Science", "Analytics", "Model", "Dataset"],
    "Frontend Dev": ["React", "CSS", "HTML", "JavaScript", "Figma", "Redux", "Tailwind", "Next.js", "TypeScript", "Vue", "Angular", "Sass", "Web Design", "UI", "UX", "Frontend", "App", "Website"],
    "Backend Dev": ["FastAPI", "Docker", "PostgreSQL", "System Design", "Go", "Redis", "Kafka", "Microservices", "Flask", "Node.js", "Express", "MongoDB", "Django", "Kubernetes", "API", "Database", "Server", "Backend"]
}

@app.post("/register")
def register_student(student_in: StudentSignup):
    with Session(engine) as session:
        # Check if email exists
        statement = select(Student).where(Student.email == student_in.email)
        existing_student = session.exec(statement).first()
        if existing_student:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_pwd = pwd_context.hash(student_in.password)
        db_student = Student(
            name=student_in.name,
            email=student_in.email,
            hashed_password=hashed_pwd,
            target_career=student_in.target_career
        )
        session.add(db_student)
        session.commit()
        session.refresh(db_student)
        return db_student

@app.post("/login")
def login_student(login_in: StudentLogin):
    with Session(engine) as session:
        statement = select(Student).where(Student.email == login_in.email)
        student = session.exec(statement).first()
        if not student or not pwd_context.verify(login_in.password, student.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return student

@app.post("/students/")
def create_student(student: Student):
    # Backward compatibility or simplified create (needs email/pwd)
    with Session(engine) as session:
        # Check by email now instead of name
        statement = select(Student).where(Student.email == student.email)
        existing_student = session.exec(statement).first()
        
        if existing_student:
            if existing_student.target_career != student.target_career:
                existing_student.target_career = student.target_career
                session.add(existing_student)
                session.commit()
                session.refresh(existing_student)
            return existing_student
            
        session.add(student)
        session.commit()
        session.refresh(student)
        return student

@app.get("/students/{student_id}")
def get_student(student_id: int):
    with Session(engine) as session:
        student = session.get(Student, student_id)
        if not student:
             raise HTTPException(status_code=404, detail="Student not found")
        return student

@app.post("/activities/")
def create_activity(activity: Activity):
    with Session(engine) as session:
        session.add(activity)
        session.commit()
        session.refresh(activity)
        return activity

@app.get("/students/{student_id}/activities/")
def get_student_activities(student_id: int):
    with Session(engine) as session:
        student = session.get(Student, student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student.activities

@app.post("/predict_drift")
def predict_drift(profile: StudentProfile):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    target = profile.target_career
    if target not in CAREER_SKILLS:
        return {"error": "Unknown career target"}
        
    relevant_skills = CAREER_SKILLS[target]
    other_skills = {}
    for career, skills in CAREER_SKILLS.items():
        if career != target:
            other_skills[career] = skills

    relevant_score = 0.0
    total = len(profile.recent_activities)
    suggestions = []
    
    if total == 0:
        return {"drift_score": 0, "status": "No Data", "message": "Add activities to analyze.", "suggestions": []}

    for act in profile.recent_activities:
        act_score = 0.0
        is_conflicting = False
        conflicting_career = None
        
        # 1. Skill Matching (Priority)
        act_name_lower = act.name.lower()
        import re
        
        def is_skill_in_text(skill, text):
            skill = skill.lower()
            if len(skill) <= 2:
                pattern = rf"\b{re.escape(skill)}\b"
                return bool(re.search(pattern, text))
            else:
                return skill in text

        # Check if it matches target skills
        target_skill_match = False
        for skill in relevant_skills:
            if is_skill_in_text(skill, act_name_lower):
                target_skill_match = True
                break
        
        if target_skill_match:
            act_score = 1.0
        else:
            # Check if it matches other career skills
            for career, skills in other_skills.items():
                for skill in skills:
                    if is_skill_in_text(skill, act_name_lower):
                        is_conflicting = True
                        conflicting_career = career
                        break
                if is_conflicting: break
            
            if is_conflicting:
                act_score = 0.0
                suggestions.append(f"'{act.name}' is more related to {conflicting_career}. It's not necessary for {target}.")
            elif act.category == target:
                act_score = 0.3 
            else:
                act_score = 0.0
                if act.category == "Other" or "read" in act_name_lower or "watch" in act_name_lower:
                    suggestions.append(f"'{act.name}' seems irrelevant to your {target} path.")

        relevant_score += act_score
            
    relevant_ratio = relevant_score / total
    
    # Predict
    probs = model.predict_proba([[relevant_ratio]])[0]
    drift_probability = float(probs[1])
    on_track_probability = 1.0 - drift_probability
    
    # De-duplicate suggestions
    suggestions = list(set(suggestions))

    return {
        "drift_score": drift_probability,
        "on_track_score": on_track_probability,
        "is_drifting": bool(drift_probability > 0.5),
        "relevant_ratio": relevant_ratio,
        "message": "Needs Attention" if drift_probability > 0.5 else "On Track",
        "suggestions": suggestions
    }

if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to allow any local connection (localhost, 127.0.0.1, or network IP)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

