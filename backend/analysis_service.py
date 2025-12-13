from datetime import datetime

class AnalysisService:
    def analyze_session(self, focus_score: float, current_duration_minutes: int, preferences: dict) -> dict:
        """
        Analyzes the current session state and returns advice if needed.
        Returns None if no advice is needed.
        """
        advice = None
        current_hour = datetime.now().hour

        # 1. Check Focus Quality
        if focus_score < 0.4:
            advice = {
                "title": "Low Focus Detected",
                "description": "You seem a bit distracted. Try taking a deep breath or a short stretch.",
                "type": "warning"
            }

        # 2. Check Duration vs Preference
        preferred_duration = preferences.get("study_duration_minutes", 25)
        # If they exceed their preferred duration by 5 minutes
        if current_duration_minutes >= preferred_duration + 5:
             advice = {
                "title": "Time for a Break?",
                "description": f"You've been studying for {current_duration_minutes} mins. Your goal was {preferred_duration} mins.",
                "type": "info"
            }

        # 3. Late Night Study
        if current_hour >= 23 or current_hour < 5:
             advice = {
                "title": "Late Night Warrior",
                "description": "It's getting late. Sleep is crucial for memory consolidation!",
                "type": "info"
            }

        return advice
