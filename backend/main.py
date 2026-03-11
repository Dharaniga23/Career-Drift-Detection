from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import joblib
import pandas as pd
import os
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

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

# --- News Integration ---
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "7b8f9e0a1c2d3e4f5g6h7i8j9k0l1m2n") # Placeholder or env var

class NewsItem(BaseModel):
    title: str
    description: Optional[str]
    url: str
    urlToImage: Optional[str]
    publishedAt: str
    source: str
    category: str # "Tech", "Expert", "Update"

@app.get("/news", response_model=List[NewsItem])
def get_tech_news():
    news_list = []
    
    # 1. Fetch Live Tech News from TechCrunch RSS
    try:
        rss_url = "https://techcrunch.com/feed/"
        response = requests.get(rss_url, timeout=5)
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            for item in root.findall(".//item")[:4]: # Get top 4 latest
                title = item.find("title").text
                link = item.find("link").text
                pub_date = item.find("pubDate").text
                description = item.find("description").text if item.find("description") is not None else ""
                # Simple cleanup of HTML tags in description if needed
                import re
                clean_desc = re.sub('<[^<]+?>', '', description)[:150] + "..."
                
                news_list.append({
                    "title": title,
                    "description": clean_desc,
                    "url": link,
                    "urlToImage": "", # Will be assigned below
                    "publishedAt": pub_date,
                    "source": "TechCrunch",
                    "category": "Tech"
                })
    except Exception as e:
        print(f"RSS Fetch Error: {e}")

    # 2. Add Verified Expert & Update Items (March 2026)
    verified_news = [
        {
            "title": "OpenAI Launches GPT-5.4 with Native 'Computer Use'",
            "description": "Released March 5, 2026, the new model can navigate UIs and execute multi-step workflows autonomously, outperforming human baselines in professional benchmarks.",
            "url": "https://openai.com/news/gpt-5-4-announcement",
            "urlToImage": "",
            "publishedAt": "2026-03-05T09:00:00Z",
            "source": "OpenAI Blog",
            "category": "Expert"
        },
        {
            "title": "Nvidia's Vera Rubin Platform Ships First Samples",
            "description": "The new Rubin architecture, succeeding Blackwell, promises 5x faster AI workload performance with the NVL72 system. Production shipments expected in H2 2026.",
            "url": "https://nvidianews.nvidia.com/news/rubin-architecture-update",
            "urlToImage": "",
            "publishedAt": "2026-03-08T11:00:00Z",
            "source": "Nvidia News",
            "category": "Update"
        },
        {
            "title": "Apple MacBook Neo Debuts with A18 Pro for $599",
            "description": "Apple disrupts the budget laptop market with the MacBook Neo. Powered by the A18 Pro chip, it brings premium AI capabilities to a more affordable price point.",
            "url": "https://apple.com/macbook-neo",
            "urlToImage": "",
            "publishedAt": "2026-03-04T15:00:00Z",
            "source": "Apple Newsroom",
            "category": "Update"
        },
        {
            "title": "The Rise of 'Agentic AI' in Enterprise Workflows",
            "description": "Gartner reports that 40% of enterprise apps will feature task-specific AI agents by the end of 2026, shifting focus from tools to autonomous agents.",
            "url": "https://gartner.com/news/agentic-ai-2026",
            "urlToImage": "",
            "publishedAt": "2026-03-07T10:30:00Z",
            "source": "Gartner",
            "category": "Expert"
        }
    ]
    
    # 3. Final deterministic unique image assignment for 8 items
    all_news = news_list + verified_news
    master_ids = [
        "1518770660439-4636190af475", # Circuits
        "1550751827-4bd374c3f58b", # Mesh
        "1485827404703-89b55fcc595e", # Robot
        "1531297484001-80022131f5a1", # Workspace
        "1451187580459-43490279c0fa", # Globe
        "1581091226825-a6a2a5aee158", # Hardware
        "1677442136019-21780ecad995", # AI Brain
        "1496181133206-80ce9b88a853"  # MacBook
    ]
    
    for i, item in enumerate(all_news):
        if i < len(master_ids):
            item["urlToImage"] = f"https://images.unsplash.com/photo-{master_ids[i]}?w=600&q=80"
            
    return all_news[:len(master_ids)]

# --- Email & Motivation System ---

MOTIVATIONAL_QUOTES = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Your career is like a garden. It can hold an assortment of flowers. Keep watering your target skills! - CareerCompass AI",
    "The secret of getting ahead is getting started. - Mark Twain",
    "It always seems impossible until it's done. - Nelson Mandela"
]

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_email_via_smtp(to_email: str, subject: str, html_content: str) -> bool:
    """Helper to send an actual email via SMTP."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("SMTP Credentials missing. Simulating email instead.")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        return True
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        
        part = MIMEText(html_content, "html")
        msg.attach(part)
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
            
        print(f"Successfully sent email to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False

def send_drift_email(student_name: str, email: str, career: str, drift_score: float, details: List[str]):
    """
    Sends a motivational email to a drifting student.
    Note: For production, SMTP credentials should be set in environment variables.
    """
    import random
    quote = random.choice(MOTIVATIONAL_QUOTES)
    
    subject = f"Stay on track, {student_name}! Your {career} Journey Needs You"
    
    # Construct details string
    details_html = "".join([f"<li>{d}</li>" for d in details])
    
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Hello {student_name},</h2>
        <p>We've noticed you've been exploring a lot of different areas lately! While curiosity is great, we want to make sure you're still making progress toward your goal of becoming a <strong>{career}</strong>.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 5px solid #e74c3c; margin: 20px 0;">
            <p style="margin: 0;"><strong>Drift Alert:</strong> Your current focus seems to be shifting away from {career} core skills.</p>
            <p style="margin: 0; font-size: 0.9em; color: #7f8c8d;">Drift Probability: {drift_score:.1%}</p>
        </div>

        <p>Recently recorded activities that might be taking you off-course:</p>
        <ul>
            {details_html}
        </ul>

        <p style="font-style: italic; color: #2980b9; margin-top: 20px;">"{quote}"</p>

        <p>Keep pushing! Small steps in the right direction lead to big results. Why not try a <strong>{career}</strong> related task today?</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #95a5a6;">Best Regards,<br>The CareerCompass AI Team</p>
    </body>
    </html>
    """

    return send_email_via_smtp(email, subject, body_html)

def send_news_email(student_name: str, email: str, news_items: List[dict]):
    """
    Sends a tech news update email.
    """
    subject = f"Stay Updated, {student_name}! New Tech News for you"
    
    news_html = ""
    for item in news_items:
        news_html += f"""
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <h3 style="margin-bottom: 5px;"><a href="{item['url']}" style="color: #2980b9; text-decoration: none;">{item['title']}</a></h3>
            <p style="margin: 0; font-size: 0.9em; color: #555;">{item['description']}</p>
        </div>
        """
        
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Hello {student_name},</h2>
        <p>Stay ahead of the curve! Here are the latest updates from the tech world that might interest you on your journey:</p>
        
        {news_html}
        
        <p>Keep learning and stay curious!</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #95a5a6;">Best Regards,<br>The CareerCompass AI Team</p>
    </body>
    </html>
    """
    
    return send_email_via_smtp(email, subject, body_html)

def send_inactivity_email(student_name: str, email: str, target_career: str):
    """
    Sends a motivational reminder to inactive students.
    """
    import random
    quote = random.choice(MOTIVATIONAL_QUOTES)
    subject = f"We miss you, {student_name}! Don't lose your leads"
    
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Hello {student_name},</h2>
        <p>We haven't seen you at CareerCompass AI in a while! Consistency is key to mastering <strong>{target_career}</strong> skills.</p>
        
        <div style="background-color: #e8f4fd; padding: 15px; border-left: 5px solid #3498db; margin: 20px 0;">
            <p style="margin: 0;"><strong>Pro-Tip:</strong> Just 15 minutes of focused learning today can make a big difference.</p>
        </div>

        <p style="font-style: italic; color: #2980b9; margin-top: 20px;">"{quote}"</p>

        <p>Ready to jump back in? We've got fresh news and insights waiting for you.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #95a5a6;">Best Regards,<br>The CareerCompass AI Team</p>
    </body>
    </html>
    """
    
    return send_email_via_smtp(email, subject, body_html)

def send_signup_email(student_name: str, email: str, target_career: str):
    """
    Sends a welcome email upon registration.
    """
    subject = f"Welcome to CareerCompass AI, {student_name}!"
    
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Welcome aboard, {student_name}!</h2>
        <p>We're thrilled to have you join CareerCompass AI. Your journey to becoming a <strong>{target_career}</strong> starts now.</p>
        <p>Make sure to log your learning activities regularly so our AI can provide tailored insights to keep you on the most optimal path.</p>
        <p>Happy learning!</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #95a5a6;">Best Regards,<br>The CareerCompass AI Team</p>
    </body>
    </html>
    """
    
    return send_email_via_smtp(email, subject, body_html)

@app.post("/audit_drift")
def audit_all_students():
    """
    Iterates through all students: 
    1. Checks for career drift -> sends email.
    2. Checks for inactivity (> 24h) -> sends email.
    3. Checks for new tech news -> sends email.
    """
    reports = []
    current_news = get_tech_news()
    # Get the timestamp of the latest news item for comparison
    latest_news_time = datetime.utcnow() # Default fallback
    if current_news:
        try:
            # RSS dates can be complex, for simulation we assume if news exists, it's "new" 
            # if sent more than 24h ago
            pass
        except: pass

    with Session(engine) as session:
        students = session.exec(select(Student)).all()
        for student in students:
            student_emailed = False
            
            # --- 1. Career Drift Audit ---
            if len(student.activities) >= 3:
                # Prevent spamming: only email once every 24 hours
                can_email = True
                if student.last_emailed_at:
                    if datetime.utcnow() - student.last_emailed_at < timedelta(hours=24):
                        can_email = False
                
                if can_email:
                    results = predict_drift(StudentProfile(
                        target_career=student.target_career,
                        recent_activities=[ActivityInput(name=a.name, category=a.category) for a in student.activities]
                    ))
                    drift_prob = results.get("drift_score", 0.0)
                    if drift_prob > 0.6:
                        success = send_drift_email(
                            student_name=student.name,
                            email=student.email,
                            career=student.target_career,
                            drift_score=drift_prob,
                            details=results.get("suggestions", [])
                        )
                        if success:
                            student.last_emailed_at = datetime.utcnow()
                            student.current_drift_score = drift_prob
                            session.add(student)
                            reports.append({"name": student.name, "type": "Drift", "status": "Emailed", "score": drift_prob})
                            student_emailed = True

            # --- 2. Inactivity Audit (Only if not already emailed for drift today) ---
            if not student_emailed:
                # If last visit was > 24 hours ago
                if student.last_visited_at and (datetime.utcnow() - student.last_visited_at > timedelta(hours=24)):
                    # Also respect a general 24h cooldown for ANY email type to avoid spam
                    can_email = True
                    if student.last_emailed_at and (datetime.utcnow() - student.last_emailed_at < timedelta(hours=24)):
                        can_email = False
                        
                    if can_email:
                        success = send_inactivity_email(student.name, student.email, student.target_career)
                        if success:
                            student.last_emailed_at = datetime.utcnow()
                            session.add(student)
                            reports.append({"name": student.name, "type": "Inactivity", "status": "Emailed"})
                            student_emailed = True

            # --- 3. News Update Audit (Only if not already emailed today) ---
            if not student_emailed and current_news:
                # If student hasn't received news in 24 hours
                can_email = True
                if student.last_news_sent_at:
                     if datetime.utcnow() - student.last_news_sent_at < timedelta(hours=24):
                         can_email = False
                
                if can_email:
                    success = send_news_email(student.name, student.email, current_news[:3]) # Send top 3
                    if success:
                        student.last_news_sent_at = datetime.utcnow()
                        session.add(student)
                        reports.append({"name": student.name, "type": "News", "status": "Emailed"})
        
        session.commit()
    return {"total_audited": len(reports), "details": reports}

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
    target_career: Optional[str] = ""

class StudentLogin(BaseModel):
    email: str
    password: str

CAREER_SKILLS = {
    "Data Scientist": ["Python", "Pandas", "Scikit-Learn", "SQL", "Statistics", "TensorFlow", "Keras", "Tableau", "PowerBI", "Matplotlib", "Seaborn", "NumPy", "R", "Machine Learning", "Deep Learning", "Data Analysis", "Data Science", "Analytics", "Model", "Dataset", "Database", "PyTorch", "NLP"],
    "Frontend Developer": ["React", "CSS", "HTML", "JavaScript", "Figma", "Redux", "Tailwind", "Next.js", "TypeScript", "Vue", "Angular", "Sass", "Web Design", "UI", "UX", "Frontend", "App", "Website", "Webpack"],
    "Backend Developer": ["Python", "FastAPI", "SQL", "Docker", "PostgreSQL", "System Design", "Go", "Redis", "Kafka", "Microservices", "Flask", "Node.js", "Express", "MongoDB", "Django", "Kubernetes", "API", "Database", "Server", "Backend", "Java", "Spring", "Springboot", "C#", ".NET", "Ruby", "PHP", "AWS", "Rust", "C++"],
    "DevOps Engineer": ["Docker", "Kubernetes", "Jenkins", "Ansible", "Terraform", "Cloud", "AWS", "Azure", "GCP", "CI/CD", "Linux", "Bash", "Monitoring", "Prometheus", "Grafana", "Nginx"],
    "Full Stack Developer": ["React", "Node.js", "Express", "MongoDB", "SQL", "HTML", "CSS", "JavaScript", "API", "Database", "Frontend", "Backend", "Full Stack"],
    "AI/ML Engineer": ["Python", "PyTorch", "TensorFlow", "Deep Learning", "Neural Networks", "NLP", "Computer Vision", "Pytorch", "Scikit-Learn", "Keras", "AI", "ML"],
    "Data Analyst": ["SQL", "Excel", "Tableau", "PowerBI", "Python", "Pandas", "Statistics", "Data Visualization", "Cleaning", "Reporting", "Analysis"],
    "Business Analyst": ["Requirements", "Agile", "Scrum", "User Stories", "Process Mapping", "SQL", "Stakeholder", "Business", "UML", "BPMN"],
    "Cybersecurity Engineer": ["Security", "Networking", "Pentesting", "Encryption", "Firewall", "Vulnerability", "Ethical Hacking", "CEH", "CISSP", "SOC", "Compliance"],
    "Cloud Engineer": ["AWS", "Azure", "Google Cloud", "Serverless", "S3", "EC2", "Cloud Computing", "Infrastructure", "PaaS", "IaaS", "SaaS"],
    "Mobile Developer": ["React Native", "Flutter", "Swift", "Kotlin", "Java", "Android", "iOS", "Mobile App", "Expo", "Dart"],
    "UI/UX Designer": ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Experience", "User Interface", "Typography", "Color Theory", "Wireframing", "UI", "UX"],
    "Database Administrator": ["PostgreSQL", "MySQL", "MongoDB", "Oracle", "Database Design", "SQL Tuning", "Backup", "Indexing", "DBA", "Query Optimization"],
    "Game Developer": ["Unity", "Unreal Engine", "C#", "C++", "Shaders", "Game Design", "3D Modeling", "Physics Engine", "Blender", "OpenGL"]
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
        
        # Send signup email
        send_signup_email(db_student.name, db_student.email, db_student.target_career)
        
        return db_student

@app.post("/login")
def login_student(login_in: StudentLogin):
    with Session(engine) as session:
        statement = select(Student).where(Student.email == login_in.email)
        student = session.exec(statement).first()
        if not student or not pwd_context.verify(login_in.password, student.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Update last visited
        student.last_visited_at = datetime.utcnow()
        session.add(student)
        session.commit()
        session.refresh(student)
        return student

@app.post("/visit/{student_id}")
def update_visit(student_id: int):
    with Session(engine) as session:
        student = session.get(Student, student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        student.last_visited_at = datetime.utcnow()
        session.add(student)
        session.commit()
        return {"status": "success", "last_visited_at": student.last_visited_at}

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

    if not target:
        return {"drift_score": 0, "status": "No Target", "message": "Please select a career target first.", "suggestions": []}
    
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
            pattern = rf"\b{re.escape(skill)}\b"
            return bool(re.search(pattern, text))

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
            conflicting_careers = []
            for career, skills in other_skills.items():
                for skill in skills:
                    if is_skill_in_text(skill, act_name_lower):
                        conflicting_careers.append(career)
                        is_conflicting = True
                        break # break out of the skills loop for this career

            if is_conflicting:
                act_score = 0.0
                career_list = ", ".join(conflicting_careers)
                suggestions.append(f"'{act.name}' is more related to {career_list}. It's not necessary for {target}.")
            else:
                act_score = 0.0
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

@app.put("/students/{student_id}/career")
def update_student_career(student_id: int, target_career: str = Body(..., embed=True)):
    with Session(engine) as session:
        student = session.get(Student, student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        student.target_career = target_career
        session.add(student)
        session.commit()
        session.refresh(student)
        return student

if __name__ == "__main__":
    import uvicorn
    # Use 0.0.0.0 to allow any local connection (localhost, 127.0.0.1, or network IP)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

