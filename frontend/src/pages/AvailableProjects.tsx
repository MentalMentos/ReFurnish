// src/pages/AvailableProjects.tsx - с обработкой null
import { useState, useEffect } from 'react';
import { api } from '../api';

interface Project {
    id: string;
    title: string;
    description: string;
    budget: number;
    city: string;
    furnitureType: string;
    clientName: string;
    deadline: string;
    createdAt: string;
    status: string;
}

export default function AvailableProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        city: '',
        furniture: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.city) params.append('city', filters.city);
            if (filters.furniture) params.append('furniture', filters.furniture);

            const res = await api.get(`/projects/open?${params.toString()}`);

            // Обрабатываем null
            const data = res.data ? (Array.isArray(res.data) ? res.data : []) : [];
            setProjects(data);
            setError('');

        } catch (error: any) {
            console.error('Ошибка загрузки проектов:', error);

            if (error.response?.status === 404) {
                setProjects([]);
                setError('Сейчас нет доступных проектов');
            } else {
                setError(error.response?.data?.message || 'Ошибка загрузки проектов');
                setProjects([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const applyFilters = () => {
        setLoading(true);
        fetchProjects();
    };

    const handleRespond = async (projectId: string) => {
        const comment = prompt('Введите ваше предложение:');
        if (!comment) return;

        const price = prompt('Ваша цена (₽):');
        if (!price || isNaN(parseInt(price))) {
            alert('Введите корректную цену');
            return;
        }

        const startDate = prompt('Дата начала работ (ГГГГ-ММ-ДД):');
        if (!startDate) return;

        try {
            await api.post('/master/response', {
                projectId,
                comment,
                price: parseInt(price),
                startDate
            });
            alert('✅ Отклик успешно отправлен!');
            fetchProjects(); // Обновляем список
        } catch (error: any) {
            alert(error.response?.data?.message || 'Ошибка отправки отклика');
        }
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
                <h1 className="text-2xl font-bold text-gray-800">Доступные проекты</h1>
                <div className="text-gray-600">
                    Найдено: {projects.length} проектов
                </div>
            </div>

            {/* Фильтры */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                <h3 className="font-semibold mb-4">Фильтры проектов</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input
                            name="city"
                            placeholder="Город"
                            value={filters.city}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <input
                            name="furniture"
                            placeholder="Тип мебели"
                            value={filters.furniture}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={applyFilters}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Применить
                        </button>
                        <button
                            onClick={() => {
                                setFilters({ city: '', furniture: '' });
                                fetchProjects();
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            Сбросить
                        </button>
                    </div>
                </div>
            </div>

            {/* Состояние загрузки/ошибки */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Загрузка проектов...</p>
                </div>
            ) : error ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                        {error}
                    </h3>
                    <p className="text-yellow-600 mb-4">
                        Попробуйте изменить фильтры или зайти позже
                    </p>
                    <button
                        onClick={fetchProjects}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                        Обновить
                    </button>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Проекты не найдены
                    </h3>
                    <p className="text-gray-600 mb-4">
                        По выбранным фильтрам нет доступных проектов
                    </p>
                    <button
                        onClick={() => {
                            setFilters({ city: '', furniture: '' });
                            fetchProjects();
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Показать все проекты
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {project.title || 'Без названия'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {project.description || 'Нет описания'}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                            {project.city || 'Город не указан'}
                                        </div>
                                        <div className="font-bold text-blue-600">
                                            {project.budget ? `${project.budget.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
                                        </div>
                                        <div className="text-gray-600">
                                            {project.furnitureType || 'Тип не указан'}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            Срок: {formatDate(project.deadline)}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            Клиент: {project.clientName || 'Не указан'}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRespond(project.id)}
                                    className="ml-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 whitespace-nowrap"
                                    disabled={project.status !== 'published'}
                                >
                                    {project.status === 'published' ? '✋ Откликнуться' : 'Недоступно'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}