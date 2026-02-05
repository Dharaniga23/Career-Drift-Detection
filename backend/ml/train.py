import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import random

# Configuration
CAREERS = ["Data Scientist", "Frontend Dev", "Backend Dev"]
SKILLS_MAP = {
    "Data Scientist": ["Python", "Pandas", "Scikit-Learn", "SQL", "Statistics", "TensorFlow", "Keras", "Tableau", "PowerBI"],
    "Frontend Dev": ["React", "CSS", "HTML", "JavaScript", "Figma", "Redux", "Tailwind", "Next.js", "TypeScript"],
    "Backend Dev": ["FastAPI", "Docker", "PostgreSQL", "System Design", "Go", "Redis", "Kafka", "Microservices", "Flask"]
}

def load_and_process_data(filepath="ml/data/career_data.csv"):
    if not os.path.exists(filepath):
        print(f"Dataset not found at {filepath}")
        return pd.DataFrame()

    df = pd.read_csv(filepath)
    
    # Feature Engineering: Aggregate by student
    student_stats = []
    
    for student_id, group in df.groupby("student_id"):
        target = group["target_career"].iloc[0]
        status = group["status"].iloc[0]
        activities = group["activity_name"].tolist()
        
        # Calculate Relevance
        relevant_skills = SKILLS_MAP.get(target, [])
        relevant_count = sum(1 for a in activities if a in relevant_skills)
        relevant_ratio = relevant_count / len(activities) if len(activities) > 0 else 0
        
        student_stats.append({
            "target_career": target,
            "relevant_ratio": relevant_ratio,
            "is_drifting": 1 if status == "Drifting" else 0
        })
        
    return pd.DataFrame(student_stats)

def train():
    print("Loading Dataset from CSV...")
    df = load_and_process_data()
    
    if df.empty:
        print("No data to train.")
        return

    X = df[["relevant_ratio"]]
    y = df["is_drifting"]
    
    print(f"Training Model on {len(df)} student profiles...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    clf = RandomForestClassifier(n_estimators=100)
    clf.fit(X_train, y_train)
    
    print("Evaluation:")
    print(classification_report(y_test, clf.predict(X_test)))
    
    # Save Model
    joblib.dump(clf, "drift_model.pkl")
    print("Model saved to drift_model.pkl")

if __name__ == "__main__":
    train()
