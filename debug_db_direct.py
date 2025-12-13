from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models

try:
    db = SessionLocal()
    print("Checking for student 1...")
    student = db.query(models.Student).filter(models.Student.id == 1).first()
    if student:
        print(f"Found student: {student.name}")
    else:
        print("Student 1 not found (this would trigger 404 in app, not 500)")
        
    # Check if we can create a student (test write)
    # db_student = models.Student(email="test@test.com", name="Test User", hashed_password="pwd")
    # db.add(db_student)
    # db.commit()
    
except Exception as e:
    print(f"DB Error: {e}")
finally:
    db.close()
