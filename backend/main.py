from fastapi import FastAPI, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel

from backend.database import engine, Base, get_db
from backend.models import UserPreference
from backend.chat_service import ChatService
from backend.analysis_service import AnalysisService
import backend.schemas as schemas
import backend.models as models

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS for frontend connection
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    return {"message": "Welcome to Study Buddy Hub Backend"}


from .chat_service import ChatService

chat_service = ChatService()
analysis_service = AnalysisService()

class AnalyzeRequest(BaseModel):
    student_id: int
    focus_score: float
    current_duration_minutes: int

class ChatRequest(BaseModel):
    message: str
    api_key: str = None

@app.post("/analyze")
def analyze_endpoint(request: AnalyzeRequest, db: Session = Depends(get_db)):
    # Fetch user preferences
    prefs = db.query(UserPreference).filter(UserPreference.student_id == request.student_id).first()
    pref_dict = {}
    if prefs:
        pref_dict = {
            "study_duration_minutes": prefs.study_duration_minutes,
            "break_duration_minutes": prefs.break_duration_minutes
        }
    
    advice = analysis_service.analyze_session(
        request.focus_score, 
        request.current_duration_minutes, 
        pref_dict
    )
    return {"advice": advice}

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    response = chat_service.get_response(request.message, request.api_key)
    return {"response": response}

@app.post("/students/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.email == student.email).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Email already registered")
    # In a real app, hash the password here
    fake_hashed_password = student.password + "notreallyhashed"
    db_student = models.Student(email=student.email, name=student.name, hashed_password=fake_hashed_password)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.get("/students/{student_id}", response_model=schemas.Student)
def read_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return db_student

# Focus Tracking WebSocket
@app.websocket("/ws/focus/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Here we would receive "focused" or "distracted" or raw data
            # For now, just echo it back or log it
            await websocket.send_text(f"Message text was: {data}")
    except Exception as e:
        print(f"Connection closed: {e}")


# Community Endpoints
@app.post("/questions/", response_model=schemas.Question)
def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_question = models.Question(**question.model_dump())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@app.get("/questions/", response_model=List[schemas.Question])
def get_questions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    questions = db.query(models.Question).offset(skip).limit(limit).all()
    return questions

@app.post("/answers/", response_model=schemas.Answer)
def create_answer(answer: schemas.AnswerCreate, db: Session = Depends(get_db)):
    db_answer = models.Answer(**answer.model_dump())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

# Preferences Endpoints
@app.get("/students/{student_id}/preferences", response_model=schemas.Preference)
def get_preferences(student_id: int, db: Session = Depends(get_db)):
    pref = db.query(models.UserPreference).filter(models.UserPreference.student_id == student_id).first()
    if not pref:
        # Create default if not exists
        pref = models.UserPreference(student_id=student_id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@app.put("/students/{student_id}/preferences", response_model=schemas.Preference)
def update_preferences(student_id: int, preference: schemas.PreferenceCreate, db: Session = Depends(get_db)):
    db_pref = db.query(models.UserPreference).filter(models.UserPreference.student_id == student_id).first()
    if not db_pref:
        db_pref = models.UserPreference(student_id=student_id, **preference.model_dump())
        db.add(db_pref)
    else:
        for key, value in preference.model_dump().items():
            setattr(db_pref, key, value)
    
    db.commit()
    db.refresh(db_pref)
    return db_pref


# ===== NEW PERSONALIZATION ENDPOINTS =====

from backend.analytics_service import AnalyticsService
from datetime import datetime

analytics_service = AnalyticsService()

class SessionStartRequest(BaseModel):
    student_id: int
    session_type: str = "focus"  # focus, break, pomodoro
    subject: str = None

class SessionUpdateRequest(BaseModel):
    focus_score: float = None
    distractions_count: int = None
    duration_minutes: int = None

class SessionCompleteRequest(BaseModel):
    focus_score: float
    duration_minutes: int
    distractions_count: int = 0
    completed: bool = True

class FocusMetricRequest(BaseModel):
    session_id: int
    focus_score: float
    emotion_state: str = None
    distraction_type: str = None

@app.post("/sessions/start")
def start_session(request: SessionStartRequest, db: Session = Depends(get_db)):
    """Start a new study session"""
    session = models.StudySession(
        student_id=request.student_id,
        session_type=request.session_type,
        subject=request.subject,
        start_time=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id, "start_time": session.start_time}

@app.put("/sessions/{session_id}/update")
def update_session(session_id: int, request: SessionUpdateRequest, db: Session = Depends(get_db)):
    """Update an ongoing session"""
    session = db.query(models.StudySession).filter(models.StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if request.focus_score is not None:
        session.focus_score = request.focus_score
    if request.distractions_count is not None:
        session.distractions_count = request.distractions_count
    if request.duration_minutes is not None:
        session.duration_minutes = request.duration_minutes
    
    db.commit()
    return {"message": "Session updated"}

@app.post("/sessions/{session_id}/complete")
def complete_session(session_id: int, request: SessionCompleteRequest, db: Session = Depends(get_db)):
    """Mark a session as complete"""
    session = db.query(models.StudySession).filter(models.StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.end_time = datetime.utcnow()
    session.focus_score = request.focus_score
    session.duration_minutes = request.duration_minutes
    session.distractions_count = request.distractions_count
    session.completed = request.completed
    
    db.commit()
    
    # Update study patterns
    analytics_service.update_study_pattern(db, session.student_id)
    
    return {"message": "Session completed", "session_id": session.id}

@app.post("/sessions/{session_id}/focus-metric")
def add_focus_metric(session_id: int, request: FocusMetricRequest, db: Session = Depends(get_db)):
    """Add a focus metric data point to a session"""
    metric = models.FocusMetric(
        session_id=session_id,
        focus_score=request.focus_score,
        emotion_state=request.emotion_state,
        distraction_type=request.distraction_type,
        timestamp=datetime.utcnow()
    )
    db.add(metric)
    db.commit()
    return {"message": "Focus metric recorded"}

@app.get("/students/{student_id}/stats")
def get_user_stats(student_id: int, db: Session = Depends(get_db)):
    """Get personalized statistics for a user"""
    stats = analytics_service.calculate_user_stats(db, student_id)
    return stats

@app.get("/students/{student_id}/insights")
def get_user_insights(student_id: int, db: Session = Depends(get_db)):
    """Get personalized insights for a user"""
    insights = analytics_service.generate_insights(db, student_id)
    return {"insights": insights}

@app.get("/students/{student_id}/weekly-data")
def get_weekly_data(student_id: int, db: Session = Depends(get_db)):
    """Get weekly study data for charts"""
    data = analytics_service.get_weekly_data(db, student_id)
    return {"weekly_data": data}

@app.get("/students/{student_id}/sessions")
def get_user_sessions(student_id: int, limit: int = 20, db: Session = Depends(get_db)):
    """Get recent sessions for a user"""
    sessions = db.query(models.StudySession).filter(
        models.StudySession.student_id == student_id
    ).order_by(models.StudySession.start_time.desc()).limit(limit).all()
    
    return [{
        "id": s.id,
        "start_time": s.start_time,
        "end_time": s.end_time,
        "duration_minutes": s.duration_minutes,
        "focus_score": s.focus_score,
        "subject": s.subject,
        "session_type": s.session_type,
        "completed": s.completed,
        "distractions_count": s.distractions_count
    } for s in sessions]

