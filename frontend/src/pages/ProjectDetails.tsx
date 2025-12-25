// src/pages/ProjectDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

interface ProjectDetails {
    id: string;
    title: string;
    description: string;
    furnitureType: string;
    budget: number;
    deadline: string;
    city: string;
    status: string;
    createdAt: string;
    clientName: string;
    masterName?: string;
    masterCity?: string;
}

export default function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/project/${id}`);
            setProject(res.data);
        } catch (err: any) {
            console.error('Ошибка загрузки проекта:', err);
            setError(err.response?.data?.message || 'Проект не найден');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Возвращаем исходную строку, если дата некорректна
            }
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'published': return 'Опубликован';
            case 'assigned': return 'Назначен мастер';
            case 'in_progress': return 'В работе';
            case 'completed': return 'Завершен';
            case 'cancelled': return 'Отменен';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'assigned': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
            try {
                // Если у тебя есть endpoint для удаления, добавь его
                // await api.delete(`/client/project/${id}`);
                alert('Функция удаления пока не реализована');
                // navigate('/my-projects');
            } catch (err: any) {
                alert(err.response?.data?.message || 'Ошибка удаления проекта');
            }
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Загрузка проекта...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Ошибка</h2>
                    <p className="text-red-700 mb-4">{error || 'Проект не найден'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Назад
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Шапка проекта */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                            <div className="flex items-center flex-wrap gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                                    {getStatusText(project.status)}
                                </span>
                                <span className="bg-white/20 px-3 py-1 rounded-full">
                                    {project.city}
                                </span>
                                <span className="text-xl font-bold">
                                    {project.budget.toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 md:mt-0 flex gap-3">
                            {userRole === 'client' && project.status === 'published' && (
                                <Link
                                    to={`/project/${id}/responses`}
                                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Посмотреть отклики
                                </Link>
                            )}

                            {userRole === 'client' && (
                                <Link
                                    to={`/edit-project/${id}`}
                                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                                >
                                    Редактировать
                                </Link>
                            )}

                            {userRole === 'master' && project.status === 'published' && (
                                <button
                                    onClick={() => {
                                        const comment = prompt('Введите ваше предложение:');
                                        const price = prompt('Ваша цена (₽):');
                                        const startDate = prompt('Дата начала работ (ГГГГ-ММ-ДД):');

                                        if (comment && price && startDate) {
                                            api.post('/master/response', {
                                                projectId: id,
                                                comment,
                                                price: parseInt(price),
                                                startDate
                                            })
                                            .then(() => {
                                                alert('Отклик отправлен!');
                                                fetchProject();
                                            })
                                            .catch(err => {
                                                alert(err.response?.data?.message || 'Ошибка отправки отклика');
                                            });
                                        }
                                    }}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                                >
                                    Откликнуться
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Основной контент */}
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Левая колонка - детали проекта */}
                        <div className="lg:col-span-2">
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Описание проекта</h2>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-4">Детали проекта</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Тип мебели:</span>
                                            <span className="font-medium">{project.furnitureType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Бюджет:</span>
                                            <span className="font-bold text-blue-600">
                                                {project.budget.toLocaleString('ru-RU')} ₽
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Срок выполнения:</span>
                                            <span className="font-medium">{formatDate(project.deadline)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Город:</span>
                                            <span className="font-medium">{project.city}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Статус:</span>
                                            <span className={`font-medium ${getStatusColor(project.status)} px-2 py-1 rounded`}>
                                                {getStatusText(project.status)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Создан:</span>
                                            <span className="font-medium">{formatDateTime(project.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-4">Контактная информация</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-gray-600 text-sm mb-1">Клиент</div>
                                            <div className="font-medium">{project.clientName}</div>
                                        </div>

                                        {project.masterName && (
                                            <div>
                                                <div className="text-gray-600 text-sm mb-1">Исполнитель</div>
                                                <div className="font-medium">{project.masterName}</div>
                                                {project.masterCity && (
                                                    <div className="text-gray-600 text-sm mt-1">
                                                        Город: {project.masterCity}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {userRole === 'master' && project.status === 'published' && (
                                            <button
                                                onClick={() => {
                                                    const phone = prompt('Введите номер телефона для связи:');
                                                    if (phone) {
                                                        window.location.href = `tel:${phone}`;
                                                    }
                                                }}
                                                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                📞 Связаться с клиентом
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Правая колонка - действия и информация */}
                        <div className="space-y-6">
                            {/* Статус и действия */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Управление проектом</h3>

                                {userRole === 'client' ? (
                                    <div className="space-y-3">
                                        {project.status === 'published' && (
                                            <>
                                                <Link
                                                    to={`/project/${id}/responses`}
                                                    className="block w-full text-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                >
                                                    👁️ Посмотреть отклики
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        const newStatus = prompt('Изменить статус (published/assigned/in_progress/completed/cancelled):');
                                                        if (newStatus && ['published', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(newStatus)) {
                                                            api.put(`/client/project/${id}`, { status: newStatus })
                                                                .then(() => {
                                                                    alert('Статус обновлен!');
                                                                    fetchProject();
                                                                })
                                                                .catch(err => {
                                                                    alert(err.response?.data?.message || 'Ошибка обновления статуса');
                                                                });
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    Изменить статус
                                                </button>
                                            </>
                                        )}

                                        <Link
                                            to={`/edit-project/${id}`}
                                            className="block w-full text-center px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                        >
                                            ✏️ Редактировать проект
                                        </Link>

                                        <button
                                            onClick={handleDelete}
                                            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            🗑️ Удалить проект
                                        </button>
                                    </div>
                                ) : userRole === 'master' && project.status === 'published' ? (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                const comment = prompt('Введите ваше предложение:');
                                                const price = prompt('Ваша цена (₽):');
                                                const startDate = prompt('Дата начала работ (ГГГГ-ММ-ДД):');

                                                if (comment && price && startDate) {
                                                    api.post('/master/response', {
                                                        projectId: id,
                                                        comment,
                                                        price: parseInt(price),
                                                        startDate
                                                    })
                                                    .then(() => {
                                                        alert('Отклик отправлен!');
                                                        fetchProject();
                                                    })
                                                    .catch(err => {
                                                        alert(err.response?.data?.message || 'Ошибка отправки отклика');
                                                    });
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                                        >
                                            ✋ Откликнуться на проект
                                        </button>

                                        <button
                                            onClick={() => {
                                                window.location.href = `tel:+79213946509`;
                                            }}
                                            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            📞 Позвонить клиенту
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center py-4">
                                        Проект {project.status === 'assigned' ? 'уже назначен мастеру' : 'недоступен для откликов'}
                                    </p>
                                )}
                            </div>

                            {/* Быстрые ссылки */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="font-semibold text-blue-800 mb-4">Быстрые действия</h3>
                                <div className="space-y-3">
                                    <Link
                                        to="/"
                                        className="flex items-center text-blue-700 hover:text-blue-800"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        На главную
                                    </Link>

                                    {userRole === 'client' && (
                                        <Link
                                            to="/my-projects"
                                            className="flex items-center text-blue-700 hover:text-blue-800"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Все мои проекты
                                        </Link>
                                    )}

                                    {userRole === 'master' && (
                                        <Link
                                            to="/available-projects"
                                            className="flex items-center text-blue-700 hover:text-blue-800"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Поиск проектов
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}