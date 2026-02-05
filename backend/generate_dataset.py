import pandas as pd
import random
import os

# Configuration
NUM_SAMPLES = 1000
CAREERS = ["Data Scientist", "Frontend Dev", "Backend Dev"]
SKILLS_MAP = {
    "Data Scientist": ["Python", "Pandas", "Scikit-Learn", "SQL", "Statistics", "TensorFlow", "Keras", "Tableau", "PowerBI"],
    "Frontend Dev": ["React", "CSS", "HTML", "JavaScript", "Figma", "Redux", "Tailwind", "Next.js", "TypeScript"],
    "Backend Dev": ["FastAPI", "Docker", "PostgreSQL", "System Design", "Go", "Redis", "Kafka", "Microservices", "Flask"]
}

data = []

for i in range(NUM_SAMPLES):
    target = random.choice(CAREERS)
    
    # 70% chance of being successful (On Track), 30% Drifting
    is_drifting = random.random() < 0.3
    
    primary_skills = SKILLS_MAP[target]
    other_skills = []
    for c, skills in SKILLS_MAP.items():
        if c != target:
            other_skills.extend(skills)
            
    # Generate 5-10 recent activities per student
    num_activities = random.randint(5, 10)
    student_activities = []
    
    if is_drifting:
        # Mix of random skills, low relevance
        pool = primary_skills + other_skills * 4 # Weighted towards irrelevant
        status = "Drifting"
    else:
        # High relevance
        pool = primary_skills * 4 + other_skills
        status = "On Track"
        
    for _ in range(num_activities):
        act_name = random.choice(pool)
        # Determine category based on where the skill came from
        category = "Unknown"
        for cat, skills in SKILLS_MAP.items():
            if act_name in skills:
                category = cat
                break
        
        data.append({
            "student_id": i + 1,
            "target_career": target,
            "activity_name": act_name,
            "category": category,
            "status": status
        })

df = pd.DataFrame(data)
os.makedirs("ml/data", exist_ok=True)
df.to_csv("ml/data/career_data.csv", index=False)
print(f"Generated {len(df)} activity records in ml/data/career_data.csv")
