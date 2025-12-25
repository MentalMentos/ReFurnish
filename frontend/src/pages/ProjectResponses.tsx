// src/pages/ProjectResponses.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import {
    User,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Sparkles
} from 'lucide-react';

interface Response {
    id: string;
    price: number;
    createdAt: string;
    masterEmail: string;
    masterPhone: string;
    comment?: string;
    startDate?: string;
    masterName?: string;
}

export default function ProjectResponses() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [responses, setResponses] = useState<Response[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [projectTitle, setProjectTitle] = useState('');

    useEffect(() => {
        if (id) {
            fetchResponses();
            fetchProjectTitle();
        }
    }, [id]);

    const fetchProjectTitle = async () => {
        try {
            const res = await api.get(`/project/${id}`);
            if (res.data && res.data.title) {
                setProjectTitle(res.data.title);
            }
        } catch (err) {
            console.error('Не удалось загрузить название проекта:', err);
        }
    };

    const fetchResponses = async () => {
        try {
            setLoading(true);
            setError('');

            // Попробуем разные эндпоинты
            let endpoint = `/client/project/${id}/responses`;
            console.log('Загружаем отклики с эндпоинта:', endpoint);

            const res = await api.get(endpoint);
            console.log('Ответ от сервера:', res.data);

            if (res.data && Array.isArray(res.data)) {
                setResponses(res.data);
            } else if (res.data && typeof res.data === 'object') {
                // Если ответ - объект, попробуем извлечь массив
                const data = res.data;
                if (data.responses && Array.isArray(data.responses)) {
                    setResponses(data.responses);
                } else if (data.data && Array.isArray(data.data)) {
                    setResponses(data.data);
                } else {
                    setResponses([]);
                }
            } else {
                setResponses([]);
            }

        } catch (error: any) {
            console.error('Полная ошибка загрузки откликов:', error);

            if (error.response?.status === 404) {
                setError('Для этого проекта пока нет откликов от мастеров');
            } else if (error.response?.status === 403) {
                setError('У вас нет доступа к откликам на этот проект');
            } else {
                setError(error.response?.data?.message || 'Ошибка загрузки откликов. Попробуйте позже.');
            }
            setResponses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (masterId: string, masterName?: string) => {
        if (!window.confirm(`Назначить мастера ${masterName || ''} на этот проект?`)) {
            return;
        }

        try {
            const res = await api.post(`/client/project/${id}/assign`, {
                masterId,
                projectId: id
            });

            if (res.data && res.data.success) {
                alert(`✅ Мастер ${masterName || ''} успешно назначен на проект!`);
                setTimeout(() => {
                    navigate(`/project/${id}`);
                }, 1500);
            } else {
                alert(res.data?.message || 'Мастер назначен успешно');
                setTimeout(() => {
                    navigate(`/project/${id}`);
                }, 1500);
            }
        } catch (error: any) {
            console.error('Ошибка назначения мастера:', error);
            alert(error.response?.data?.message || 'Ошибка назначения мастера. Попробуйте позже.');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
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

    const formatPrice = (price: number) => {
        return price.toLocaleString('ru-RU') + ' ₽';
    };

    return (
        <div className="w-full">
            {/* Заголовок и кнопка назад */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(`/project/${id}`)}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Назад к проекту
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Отклики на проект
                        </h1>
                        {projectTitle && (
                            <p className="text-gray-600 text-lg">
                                {projectTitle}
                            </p>
                        )}
                        <div className="text-sm text-gray-500 mt-2">
                            ID проекта: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span>
                        </div>
                    </div>

                    <button
                        onClick={fetchResponses}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        <span>Обновить</span>
                    </button>
                </div>
            </div>

            {/* Статистика */}
            {!loading && responses.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-6 mb-8">
                    <div className="flex flex-wrap items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Статистика откликов
                            </h3>
                            <div className="flex items-center space-x-6">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {responses.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Всего откликов</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatPrice(responses.reduce((min, r) => Math.min(min, r.price), Infinity))}
                                    </div>
                                    <div className="text-sm text-gray-600">Минимальная цена</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {formatPrice(responses.reduce((max, r) => Math.max(max, r.price), 0))}
                                    </div>
                                    <div className="text-sm text-gray-600">Максимальная цена</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <div className="text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-xl">
                                Выберите лучшего мастера для вашего проекта
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Состояние загрузки */}
            {loading ? (
                <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        Загружаем отклики...
                    </h3>
                    <p className="text-gray-600">
                        Ищем предложения от мастеров для вашего проекта
                    </p>
                </div>
            ) : error ? (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
                        <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        {error.includes('нет откликов') ? 'Откликов пока нет' : 'Ошибка загрузки'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {error.includes('нет откликов')
                            ? 'Мастера ещё не откликнулись на ваш проект. Попробуйте зайти позже или изменить условия проекта.'
                            : error
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={fetchResponses}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                            Попробовать снова
                        </button>
                        <button
                            onClick={() => navigate(`/project/${id}`)}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        >
                            Вернуться к проекту
                        </button>
                    </div>
                </div>
            ) : responses.length === 0 ? (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50/50 border border-blue-200 rounded-2xl p-12 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">
                        Откликов пока нет
                    </h3>
                    <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
                        Мастера ещё не откликнулись на ваш проект. Обычно первые отклики появляются в течение 24 часов.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
                        <div className="bg-white/80 rounded-xl p-5">
                            <div className="text-2xl mb-3">📢</div>
                            <h4 className="font-semibold text-gray-800 mb-2">Расскажите подробнее</h4>
                            <p className="text-sm text-gray-600">Добавьте фото и детали в описание проекта</p>
                        </div>
                        <div className="bg-white/80 rounded-xl p-5">
                            <div className="text-2xl mb-3">💰</div>
                            <h4 className="font-semibold text-gray-800 mb-2">Укажите бюджет</h4>
                            <p className="text-sm text-gray-600">Чёткий бюджет привлекает больше мастеров</p>
                        </div>
                        <div className="bg-white/80 rounded-xl p-5">
                            <div className="text-2xl mb-3">🔄</div>
                            <h4 className="font-semibold text-gray-800 mb-2">Обновите проект</h4>
                            <p className="text-sm text-gray-600">Редактирование поднимает проект в поиске</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate(`/edit-project/${id}`)}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            ✏️ Редактировать проект
                        </button>
                        <button
                            onClick={() => navigate('/available-projects')}
                            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                        >
                            🔍 Посмотреть других мастеров
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Предложения от мастеров ({responses.length})
                            </h2>
                            <div className="text-sm text-gray-500">
                                Отсортировано по дате
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {responses.map((response) => (
                                <div key={response.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {response.masterName || 'Мастер'}
                                                    </h3>
                                                    <div className="text-sm text-gray-500">
                                                        Предложение от {formatDate(response.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600 mb-2">
                                                {formatPrice(response.price)}
                                            </div>
                                            <div className="text-sm text-gray-500">Предложенная цена</div>
                                        </div>
                                    </div>

                                    {/* Детали предложения */}
                                    <div className="space-y-4 mb-6">
                                        {response.comment && (
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 mb-2">Комментарий мастера:</div>
                                                <div className="bg-gray-50/80 rounded-lg p-4 text-gray-700">
                                                    {response.comment}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center text-gray-600">
                                                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate" title={response.masterEmail}>
                                                    {response.masterEmail}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span>{response.masterPhone}</span>
                                            </div>
                                            {response.startDate && (
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    <span>Начало: {formatDate(response.startDate)}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center text-gray-600">
                                                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span>Готов обсудить цену</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Кнопки действий */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                                        <button
                                            onClick={() => handleAssign(response.id, response.masterName)}
                                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all group-hover:shadow-lg"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Назначить мастера</span>
                                        </button>
                                        <a
                                            href={`tel:${response.masterPhone}`}
                                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span>Позвонить</span>
                                        </a>
                                        <a
                                            href={`mailto:${response.masterEmail}`}
                                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
                                        >
                                            <Mail className="w-5 h-5" />
                                            <span>Написать</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Советы по выбору */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            Как выбрать мастера?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/80 rounded-xl p-4">
                                <div className="text-green-600 text-lg font-bold mb-2">1. Цена и качество</div>
                                <p className="text-sm text-gray-600">Сравните предложения и отзывы о мастерах</p>
                            </div>
                            <div className="bg-white/80 rounded-xl p-4">
                                <div className="text-green-600 text-lg font-bold mb-2">2. Сроки выполнения</div>
                                <p className="text-sm text-gray-600">Оцените реалистичность предложенных сроков</p>
                            </div>
                            <div className="bg-white/80 rounded-xl p-4">
                                <div className="text-green-600 text-lg font-bold mb-2">3. Коммуникация</div>
                                <p className="text-sm text-gray-600">Позвоните мастеру, чтобы обсудить детали</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}