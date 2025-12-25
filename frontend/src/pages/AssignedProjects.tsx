// src/pages/AssignedProjects.tsx
import { useEffect, useState } from 'react';
import { api } from '../api';

interface Project {
    id: string;
    title: string;
    description: string;
    budget: number;
    city: string;
    furnitureType: string;
    deadline: string;
    status: string;
    clientName: string;
    clientPhone: string;
}

export default function AssignedProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/master/assigned-projects');
            setProjects(res.data);
        } catch (error: any) {
            console.error('Ошибка загрузки проектов:', error);
            alert(error.response?.data?.message || 'Ошибка загрузки проектов');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Мои назначенные проекты</h2>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Загрузка проектов...</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    У вас пока нет назначенных проектов
                </div>
            ) : (
                <div className="space-y-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {project.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{project.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="font-bold text-blue-600 text-lg">
                                                {project.budget.toLocaleString('ru-RU')} ₽
                                            </div>
                                            <div className="text-gray-600">{project.city}</div>
                                            <div className="text-gray-600">{project.furnitureType}</div>
                                        </div>

                                        <div>
                                            <div className="text-gray-700">
                                                <span className="font-medium">Срок:</span> {formatDate(project.deadline)}
                                            </div>
                                            <div className="text-gray-700">
                                                <span className="font-medium">Клиент:</span> {project.clientName}
                                            </div>
                                            <div className="text-gray-700">
                                                <span className="font-medium">Телефон:</span> {project.clientPhone}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-4 flex flex-col gap-2">
                                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                        Обновить статус
                                    </button>
                                    <a
                                        href={`tel:${project.clientPhone}`}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
                                    >
                                        Позвонить
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}