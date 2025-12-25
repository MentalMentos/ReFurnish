// src/pages/MasterResponses.tsx
import { useEffect, useState } from 'react';
import { api } from '../api';

interface Response {
    id: string;
    projectId: string;
    title: string;
    comment: string;
    price: number;
    startDate: string;
    createdAt: string;
    status: string;
}

export default function MasterResponses() {
    const [responses, setResponses] = useState<Response[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const res = await api.get('/master/responses');
            setResponses(res.data);
        } catch (error: any) {
            console.error('Ошибка загрузки откликов:', error);
            alert(error.response?.data?.message || 'Ошибка загрузки откликов');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'published': return 'Ожидает';
            case 'assigned': return 'Назначен';
            default: return status;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Мои отклики</h2>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Загрузка откликов...</p>
                </div>
            ) : responses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    У вас пока нет откликов на проекты
                </div>
            ) : (
                <div className="space-y-6">
                    {responses.map((response) => (
                        <div key={response.id} className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {response.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{response.comment}</p>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="font-bold text-blue-600">
                                            {response.price.toLocaleString('ru-RU')} ₽
                                        </div>
                                        <div className="text-gray-600">
                                            Начало работ: {formatDate(response.startDate)}
                                        </div>
                                        <div className="text-gray-500">
                                            Отправлен: {formatDate(response.createdAt)}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm ${
                                            response.status === 'assigned'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {getStatusText(response.status)}
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={`/project/${response.projectId}`}
                                    className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    К проекту
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}