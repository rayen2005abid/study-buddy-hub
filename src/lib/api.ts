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

// ===== PERSONALIZATION API =====

export const startSession = async (studentId: number, sessionType: string = 'focus', subject?: string) => {
    const response = await api.post('/sessions/start', {
        student_id: studentId,
        session_type: sessionType,
        subject
    });
    return response.data;
};

export const updateSession = async (sessionId: number, data: {
    focus_score?: number;
    distractions_count?: number;
    duration_minutes?: number;
}) => {
    const response = await api.put(`/sessions/${sessionId}/update`, data);
    return response.data;
};

export const completeSession = async (sessionId: number, data: {
    focus_score: number;
    duration_minutes: number;
    distractions_count?: number;
    completed?: boolean;
}) => {
    const response = await api.post(`/sessions/${sessionId}/complete`, data);
    return response.data;
};

export const getUserStats = async (studentId: number) => {
    const response = await api.get(`/students/${studentId}/stats`);
    return response.data;
};

export const getUserInsights = async (studentId: number) => {
    const response = await api.get(`/students/${studentId}/insights`);
    return response.data;
};

export const getWeeklyData = async (studentId: number) => {
    const response = await api.get(`/students/${studentId}/weekly-data`);
    return response.data;
};

export const getUserSessions = async (studentId: number, limit: number = 20) => {
    const response = await api.get(`/students/${studentId}/sessions?limit=${limit}`);
    return response.data;
};
