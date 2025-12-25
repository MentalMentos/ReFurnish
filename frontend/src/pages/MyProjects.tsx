// src/pages/MyProjects.tsx - с обработкой null
import { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';

interface Project {
    id: string;
    title: string;
    description: string;
    furnitureType: string;
    budget: number;
    deadline: string;
    city: string;
    status: string;
    createdAt: string;
    assignedMaster?: {
        id: string;
        name: string;
    };
}

export default function MyProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await api.get('/client/projects');

            // Обрабатываем null/undefined
            if (!res.data) {
                setProjects([]);
                return;
            }

            // Если данные есть, но не массив
            const data = Array.isArray(res.data) ? res.data : [];
            setProjects(data);

        } catch (error: any) {
            console.error('Ошибка загрузки проектов:', error);

            // Если 404 или пустой ответ
            if (error.response?.status === 404 || error.response?.status === 400) {
                setProjects([]);
                setError('У вас пока нет проектов');
            } else {
                setError(error.response?.data?.message || 'Ошибка загрузки проектов');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'published': 'Опубликован',
            'assigned': 'Назначен мастер',
            'in_progress': 'В работе',
            'completed': 'Завершен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            'published': 'bg-green-100 text-green-800',
            'assigned': 'bg-blue-100 text-blue-800',
            'in_progress': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-gray-100 text-gray-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'Не указано';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('ru-RU');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Мои проекты</h2>
                <Link
                    to="/create-project"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    + Создать проект
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Загрузка проектов...</p>
                </div>
            ) : error ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-700 mb-4">{error}</p>
                    <Link
                        to="/create-project"
                        className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Создать первый проект
                    </Link>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        У вас пока нет проектов
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Создайте первый проект, чтобы начать работу с мастерами
                    </p>
                    <Link
                        to="/create-project"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                    >
                        + Создать проект
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        <Link to={`/project/${project.id}`} className="hover:text-blue-600">
                                            {project.title || 'Без названия'}
                                        </Link>
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {project.description || 'Нет описания'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                            {getStatusText(project.status)}
                                        </span>
                                        <span className="text-gray-600">{project.city || 'Город не указан'}</span>
                                        <span className="font-semibold text-blue-600">
                                            {project.budget ? `${project.budget.toLocaleString('ru-RU')} ₽` : 'Бюджет не указан'}
                                        </span>
                                        <span className="text-gray-500">
                                            Срок: {formatDate(project.deadline)}
                                        </span>
                                    </div>

                                    {project.assignedMaster && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-blue-700">
                                                <span className="font-medium">Назначен мастер:</span> {project.assignedMaster.name}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="ml-4 flex flex-col gap-2 min-w-[120px]">
                                    <Link
                                        to={`/project/${project.id}`}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                    >
                                        Подробнее
                                    </Link>
                                    {project.status === 'published' && (
                                        <Link
                                            to={`/project/${project.id}/responses`}
                                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-center"
                                        >
                                            Отклики
                                        </Link>
                                    )}
                                    <Link
                                        to={`/edit-project/${project.id}`}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-center"
                                    >
                                        Редактировать
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}