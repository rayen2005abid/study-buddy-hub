from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend import models

try:
    db = SessionLocal()
    student = db.query(models.Student).filter(models.Student.id == 1).first()
    if not student:
        print("Creating student 1...")
        student = models.Student(
            id=1,
            email="student@example.com",
            name="Test Student",
            hashed_password="hashed_password_here"
        )
        db.add(student)
        db.commit()
        print("Student 1 created.")
    else:
        print("Student 1 already exists.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
