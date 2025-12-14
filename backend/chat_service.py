import re
import os
import requests
import json

class ChatService:
    def __init__(self):
        self.patterns = {
            # Memory and Retention Techniques
            r"memory|remember|forget|retention": "Memory can be improved using **Spaced Repetition** and **Active Recall**. Try breaking your study sessions into smaller chunks and testing yourself frequently. Review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks.",
            
            r"feynman|explain|teach|simplif": "The **Feynman Technique** is powerful: 1) Choose a concept. 2) Explain it in simple terms as if teaching a child. 3) Identify gaps in your understanding. 4) Review and simplify further. Teaching forces deep understanding!",
            
            r"retrieval practice|testing|quiz": "**Retrieval Practice** is one of the most effective study methods! Instead of re-reading, close your notes and try to recall everything. Use flashcards, practice tests, or just write down what you remember. The struggle to recall strengthens memory.",
            
            r"spaced repetition|anki|flashcard": "**Spaced Repetition** leverages the forgetting curve. Review material right before you're about to forget it. Use apps like Anki or create a schedule: Day 1, Day 3, Week 1, Week 2, Month 1. This creates long-term retention with less total study time.",
            
            r"elaborative|elaboration|why|how": "**Elaborative Interrogation** means asking 'why' and 'how' questions. Don't just memorize facts—understand the reasoning behind them. Ask: 'Why is this true?' 'How does this connect to what I already know?' This creates deeper, more durable learning.",
            
            r"dual coding|visual|diagram|image": "**Dual Coding** combines words with visuals. Draw diagrams, create mind maps, or use imagery alongside your notes. Your brain processes visual and verbal information differently, so using both creates stronger memory traces.",
            
            r"concrete example|real.world|application": "Use **Concrete Examples** to understand abstract concepts. For every theory or formula, find a real-world application. Ask yourself: 'When would I use this?' 'What's a practical example?' This makes learning meaningful and memorable.",
            
            r"interleaving|interleave|mix|switch": "**Interleaving** means mixing different topics or problem types in one session, rather than blocking (doing all of one type). Example: Instead of 20 algebra problems, do 5 algebra, 5 geometry, 5 calculus, repeat. It's harder but creates better long-term learning and transfer.",
            
            r"self.explanation|explain to myself": "**Self-Explanation** is talking through your reasoning. As you study, pause and explain to yourself: 'This step works because...' 'This connects to... because...' Verbalizing your thought process reveals gaps and strengthens understanding.",
            
            # Focus and Concentration
            r"focus|concentrat|distract|attention": "To improve focus: 1) **Remove distractions** (phone away, block sites). 2) Use our **Focus Timer** (Pomodoro: 25min work, 5min break). 3) Try **white noise or binaural beats**. 4) Keep a 'distraction list' to write down intrusive thoughts and deal with them later.",
            
            r"pomodoro|timer|break": "The **Pomodoro Technique**: Work for 25 minutes with full focus, then take a 5-minute break. After 4 pomodoros, take a longer 15-30 minute break. This prevents burnout and maintains high concentration. Use our Focus Timer!",
            
            r"deep work|flow|immersion": "**Deep Work** requires: 1) Eliminate all distractions. 2) Set a specific, challenging goal. 3) Time-box your session (90-120 min max). 4) Take real breaks between sessions. Quality > Quantity. One hour of deep focus beats three hours of shallow work.",
            
            # Motivation and Mindset
            r"motivat|tired|bore|uninspired": "Motivation follows action, not the other way around. Don't wait to feel motivated—**start with just 5 minutes**. Use the **2-Minute Rule**: if it takes less than 2 minutes, do it now. Build momentum with small wins. Motivation will come once you're in motion.",
            
            r"procrastinat|lazy|start|avoid": "Procrastination often comes from: 1) **Lack of clarity** (break tasks into tiny steps). 2) **Fear of failure** (focus on learning, not perfection). 3) **Task seems too big** (just do 5 minutes). Try the **2-Minute Rule** or **Pomodoro Technique** to overcome initial resistance.",
            
            r"growth mindset|failure|mistake": "Embrace a **Growth Mindset**: Mistakes and struggles are where learning happens. When you find something difficult, say 'I can't do this *yet*.' View challenges as opportunities to grow, not signs of inadequacy. Your brain literally grows when you struggle!",
            
            r"goal|plan|objective": "Set **SMART goals**: Specific, Measurable, Achievable, Relevant, Time-bound. Instead of 'study more,' try 'complete 3 practice problems and review 2 chapters by 5 PM today.' Break big goals into daily actions. Track your progress visually.",
            
            # Study Planning and Organization
            r"plan|schedul|organiz|routine": "A good study plan is **realistic and specific**. Block time for *specific tasks*, not just 'studying.' Use **time-blocking**: assign each hour a purpose. Prioritize your **hardest subjects when you're most alert** (usually morning). Leave buffer time for the unexpected.",
            
            r"priorit|important|urgent": "Use the **Eisenhower Matrix**: 1) Urgent + Important = Do first. 2) Important + Not Urgent = Schedule it. 3) Urgent + Not Important = Delegate/minimize. 4) Neither = Eliminate. Focus on Important tasks before they become Urgent!",
            
            r"study environment|workspace|setup": "Optimize your **study environment**: 1) Good lighting (natural light best). 2) Comfortable temperature (slightly cool is ideal). 3) Organized desk (clear space = clear mind). 4) Dedicated study spot (trains your brain). 5) Minimal visual distractions. Your environment shapes your focus!",
            
            r"note.taking|notes|cornell": "Effective note-taking: Try the **Cornell Method** (divide page: notes, cues, summary) or **Mind Mapping** for visual learners. Don't transcribe—**process and summarize** in your own words. Review and reorganize notes within 24 hours for best retention.",
            
            # Exam Preparation
            r"exam|test|quiz|assessment": "For exams: 1) **Practice with past papers** under timed conditions—this is the #1 predictor of success. 2) **Identify your weak areas** and focus there. 3) **Simulate exam pressure** to reduce anxiety. 4) **Sleep well** the night before (all-nighters hurt performance). 5) Review your mistakes thoroughly.",
            
            r"test anxiety|exam stress|nervous": "Combat **test anxiety**: 1) **Preparation** is the best anxiety reducer. 2) Practice **4-7-8 breathing**: Inhale 4s, hold 7s, exhale 8s. 3) **Reframe anxiety as excitement** (same physical symptoms!). 4) **Arrive early** to settle in. 5) **Start with easy questions** to build confidence. You've got this!",
            
            # Cognitive Load and Learning Science
            r"cognitive load|overwhelm|too much": "**Cognitive Load Theory**: Your working memory is limited (7±2 items). Reduce load by: 1) **Chunking** information into groups. 2) **Using schemas** (organized knowledge structures). 3) **Eliminating distractions**. 4) **Building on prior knowledge**. Don't try to learn everything at once!",
            
            r"metacognition|thinking about thinking|self.aware": "**Metacognition** is thinking about your thinking. Ask yourself: 'Do I really understand this?' 'What's my learning strategy?' 'Is this working?' Self-aware learners adjust their approach. Use **self-testing** to calibrate your confidence vs. actual knowledge.",
            
            # General Greetings and Help
            r"hello|hi|hey|greetings": "Hello! I'm your AI Study Coach, powered by learning science. I can help with memory techniques, focus strategies, exam prep, motivation, and effective study methods. What are you working on today?",
            
            r"help|what can you|capabilities": "I can help with: **Memory techniques** (Feynman, Spaced Repetition, Retrieval Practice), **Focus strategies** (Pomodoro, Deep Work), **Motivation** (Growth Mindset, Goal Setting), **Study planning**, **Exam preparation**, **Cognitive load management**, and more. Just ask!",
            
            r"thank|thanks|appreciate": "You're very welcome! Keep up the great work. Remember: effective studying is about quality, not just quantity. You've got this! 🎯",
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
        return "That's an interesting question! I specialize in evidence-based study techniques. I can help with: **Memory** (Spaced Repetition, Feynman Technique), **Focus** (Pomodoro, Deep Work), **Exam Prep**, **Motivation**, **Study Planning**, and more. Could you be more specific about what you'd like to learn?"

    def _call_openai(self, message: str, api_key: str) -> str:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system", 
                    "content": """You are an expert AI Study Coach specializing in evidence-based learning science. Your knowledge includes:

**Memory Techniques**: Spaced Repetition, Active Recall, Feynman Technique, Dual Coding, Elaborative Interrogation, Retrieval Practice
**Focus Strategies**: Pomodoro Technique, Deep Work, Flow State, Attention Management
**Learning Methods**: Interleaving, Self-Explanation, Concrete Examples, Metacognition
**Study Skills**: Note-taking (Cornell Method), Time Management, Goal Setting, Environment Optimization
**Exam Preparation**: Practice Testing, Anxiety Management, Strategic Review

**Your approach**:
1. Give specific, actionable advice
2. Explain the 'why' behind techniques (cite learning science when relevant)
3. Be encouraging and motivating
4. Keep responses concise but comprehensive (2-4 sentences or a short list)
5. Use examples when helpful
6. Acknowledge when students are struggling and provide support

Be warm, knowledgeable, and genuinely helpful. Your goal is to empower students with effective learning strategies."""
                },
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
        
        system_prompt = """You are an expert AI Study Coach specializing in evidence-based learning science. Your knowledge includes:

**Memory Techniques**: Spaced Repetition, Active Recall, Feynman Technique, Dual Coding, Elaborative Interrogation, Retrieval Practice
**Focus Strategies**: Pomodoro Technique, Deep Work, Flow State, Attention Management
**Learning Methods**: Interleaving, Self-Explanation, Concrete Examples, Metacognition
**Study Skills**: Note-taking (Cornell Method), Time Management, Goal Setting, Environment Optimization
**Exam Preparation**: Practice Testing, Anxiety Management, Strategic Review

**Your approach**:
1. Give specific, actionable advice
2. Explain the 'why' behind techniques (cite learning science when relevant)
3. Be encouraging and motivating
4. Keep responses concise but comprehensive (2-4 sentences or a short list)
5. Use examples when helpful
6. Acknowledge when students are struggling and provide support

Be warm, knowledgeable, and genuinely helpful. Your goal is to empower students with effective learning strategies.

Student question: """
        
        data = {
            "contents": [{
                "parts": [{"text": system_prompt + message}]
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
