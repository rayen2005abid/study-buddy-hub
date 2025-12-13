import requests
import json

try:
    response = requests.post(
        "http://localhost:8000/questions/",
        json={"title": "Test Question", "content": "This is a test question", "student_id": 1}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
