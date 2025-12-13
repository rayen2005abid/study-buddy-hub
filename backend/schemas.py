from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StudentBase(BaseModel):
    name: str
    email: str

class StudentCreate(StudentBase):
    password: str

class Student(StudentBase):
    id: int
    
    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    student_id: int
    start_time: datetime = datetime.now()

class SessionUpdate(BaseModel):
    end_time: datetime
    focus_score: float

class Session(BaseModel):
    id: int
    student_id: int
    start_time: datetime
    end_time: Optional[datetime]
    focus_score: float

    class Config:
        from_attributes = True

class PreferenceBase(BaseModel):
    study_duration_minutes: int = 25
    break_duration_minutes: int = 5
    theme: str = "light"
    api_key: Optional[str] = None

class PreferenceCreate(PreferenceBase):
    pass

class Preference(PreferenceBase):
    id: int
    student_id: int
    
    class Config:
        from_attributes = True

class AnswerBase(BaseModel):
    content: str

class AnswerCreate(AnswerBase):
    question_id: int
    student_id: int # Ideally taken from token, but simple for now

class Answer(AnswerBase):
    id: int
    question_id: int
    student_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    title: str
    content: str

class QuestionCreate(QuestionBase):
    student_id: int

class Question(QuestionBase):
    id: int
    student_id: int
    created_at: datetime
    answers: List[Answer] = []

    class Config:
        from_attributes = True
