import re
import os
import requests
import json

class ChatService:
    def __init__(self):
        self.patterns = {
            r"memory|remember|forget": "Memory can be improved using **Spaced Repetition** and **Active Recall**. Try breaking your study sessions into smaller chunks and testing yourself frequently.",
            r"procrastinat|lazy|start": "Procrastination often comes from a lack of clarity. Try the **2-Minute Rule**: if something takes less than 2 minutes, do it now. Or use the **Pomodoro Technique** (25min work, 5min break).",
            r"motivat|tired|bore": "Motivation follows action. Don't wait to feel like it. Start with just 5 minutes. Set a small, achievable goal for this session.",
            r"focus|concentrat|distract": "To improve focus: 1. Remove phone/notifications. 2. Use our Focus Timer. 3. Listen to binaural beats or white noise. 4. Keep a 'distraction list' to write down popping thoughts.",
            r"plan|schedul|organiz": "A good study plan is realistic. Block out time for *specific* tasks, not just 'studying'. Prioritize your hardest subjects for when you are most alert.",
            r"anxiety|stress|panic": "Deep breathing helps. Try the 4-7-8 technique: Inhale for 4s, hold for 7s, exhale for 8s. You've got this!",
            r"exam|test|quiz": "For exams, practice with past papers under timed conditions. It's the best way to simulate the pressure and identify gaps.",
            r"hello|hi|hey": "Hello! I'm your AI Study Coach. Tell me what you're working on today, or ask me for a study tip!",
            r"help": "I can help with: Memory techniques, Procrastination, Motivation, Focus, and Exam prep. Just ask!",
            r"thank": "You're welcome! Keep studying hard.",
        }

    def get_response(self, message: str, api_key: str = None) -> str:
        # 1. External LLM
        if api_key and len(api_key) > 10:
            try:
                response = None
                # Gemini Key Detection (Starts with AIzaSy)
                if api_key.startswith("AIzaSy"):
                    response = self._call_gemini(message, api_key)
                # Default to OpenAI (Starts with sk- or other)
                else:
                    response = self._call_openai(message, api_key)
                
                # Check if the response was successful (not an error message)
                # My helper methods return strings starting with "Error", "Failed", or "All Gemini" on failure
                if response and not (response.startswith("Error") or response.startswith("Failed") or response.startswith("All Gemini")):
                    return response
                
                # If it was an error, log it and fall through to local
                print(f"External API failed, falling back to local. Reason: {response}")
                
            except Exception as e:
                print(f"External API exception, falling back to local. Reason: {str(e)}")
                # Fall through to local logic below

        # 2. Local Pattern Matching (Fallback)
        msg_lower = message.lower()
        
        # Check specific patterns
        for pattern, response in self.patterns.items():
            if re.search(pattern, msg_lower):
                return response

        # 3. Default Fallback
        return "That's an interesting topic. Could you be more specific? I can help with memory, focus, efficient learning, and motivation."

    def _call_openai(self, message: str, api_key: str) -> str:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a helpful, encouraging, and knowledgeable AI Study Coach. Your goal is to help students learn effectively using evidence-based techniques (like spaced repetition, active recall, Pomodoro). Keep answers concise and motivating."},
                {"role": "user", "content": message}
            ],
            "temperature": 0.7
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"Error from OpenAI: {response.text}"

    def _call_gemini(self, message: str, api_key: str) -> str:
        # First, try to discover a working model
        try:
            model_name = self._discover_gemini_model(api_key)
        except Exception as e:
            # Fallback to a safe default if discovery fails
            print(f"Model discovery failed: {e}")
            model_name = "gemini-1.5-flash"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{
                "parts": [{"text": f"You are a helpful AI Study Coach. Help the student with: {message}"}]
            }]
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                if "candidates" in result and result["candidates"]:
                    return result["candidates"][0]["content"]["parts"][0]["text"]
                return "No response content from Gemini."
            else:
                return f"Error from Gemini ({model_name}): {response.text}"
        except Exception as e:
            return f"Failed to connect to Gemini: {str(e)}"

    def _discover_gemini_model(self, api_key: str) -> str:
        # Fetch available models
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        response = requests.get(url, timeout=5)
        
        if response.status_code != 200:
            raise Exception(f"ListModels failed: {response.text}")
            
        data = response.json()
        models = data.get("models", [])
        
        # Priority list of preferred models
        preferences = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"]
        
        # 1. Look for preferred models that support generateContent
        for pref in preferences:
            for m in models:
                if pref in m["name"] and "generateContent" in m.get("supportedGenerationMethods", []):
                    return m["name"].split("/")[-1] # Return just the name part like 'gemini-1.5-flash'
                    
        # 2. Fallback: Take any model that supports generateContent
        for m in models:
            if "generateContent" in m.get("supportedGenerationMethods", []):
                return m["name"].split("/")[-1]
                
        raise Exception("No model supports generateContent")

        # 2. Local Pattern Matching (Fallback)
        msg_lower = message.lower()
        
        # Check specific patterns
        for pattern, response in self.patterns.items():
            if re.search(pattern, msg_lower):
                return response

        # 3. Default Fallback
        return "That's an interesting topic. Could you be more specific? I can help with memory, focus, efficient learning, and motivation."
