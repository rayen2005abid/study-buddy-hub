"""
Seed script to populate the database with sample data
Run this to make the website feel populated with realistic study data
"""
from datetime import datetime, timedelta
import random
import sqlite3
import json

# Direct SQLite connection for simplicity
DB_PATH = "studybuddy_v2.db"

def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if student already exists
        cursor.execute("SELECT id FROM students WHERE id = 1")
        existing_student = cursor.fetchone()
        
        if existing_student:
            print("Student already exists. Clearing old sessions...")
            # Clear old sessions for clean slate
            cursor.execute("DELETE FROM focus_metrics")
            cursor.execute("DELETE FROM study_sessions")
            cursor.execute("DELETE FROM study_patterns WHERE student_id = 1")
            conn.commit()
        else:
            # Create a test student
            cursor.execute("""
                INSERT INTO students (id, name, email, hashed_password)
                VALUES (1, 'Alex Johnson', 'alex@studybuddy.com', 'hashedpassword123')
            """)
            conn.commit()
            print("✓ Created student: Alex Johnson")
        
        # Create user preferences if not exists
        cursor.execute("SELECT id FROM user_preferences WHERE student_id = 1")
        existing_prefs = cursor.fetchone()
        if not existing_prefs:
            cursor.execute("""
                INSERT INTO user_preferences (student_id, study_duration_minutes, break_duration_minutes, theme)
                VALUES (1, 25, 5, 'dark')
            """)
            conn.commit()
            print("✓ Created user preferences")
        
        # Create study sessions over the past 2 weeks
        subjects = ["Mathematics", "Physics", "Computer Science", "Chemistry", "Biology", "History", "Literature"]
        session_types = ["focus", "break", "focus", "focus"]  # More focus sessions
        
        sessions_created = 0
        now = datetime.utcnow()
        
        # Create sessions for the past 14 days
        for day_offset in range(14, 0, -1):
            # Random number of sessions per day (1-4)
            num_sessions = random.randint(1, 4)
            
            for _ in range(num_sessions):
                session_date = now - timedelta(days=day_offset)
                # Add random hours (between 8 AM and 10 PM)
                session_date = session_date.replace(
                    hour=random.randint(8, 22),
                    minute=random.randint(0, 59),
                    second=0,
                    microsecond=0
                )
                
                session_type = random.choice(session_types)
                duration = random.randint(15, 45) if session_type == "focus" else random.randint(5, 15)
                focus_score = random.uniform(65, 95) if session_type == "focus" else random.uniform(40, 70)
                completed = random.random() > 0.2  # 80% completion rate
                
                end_time = session_date + timedelta(minutes=duration)
                
                cursor.execute("""
                    INSERT INTO study_sessions 
                    (student_id, start_time, end_time, session_type, subject, duration_minutes, 
                     focus_score, distractions_count, completed)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    1,
                    session_date.isoformat(),
                    end_time.isoformat(),
                    session_type,
                    random.choice(subjects) if session_type == "focus" else None,
                    duration,
                    focus_score,
                    random.randint(0, 5),
                    1 if completed else 0
                ))
                
                session_id = cursor.lastrowid
                
                # Add focus metrics for this session (sample data points)
                num_metrics = random.randint(3, 8)
                for i in range(num_metrics):
                    metric_time = session_date + timedelta(minutes=i * (duration // num_metrics))
                    emotion_states = ["focused", "happy", "neutral", "tired", "confused"]
                    distraction_types = [None, None, None, "phone", "social_media", "other"]  # Mostly no distractions
                    
                    cursor.execute("""
                        INSERT INTO focus_metrics 
                        (session_id, timestamp, focus_score, emotion_state, distraction_type)
                        VALUES (?, ?, ?, ?, ?)
                    """, (
                        session_id,
                        metric_time.isoformat(),
                        random.uniform(max(0, focus_score - 15), min(100, focus_score + 15)),
                        random.choice(emotion_states),
                        random.choice(distraction_types)
                    ))
                
                sessions_created += 1
        
        conn.commit()
        print(f"✓ Created {sessions_created} study sessions with focus metrics")
        
        # Create study pattern
        total_minutes = sessions_created * 25  # Approximate
        cursor.execute("DELETE FROM study_patterns WHERE student_id = 1")
        cursor.execute("""
            INSERT INTO study_patterns 
            (student_id, best_study_hour, optimal_session_minutes, average_focus_score, 
             total_study_minutes, current_streak_days, longest_streak_days, 
             best_day_of_week, sessions_this_week, sessions_last_week, subject_performance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            1,
            14,  # 2 PM
            25,
            78.5,
            total_minutes,
            5,
            12,
            1,  # Tuesday
            8,
            12,
            json.dumps({
                "Mathematics": 85,
                "Physics": 78,
                "Computer Science": 92,
                "Chemistry": 75,
                "Biology": 80,
                "History": 70,
                "Literature": 88
            })
        ))
        conn.commit()
        print("✓ Created study pattern analytics")
        
        # Create some community questions
        questions_data = [
            {
                "title": "How to improve focus during long study sessions?",
                "content": "I find it hard to maintain focus for more than 20 minutes. Any tips on building up my concentration stamina?"
            },
            {
                "title": "Best time management techniques for students?",
                "content": "What are your favorite time management methods? I've heard about Pomodoro but wondering if there are other effective techniques."
            },
            {
                "title": "Dealing with procrastination on difficult subjects",
                "content": "I always put off studying subjects I find challenging. How do you motivate yourself to tackle difficult material?"
            },
            {
                "title": "How to balance multiple subjects effectively?",
                "content": "I'm taking 6 courses this semester and struggling to give each one enough attention. Any advice?"
            }
        ]
        
        # Clear existing questions
        cursor.execute("DELETE FROM answers WHERE student_id = 1")
        cursor.execute("DELETE FROM questions WHERE student_id = 1")
        
        for q_data in questions_data:
            question_time = now - timedelta(days=random.randint(1, 10))
            cursor.execute("""
                INSERT INTO questions (title, content, student_id, created_at)
                VALUES (?, ?, ?, ?)
            """, (
                q_data["title"],
                q_data["content"],
                1,
                question_time.isoformat()
            ))
            
            question_id = cursor.lastrowid
            
            # Add some answers
            answers_data = [
                "Try the Pomodoro technique! 25 minutes of focused work followed by a 5-minute break really helps.",
                "I found that removing all distractions (phone, social media) before starting helps a lot.",
                "Start with the hardest subject when your energy is highest. It makes a big difference!",
            ]
            
            num_answers = random.randint(1, 3)
            for i in range(num_answers):
                answer_time = question_time + timedelta(hours=random.randint(1, 48))
                cursor.execute("""
                    INSERT INTO answers (content, question_id, student_id, created_at)
                    VALUES (?, ?, ?, ?)
                """, (
                    answers_data[i],
                    question_id,
                    1,
                    answer_time.isoformat()
                ))
        
        conn.commit()
        print(f"✓ Created {len(questions_data)} community questions with answers")
        
        print("\n✅ Database seeded successfully!")
        print(f"   - Student: Alex Johnson (ID: 1)")
        print(f"   - Study sessions: {sessions_created}")
        print(f"   - Total study time: {total_minutes // 60}h {total_minutes % 60}m")
        print(f"   - Current streak: 5 days")
        print(f"   - Community questions: {len(questions_data)}")
        print("\nYou can now use the application with populated data!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("🌱 Seeding database with sample data...\n")
    seed_database()
