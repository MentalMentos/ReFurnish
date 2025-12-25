// src/pages/CreateProject.tsx
import { useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    DollarSign,
    Calendar,
    MapPin,
    Package,
    ArrowRight,
    Sparkles
} from 'lucide-react';

export default function CreateProject() {
    const [form, setForm] = useState({
        title: '',
        description: '',
        furnitureType: '',
        budget: '',
        deadline: '',
        city: 'Москва'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const cities = [
        'Москва', 'Санкт-Петербург', 'Новосибирск',
        'Екатеринбург', 'Казань', 'Нижний Новгород',
        'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону'
    ];

    const furnitureTypes = [
        'Кухня', 'Шкаф', 'Стол', 'Стул', 'Диван', 'Кровать',
        'Комод', 'Тумба', 'Полка', 'Стеллаж', 'Другое'
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dateParts = form.deadline.split('-');
            const formattedDeadline = `${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`;

            await api.post('/client/project', {
                ...form,
                budget: parseInt(form.budget) || 0,
                deadline: formattedDeadline,
            });

            // Успех - показываем красивый алерт
            const successModal = document.createElement('div');
            successModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
            successModal.innerHTML = `
                <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                    <div class="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Успешно!</h3>
                    <p class="text-gray-600 mb-6">Проект создан и уже доступен мастерам</p>
                    <button onclick="this.parentElement.parentElement.remove(); window.location.href='/my-projects'" 
                            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                        Перейти к проектам
                    </button>
                </div>
            `;
            document.body.appendChild(successModal);

        } catch (error: any) {
            console.error('Ошибка создания проекта:', error);

            // Красивый алерт об ошибке
            const errorModal = document.createElement('div');
            errorModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
            errorModal.innerHTML = `
                <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                    <div class="w-20 h-20 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">Ошибка</h3>
                    <p class="text-gray-600 mb-4">${error.response?.data?.message || 'Не удалось создать проект'}</p>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                        Закрыть
                    </button>
                </div>
            `;
            document.body.appendChild(errorModal);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Создайте новый проект
                </h1>
                <p className="text-lg text-gray-600">
                    Опишите вашу мечту, и мы найдем лучшего мастера для её воплощения
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid lg:grid-cols-3">
                    {/* Левая панель - шаги */}
                    <div className="lg:col-span-1 bg-gradient-to-b from-blue-50 to-purple-50 p-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Шаги создания</h2>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">Основная информация</h3>
                                    <p className="text-sm text-gray-600 mt-1">Название и описание</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">Детали проекта</h3>
                                    <p className="text-sm text-gray-600 mt-1">Тип, бюджет, сроки</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">Публикация</h3>
                                    <p className="text-sm text-gray-600 mt-1">Отправка мастерам</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая панель - форма */}
                    <div className="lg:col-span-2 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Название */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-3">
                                    Название проекта *
                                </label>
                                <input
                                    name="title"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Например: Современный кухонный гарнитур из дуба"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Описание */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-3">
                                    Подробное описание *
                                </label>
                                <textarea
                                    name="description"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-40 resize-none transition-all"
                                    placeholder="Опишите детали: размеры, материалы, стиль, особые пожелания..."
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Grid: Тип мебели и Бюджет */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-3">
                                        <Package className="inline w-4 h-4 mr-2" />
                                        Тип мебели *
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="furnitureType"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all"
                                            value={form.furnitureType}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Выберите тип</option>
                                            {furnitureTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-3">
                                        <DollarSign className="inline w-4 h-4 mr-2" />
                                        Бюджет (₽) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="budget"
                                            type="number"
                                            className="w-full px-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="50000"
                                            value={form.budget}
                                            onChange={handleChange}
                                            min="1000"
                                            required
                                        />
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            ₽
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grid: Срок и Город */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-3">
                                        <Calendar className="inline w-4 h-4 mr-2" />
                                        Срок выполнения *
                                    </label>
                                    <input
                                        name="deadline"
                                        type="date"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={form.deadline}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-3">
                                        <MapPin className="inline w-4 h-4 mr-2" />
                                        Город *
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="city"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all"
                                            value={form.city}
                                            onChange={handleChange}
                                        >
                                            {cities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопка отправки */}
                            <div className="pt-6 border-t">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Создание проекта...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Создать проект</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Советы */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="text-blue-600 text-2xl mb-3">💡</div>
                    <h4 className="font-semibold text-gray-800 mb-2">Детальное описание</h4>
                    <p className="text-sm text-gray-600">Чем подробнее описание, тем точнее мастера поймут ваши желания.</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="text-purple-600 text-2xl mb-3">💰</div>
                    <h4 className="font-semibold text-gray-800 mb-2">Реалистичный бюджет</h4>
                    <p className="text-sm text-gray-600">Укажите реальную сумму, это поможет найти подходящего мастера.</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="text-green-600 text-2xl mb-3">🕐</div>
                    <h4 className="font-semibold text-gray-800 mb-2">Адекватные сроки</h4>
                    <p className="text-sm text-gray-600">Учитывайте время на обсуждение и изготовление.</p>
                </div>
            </div>
        </div>
    );
}