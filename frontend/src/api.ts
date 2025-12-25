// src/api.ts - с расширенной отладкой
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для логирования запросов
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Детальное логирование
    console.group('📤 Отправка запроса');
    console.log('URL:', config.url);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.groupEnd();

    return config;
});

// Интерцептор для логирования ответов
api.interceptors.response.use(
    (response) => {
        console.group('📥 Получен ответ');
        console.log('URL:', response.config.url);
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.groupEnd();
        return response;
    },
    (error) => {
        console.group('❌ Ошибка запроса');
        console.log('URL:', error.config?.url);
        console.log('Method:', error.config?.method?.toUpperCase());
        console.log('Status:', error.response?.status);
        console.log('Error Message:', error.message);
        console.log('Response Data:', error.response?.data);
        console.log('Request Data:', error.config?.data);
        console.groupEnd();

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user_id');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export { api };

// Добавь в конец api.ts
export const projectApi = {
    // Получить детали проекта
    getProject: (id: string) => api.get(`/project/${id}`),

    // Создать проект (клиент)
    createProject: (data: any) => api.post('/client/project', data),

    // Редактировать проект (клиент)
    updateProject: (id: string, data: any) => api.put(`/client/project/${id}`, data),

    // Удалить проект (если есть endpoint)
    deleteProject: (id: string) => api.delete(`/client/project/${id}`),

    // Откликнуться на проект (мастер)
    respondToProject: (data: any) => api.post('/master/response', data),

    // Получить отклики на проект (клиент)
    getProjectResponses: (id: string) => api.get(`/client/project/${id}/responses`),

    // Назначить мастера (клиент)
    assignMaster: (projectId: string, masterId: string) =>
        api.post(`/client/project/${projectId}/assign`, { masterId })
};