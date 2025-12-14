from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    sessions = relationship("StudySession", back_populates="student")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    focus_score = Column(Float, default=0.0)  # Average focus score for the session
    
    # Enhanced tracking fields
    session_type = Column(String, default="focus")  # focus, break, pomodoro
    subject = Column(String, nullable=True)  # What they're studying
    duration_minutes = Column(Integer, default=0)  # Actual duration
    distractions_count = Column(Integer, default=0)  # Number of distractions
    completed = Column(Boolean, default=False)  # Did they finish the session?
    notes = Column(Text, nullable=True)  # Optional session notes
    
    student = relationship("Student", back_populates="sessions")
    focus_metrics = relationship("FocusMetric", back_populates="session", cascade="all, delete-orphan")

class FocusMetric(Base):
    __tablename__ = "focus_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("study_sessions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    focus_score = Column(Float)  # Focus score at this moment (0-100)
    emotion_state = Column(String, nullable=True)  # happy, focused, tired, distracted
    distraction_type = Column(String, nullable=True)  # phone, social_media, other
    
    session = relationship("StudySession", back_populates="focus_metrics")

class StudyPattern(Base):
    __tablename__ = "study_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    
    # Performance insights
    best_study_hour = Column(Integer, nullable=True)  # 0-23, best hour of day
    optimal_session_minutes = Column(Integer, default=25)  # Optimal session length
    average_focus_score = Column(Float, default=0.0)
    total_study_minutes = Column(Integer, default=0)
    current_streak_days = Column(Integer, default=0)
    longest_streak_days = Column(Integer, default=0)
    
    # Weekly patterns
    best_day_of_week = Column(Integer, nullable=True)  # 0=Monday, 6=Sunday
    sessions_this_week = Column(Integer, default=0)
    sessions_last_week = Column(Integer, default=0)
    
    # Subject performance (JSON stored as string)
    subject_performance = Column(Text, nullable=True)  # JSON: {"math": 85, "science": 92}
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    student = relationship("Student", back_populates="study_pattern")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    study_duration_minutes = Column(Integer, default=25)
    break_duration_minutes = Column(Integer, default=5)
    theme = Column(String, default="light")  # light, dark
    api_key = Column(String, nullable=True)
    
    student = relationship("Student", back_populates="preferences")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    student_id = Column(Integer, ForeignKey("students.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    question_id = Column(Integer, ForeignKey("questions.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    question = relationship("Question", back_populates="answers")
    student = relationship("Student", back_populates="answers")

# Add relationships to Student model
Student.preferences = relationship("UserPreference", back_populates="student", uselist=False)
Student.questions = relationship("Question", back_populates="student")
Student.answers = relationship("Answer", back_populates="student")
Student.study_pattern = relationship("StudyPattern", back_populates="student", uselist=False)
