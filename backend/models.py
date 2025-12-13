from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
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
    focus_score = Column(Float, default=0.0) # Average focus score for the session
    
    student = relationship("Student", back_populates="sessions")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    study_duration_minutes = Column(Integer, default=25)
    break_duration_minutes = Column(Integer, default=5)
    theme = Column(String, default="light") # light, dark
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
