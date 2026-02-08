from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    target_career: str  # e.g., "Data Scientist", "Full Stack Dev"
    current_drift_score: float = 0.0
    
    activities: List["Activity"] = Relationship(back_populates="student")

class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    name: str # e.g., "React Course", "LeetCode Graph Problem"
    category: str # e.g., "Frontend", "Backend", "ML", "DevOps"
    type: str # "Learning", "Project", "Coding"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    student: Optional[Student] = Relationship(back_populates="activities")
