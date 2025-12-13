import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const createStudent = async (name: string, email: string) => {
    const response = await api.post('/students/', { name, email, password: 'password123' });
    return response.data;
};

export const getStudent = async (studentId: number) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
};

export const getQuestions = async () => {
    const response = await api.get('/questions/');
    return response.data;
};

export const createQuestion = async (title: string, content: string, studentId: number) => {
    const response = await api.post('/questions/', { title, content, student_id: studentId });
    return response.data;
};

export const createAnswer = async (content: string, questionId: number, studentId: number) => {
    const response = await api.post('/answers/', { content, question_id: questionId, student_id: studentId });
    return response.data;
};

export const getPreferences = async (studentId: number) => {
    const response = await api.get(`/students/${studentId}/preferences`);
    return response.data;
};

export const updatePreferences = async (studentId: number, preferences: any) => {
    const response = await api.put(`/students/${studentId}/preferences`, preferences);
    return response.data;
};

export const chatWithCoach = async (message: string, apiKey?: string) => {
    const response = await api.post('/chat', { message, api_key: apiKey });
    return response.data;
};
