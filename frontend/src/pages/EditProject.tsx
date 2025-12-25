// src/pages/EditProject.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function EditProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        furnitureType: '',
        budget: '',
        deadline: '',
        city: 'Москва',
        status: 'published'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await api.get(`/project/${id}`);
            const project = res.data;

            // Преобразуем дату из формата ISO в YYYY-MM-DD
            const deadlineDate = new Date(project.deadline);
            const formattedDeadline = deadlineDate.toISOString().split('T')[0];

            setForm({
                title: project.title,
                description: project.description,
                furnitureType: project.furnitureType,
                budget: project.budget.toString(),
                deadline: formattedDeadline,
                city: project.city,
                status: project.status
            });
        } catch (error: any) {
            alert('Ошибка загрузки проекта: ' + (error.response?.data?.message || 'Проект не найден'));
            navigate('/my-projects');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/client/project/${id}`, {
                ...form,
                budget: parseInt(form.budget)
            });
            alert('Проект успешно обновлен!');
            navigate(`/project/${id}`);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Ошибка обновления проекта');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Загрузка проекта...</p>
            </div>
        );
    }

    const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'];
    const statuses = [
        { value: 'published', label: 'Опубликован' },
        { value: 'assigned', label: 'Назначен мастер' },
        { value: 'in_progress', label: 'В работе' },
        { value: 'completed', label: 'Завершен' },
        { value: 'cancelled', label: 'Отменен' }
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Редактировать проект</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2">Название проекта *</label>
                    <input
                        name="title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Описание *</label>
                    <textarea
                        name="description"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
                        value={form.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Тип мебели *</label>
                        <input
                            name="furnitureType"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={form.furnitureType}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Бюджет (₽) *</label>
                        <input
                            name="budget"
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={form.budget}
                            onChange={handleChange}
                            min="1000"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Срок выполнения *</label>
                        <input
                            name="deadline"
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={form.deadline}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Статус</label>
                        <select
                            name="status"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={form.status}
                            onChange={handleChange}
                        >
                            {statuses.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">Город *</label>
                    <select
                        name="city"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={form.city}
                        onChange={handleChange}
                    >
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Сохранить изменения
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/project/${id}`)}
                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}