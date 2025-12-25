// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Страницы
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import MyProjects from './pages/MyProjects';
import EditProject from './pages/EditProject';
import ProjectDetails from './pages/ProjectDetails.tsx';
import ProjectResponses from './pages/ProjectResponses';
import ClientProfile from './pages/ClientProfile.tsx';
import AvailableProjects from './pages/AvailableProjects';
import MasterResponses from './pages/MasterResponses';
import MasterProfile from './pages/MasterProfile.tsx';
import AssignedProjects from './pages/AssignedProjects';
import {JSX} from "react";

// Проверка авторизации
const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    return !!(token && role);
};

// Получение роли пользователя
const getUserRole = () => {
    return localStorage.getItem('userRole');
};

// Защищенный роут
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Роут по роли
const RoleRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
    const userRole = getUserRole();

    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
        // Показываем красивую страницу 403 вместо редиректа
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Доступ запрещен</h2>
                    <p className="text-gray-600 mb-6">
                        Эта страница доступна только для {allowedRoles.includes('client') ? 'клиентов' : 'мастеров'}
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

// Public route (только для неавторизованных)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
    return !isAuthenticated() ? children : <Navigate to="/" />;
};

// Dashboard в зависимости от роли
const RoleDashboard = () => {
    const userRole = getUserRole();

    if (userRole === 'client') {
        return <Dashboard />;
    } else if (userRole === 'master') {
        return (
            <div className="space-y-8">
                {/* Welcome Header для мастера */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-bold mb-4">
                            Добро пожаловать, мастер!
                        </h1>
                        <p className="text-lg opacity-90 mb-6">
                            Найдите интересные проекты и покажите своё мастерство
                        </p>
                    </div>
                </div>

                {/* Быстрые действия для мастера */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a
                        href="/available-projects"
                        className="group bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="mb-4 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                            Найти проекты
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">Найдите подходящие заказы</p>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                            Перейти
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>

                    <a
                        href="/my-responses"
                        className="group bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="mb-4 w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                            Мои отклики
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">Отслеживайте ваши предложения</p>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                            Перейти
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>

                    <a
                        href="/assigned-projects"
                        className="group bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="mb-4 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                            Мои проекты
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">Управляйте назначенными проектами</p>
                        <div className="flex items-center text-orange-600 text-sm font-medium">
                            Перейти
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>
                </div>

                {/* Статистика для мастера */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Ваша статистика</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    +0%
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
                            <div className="text-gray-600 text-sm">Активные отклики</div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    +0%
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
                            <div className="text-gray-600 text-sm">Назначенных проектов</div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    +0%
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-2">0 ₽</div>
                            <div className="text-gray-600 text-sm">Общий доход</div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                                    <div className="text-white text-xl">⭐</div>
                                </div>
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    +0%
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-2">0.0</div>
                            <div className="text-gray-600 text-sm">Ваш рейтинг</div>
                        </div>
                    </div>
                </div>

                {/* Как это работает для мастера */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                        Как это работает?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Найдите проект</h3>
                            <p className="text-gray-600">
                                Выберите проект, соответствующий вашему опыту и специализации
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Отправьте предложение</h3>
                            <p className="text-gray-600">
                                Предложите свою цену и условия выполнения работы
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Выполните работу</h3>
                            <p className="text-gray-600">
                                Создайте качественную мебель и получите оплату
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <Dashboard />;
};

export default function App() {
    const handleLogin = () => {
        // Обновляем состояние для триггера ререндера
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* Публичные роуты */}
                <Route path="/login" element={
                    <Layout requireAuth={false}>
                        <PublicRoute>
                            <Login onLogin={handleLogin} />
                        </PublicRoute>
                    </Layout>
                } />

                <Route path="/register" element={
                    <Layout requireAuth={false}>
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    </Layout>
                } />

                {/* Главная страница */}
                <Route path="/" element={
                    <Layout>
                        <PrivateRoute>
                            <RoleDashboard />
                        </PrivateRoute>
                    </Layout>
                } />

                {/* Общие защищенные роуты (для всех авторизованных) */}
                <Route path="/project/:id" element={
                    <Layout>
                        <PrivateRoute>
                            <ProjectDetails />
                        </PrivateRoute>
                    </Layout>
                } />

                {/* Клиентские роуты */}
                <Route path="/create-project" element={
                    <Layout>
                        <RoleRoute allowedRoles={['client']}>
                            <CreateProject />
                        </RoleRoute>
                    </Layout>
                } />

                <Route path="/my-projects" element={
                    <Layout>
                        <RoleRoute allowedRoles={['client']}>
                            <MyProjects />
                        </RoleRoute>
                    </Layout>
                } />

                <Route path="/edit-project/:id" element={
                    <Layout>
                        <RoleRoute allowedRoles={['client']}>
                            <EditProject />
                        </RoleRoute>
                    </Layout>
                } />

                <Route path="/project/:id/responses" element={
                    <Layout>
                        <RoleRoute allowedRoles={['client']}>
                            <ProjectResponses />
                        </RoleRoute>
                    </Layout>
                } />

                <Route path="/client/profile" element={
                    <Layout>
                        <RoleRoute allowedRoles={['client']}>
                            <ClientProfile />
                        </RoleRoute>
                    </Layout>
                } />

                {/* Мастерские роуты */}
                <Route path="/available-projects" element={
                    <Layout>
                        <RoleRoute allowedRoles={['master']}>
                            <AvailableProjects />
                        </RoleRoute>
                    </Layout>
                } />

                <Route path="/my-responses" element={
                    <Layout>
                        <RoleRoute allowedRoles={['master']}>
                            <MasterResponses />
                        </RoleRoute>
                    </Layout>
                } />

                <Route path="/master/profile" element={
                    <Layout>
                        <RoleRoute allowedRoles={['master']}>
                            <MasterProfile />
                        </RoleRoute>
                    </Layout>
                } />

                <Route path="/assigned-projects" element={
                    <Layout>
                        <RoleRoute allowedRoles={['master']}>
                            <AssignedProjects />
                        </RoleRoute>
                    </Layout>
                } />

                {/* 404 - показываем красивую страницу */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Страница не найдена</h2>
                            <p className="text-gray-600 mb-6">
                                Извините, мы не можем найти страницу, которую вы ищете
                            </p>
                            <div className="space-y-3">
                                <a
                                    href="/"
                                    className="block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                                >
                                    На главную
                                </a>
                                <button
                                    onClick={() => window.history.back()}
                                    className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                                >
                                    Назад
                                </button>
                            </div>
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}