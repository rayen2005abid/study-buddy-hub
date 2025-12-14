from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
from .models import StudySession, FocusMetric, StudyPattern, Student

class AnalyticsService:
    """Service for analyzing user study patterns and generating personalized insights"""
    
    def calculate_user_stats(self, db: Session, student_id: int) -> Dict:
        """Calculate comprehensive user statistics"""
        
        # Get all completed sessions
        sessions = db.query(StudySession).filter(
            and_(
                StudySession.student_id == student_id,
                StudySession.completed == True
            )
        ).all()
        
        if not sessions:
            return self._get_default_stats()
        
        # Calculate totals
        total_minutes = sum(s.duration_minutes for s in sessions)
        total_sessions = len(sessions)
        avg_focus = sum(s.focus_score for s in sessions) / total_sessions if total_sessions > 0 else 0
        
        # Calculate this week's stats
        week_ago = datetime.utcnow() - timedelta(days=7)
        this_week_sessions = [s for s in sessions if s.start_time >= week_ago]
        this_week_minutes = sum(s.duration_minutes for s in this_week_sessions) / 60  # Convert to hours
        
        # Calculate streak
        streak = self._calculate_streak(sessions)
        
        # Get last week for comparison
        two_weeks_ago = datetime.utcnow() - timedelta(days=14)
        last_week_sessions = [s for s in sessions if two_weeks_ago <= s.start_time < week_ago]
        last_week_avg_focus = sum(s.focus_score for s in last_week_sessions) / len(last_week_sessions) if last_week_sessions else 0
        
        # Calculate improvement
        focus_improvement = ((avg_focus - last_week_avg_focus) / last_week_avg_focus * 100) if last_week_avg_focus > 0 else 0
        
        return {
            "total_study_time_hours": round(total_minutes / 60, 1),
            "this_week_hours": round(this_week_minutes, 1),
            "average_focus_score": round(avg_focus, 1),
            "current_streak_days": streak,
            "total_sessions": total_sessions,
            "this_week_sessions": len(this_week_sessions),
            "focus_improvement_percent": round(focus_improvement, 1)
        }
    
    def _calculate_streak(self, sessions: List[StudySession]) -> int:
        """Calculate current study streak in days"""
        if not sessions:
            return 0
        
        # Sort sessions by date
        sorted_sessions = sorted(sessions, key=lambda x: x.start_time, reverse=True)
        
        # Get unique study dates
        study_dates = set()
        for session in sorted_sessions:
            date = session.start_time.date()
            study_dates.add(date)
        
        # Calculate streak
        streak = 0
        current_date = datetime.utcnow().date()
        
        while current_date in study_dates:
            streak += 1
            current_date -= timedelta(days=1)
        
        return streak
    
    def _get_default_stats(self) -> Dict:
        """Return default stats for new users"""
        return {
            "total_study_time_hours": 0,
            "this_week_hours": 0,
            "average_focus_score": 0,
            "current_streak_days": 0,
            "total_sessions": 0,
            "this_week_sessions": 0,
            "focus_improvement_percent": 0
        }
    
    def generate_insights(self, db: Session, student_id: int) -> List[str]:
        """Generate personalized insights based on user data"""
        insights = []
        
        # Get sessions from last 2 weeks
        two_weeks_ago = datetime.utcnow() - timedelta(days=14)
        sessions = db.query(StudySession).filter(
            and_(
                StudySession.student_id == student_id,
                StudySession.completed == True,
                StudySession.start_time >= two_weeks_ago
            )
        ).all()
        
        if not sessions:
            insights.append("Start your first study session to get personalized insights!")
            return insights
        
        # Analyze best time of day
        best_hour = self._find_best_study_hour(sessions)
        if best_hour is not None:
            time_str = self._format_hour(best_hour)
            insights.append(f"🌟 Your best study time is around {time_str}")
        
        # Analyze optimal session length
        optimal_length = self._find_optimal_session_length(sessions)
        if optimal_length:
            insights.append(f"⏱️ Your focus is best in {optimal_length}-minute sessions")
        
        # Check for improvement
        stats = self.calculate_user_stats(db, student_id)
        if stats["focus_improvement_percent"] > 5:
            insights.append(f"📈 Great progress! Your focus improved {stats['focus_improvement_percent']}% this week")
        elif stats["focus_improvement_percent"] < -5:
            insights.append(f"💪 Your focus dipped {abs(stats['focus_improvement_percent'])}% - try shorter sessions or more breaks")
        
        # Check streak
        if stats["current_streak_days"] >= 7:
            insights.append(f"🔥 Amazing {stats['current_streak_days']}-day streak! Keep it going!")
        elif stats["current_streak_days"] >= 3:
            insights.append(f"✨ {stats['current_streak_days']}-day streak! You're building great habits")
        
        # Analyze distractions
        avg_distractions = sum(s.distractions_count for s in sessions) / len(sessions)
        if avg_distractions > 3:
            insights.append("📱 Try blocking distracting apps - you're averaging {:.0f} distractions per session".format(avg_distractions))
        
        return insights
    
    def _find_best_study_hour(self, sessions: List[StudySession]) -> Optional[int]:
        """Find the hour of day with best focus scores"""
        hour_scores = {}
        
        for session in sessions:
            hour = session.start_time.hour
            if hour not in hour_scores:
                hour_scores[hour] = []
            hour_scores[hour].append(session.focus_score)
        
        if not hour_scores:
            return None
        
        # Calculate average for each hour
        hour_averages = {hour: sum(scores) / len(scores) for hour, scores in hour_scores.items()}
        
        # Return hour with highest average (only if we have enough data)
        if len(hour_averages) >= 2:
            return max(hour_averages, key=hour_averages.get)
        
        return None
    
    def _find_optimal_session_length(self, sessions: List[StudySession]) -> Optional[int]:
        """Find the session length with best focus scores"""
        # Group sessions by duration buckets
        buckets = {
            15: [],  # 10-20 min
            25: [],  # 20-30 min
            35: [],  # 30-40 min
            45: [],  # 40-50 min
            60: []   # 50+ min
        }
        
        for session in sessions:
            duration = session.duration_minutes
            if duration < 20:
                buckets[15].append(session.focus_score)
            elif duration < 30:
                buckets[25].append(session.focus_score)
            elif duration < 40:
                buckets[35].append(session.focus_score)
            elif duration < 50:
                buckets[45].append(session.focus_score)
            else:
                buckets[60].append(session.focus_score)
        
        # Calculate averages
        bucket_averages = {
            duration: sum(scores) / len(scores) 
            for duration, scores in buckets.items() 
            if len(scores) >= 2  # Need at least 2 sessions
        }
        
        if bucket_averages:
            return max(bucket_averages, key=bucket_averages.get)
        
        return None
    
    def _format_hour(self, hour: int) -> str:
        """Format hour as readable time"""
        if hour == 0:
            return "midnight"
        elif hour < 12:
            return f"{hour} AM"
        elif hour == 12:
            return "noon"
        else:
            return f"{hour - 12} PM"
    
    def get_weekly_data(self, db: Session, student_id: int) -> List[Dict]:
        """Get study data for the past week for charts"""
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        sessions = db.query(StudySession).filter(
            and_(
                StudySession.student_id == student_id,
                StudySession.completed == True,
                StudySession.start_time >= week_ago
            )
        ).all()
        
        # Group by day
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        day_data = {day: {"hours": 0, "sessions": 0} for day in days}
        
        for session in sessions:
            day_name = days[session.start_time.weekday()]
            day_data[day_name]["hours"] += session.duration_minutes / 60
            day_data[day_name]["sessions"] += 1
        
        # Format for frontend
        return [
            {
                "day": day,
                "hours": round(data["hours"], 1),
                "sessions": data["sessions"]
            }
            for day, data in day_data.items()
        ]
    
    def update_study_pattern(self, db: Session, student_id: int):
        """Update or create study pattern analytics for user"""
        pattern = db.query(StudyPattern).filter(StudyPattern.student_id == student_id).first()
        
        if not pattern:
            pattern = StudyPattern(student_id=student_id)
            db.add(pattern)
        
        # Get all sessions
        sessions = db.query(StudySession).filter(
            and_(
                StudySession.student_id == student_id,
                StudySession.completed == True
            )
        ).all()
        
        if not sessions:
            db.commit()
            return
        
        # Update pattern data
        stats = self.calculate_user_stats(db, student_id)
        pattern.average_focus_score = stats["average_focus_score"]
        pattern.total_study_minutes = int(stats["total_study_time_hours"] * 60)
        pattern.current_streak_days = stats["current_streak_days"]
        pattern.sessions_this_week = stats["this_week_sessions"]
        
        # Find best hour
        best_hour = self._find_best_study_hour(sessions)
        if best_hour is not None:
            pattern.best_study_hour = best_hour
        
        # Find optimal session length
        optimal_length = self._find_optimal_session_length(sessions)
        if optimal_length:
            pattern.optimal_session_minutes = optimal_length
        
        pattern.last_updated = datetime.utcnow()
        db.commit()
