// src/utils/auth.ts
export const getUserId = (): string | null => {
    // Пробуем оба варианта, потому что бэкенд может возвращать и userId и user_id
    return localStorage.getItem('user_id') || localStorage.getItem('userId');
};

export const setUserId = (id: string) => {
    localStorage.setItem('user_id', id);
    // Для совместимости можно сохранить и в userId
    localStorage.setItem('userId', id);
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user_id');
    localStorage.removeItem('userId');
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
};

export const getUserRole = (): 'client' | 'master' | null => {
    const role = localStorage.getItem('userRole');
    return role as 'client' | 'master';
};