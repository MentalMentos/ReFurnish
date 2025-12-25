// src/pages/Register.tsx
import { useState } from 'react';
import { api } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Lock,
    Phone,
    Eye,
    EyeOff,
    Sparkles,
    AlertCircle,
    ArrowRight,
    Check
} from 'lucide-react';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'client' as 'client' | 'master'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('📤 Отправляю данные:', form);

            const res = await api.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                role: form.role
            });

            console.log('📥 Ответ сервера:', res.data);

            const response = res.data;

            if (response.token) {
                // Успех
                localStorage.setItem('token', response.token);
                localStorage.setItem('userRole', response.role);
                localStorage.setItem('user_id', response.user_id || response.userId);
                localStorage.setItem('userEmail', response.email);
                localStorage.setItem('userName', response.name);

                // Показываем успешное сообщение
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } else if (response.status === 'ok') {
                setError('Регистрация прошла успешно! Перенаправляем...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                throw new Error('Непонятный ответ от сервера');
            }
        } catch (err: any) {
            console.error('❌ Ошибка:', err);

            let errorMessage = 'Ошибка регистрации';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message.includes('Failed to fetch')) {
                errorMessage = 'Не удалось подключиться к серверу';
            } else if (err.message.includes('Network Error')) {
                errorMessage = 'Проблемы с сетью. Проверьте интернет';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && form.name && form.email) {
            setStep(2);
        } else if (step === 2 && form.password) {
            submit(new Event('submit') as any);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Заголовок */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        Начните создавать уникальную мебель
                    </h1>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto">
                        Присоединяйтесь к сообществу мастеров и клиентов
                    </p>
                </div>

                {/* Процесс регистрации */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-8">
                        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                            </div>
                            <span className="ml-2 font-medium hidden sm:block">Основное</span>
                        </div>
                        <div className="w-16 h-0.5 bg-gray-300"></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                                {step > 2 ? <Check className="w-5 h-5" /> : '2'}
                            </div>
                            <span className="ml-2 font-medium hidden sm:block">Пароль</span>
                        </div>
                    </div>
                </div>

                {/* Форма */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Шаг 1: Основная информация */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800 mb-6">
                                            Расскажите о себе
                                        </h2>
                                    </div>

                                    {/* Имя */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <User className="w-4 h-4 mr-2" />
                                            Ваше имя *
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="name"
                                                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                                                placeholder="Иван Иванов"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                            />
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <User size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Email адрес *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                                                placeholder="your@email.com"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                            />
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <Mail size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Телефон */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Телефон (необязательно)
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="phone"
                                                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                                                placeholder="+7 (999) 123-45-67"
                                                value={form.phone}
                                                onChange={handleChange}
                                            />
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <Phone size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Роль */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            Вы хотите:
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setForm({...form, role: 'client'})}
                                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                                    form.role === 'client'
                                                        ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                                                        : 'border-gray-300 hover:border-blue-300 text-gray-700'
                                                }`}
                                            >
                                                <div className="text-2xl mb-2">🛋️</div>
                                                <h4 className="font-semibold mb-1">Заказать мебель</h4>
                                                <p className="text-sm opacity-75">Я хочу изготовить мебель</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setForm({...form, role: 'master'})}
                                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                                    form.role === 'master'
                                                        ? 'border-green-500 bg-green-50/50 text-green-700'
                                                        : 'border-gray-300 hover:border-green-300 text-gray-700'
                                                }`}
                                            >
                                                <div className="text-2xl mb-2">🔨</div>
                                                <h4 className="font-semibold mb-1">Изготавливать</h4>
                                                <p className="text-sm opacity-75">Я мастер по изготовлению мебели</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Шаг 2: Пароль */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800 mb-6">
                                            Придумайте пароль
                                        </h2>
                                        <p className="text-gray-600 mb-6">
                                            Завершите регистрацию, создав надежный пароль
                                        </p>
                                    </div>

                                    {/* Пароль */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <Lock className="w-4 h-4 mr-2" />
                                            Пароль *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                                                placeholder="Минимум 6 символов"
                                                value={form.password}
                                                onChange={handleChange}
                                                required
                                                minLength={6}
                                            />
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <Lock size={18} />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            • Минимум 6 символов<br/>
                                            • Рекомендуем использовать буквы, цифры и символы
                                        </div>
                                    </div>

                                    {/* Требования к паролю */}
                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/50">
                                        <h4 className="font-medium text-blue-800 mb-2 text-sm">
                                            Безопасность вашего аккаунта
                                        </h4>
                                        <ul className="space-y-1 text-sm text-blue-700">
                                            <li className="flex items-center">
                                                <Check className="w-4 h-4 mr-2 text-green-500" />
                                                Защита персональных данных
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="w-4 h-4 mr-2 text-green-500" />
                                                Безопасные платежи
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="w-4 h-4 mr-2 text-green-500" />
                                                Конфиденциальность переписки
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Сводка */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-medium text-gray-800 mb-3 text-sm">
                                            Ваши данные:
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Имя:</span>
                                                <div className="font-medium">{form.name}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Email:</span>
                                                <div className="font-medium">{form.email}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Роль:</span>
                                                <div className="font-medium">
                                                    {form.role === 'client' ? 'Клиент' : 'Мастер'}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Телефон:</span>
                                                <div className="font-medium">{form.phone || 'Не указан'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className={`flex items-start space-x-3 p-4 rounded-xl ${
                                    error.includes('успешно')
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">{error}</div>
                                </div>
                            )}

                            {/* Навигация по шагам */}
                            <div className="flex justify-between pt-6 border-t">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                                    >
                                        Назад
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="px-6 py-3 text-gray-600 hover:text-blue-600 font-semibold transition-colors"
                                    >
                                        Уже есть аккаунт?
                                    </Link>
                                )}

                                <button
                                    type={step === 2 ? "submit" : "button"}
                                    onClick={step === 1 ? nextStep : undefined}
                                    disabled={loading || (step === 1 && (!form.name || !form.email))}
                                    className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Регистрация...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{step === 1 ? 'Продолжить' : 'Зарегистрироваться'}</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Преимущества */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                        <div className="text-3xl mb-4">🚀</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Быстрый старт</h4>
                        <p className="text-sm text-gray-600">Начните работу в течение 2 минут</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50">
                        <div className="text-3xl mb-4">🌟</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Профессиональное сообщество</h4>
                        <p className="text-sm text-gray-600">Только проверенные мастера и клиенты</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50">
                        <div className="text-3xl mb-4">🛡️</div>
                        <h4 className="font-semibold text-gray-800 mb-2">Гарантия качества</h4>
                        <p className="text-sm text-gray-600">Безопасные сделки и защита прав</p>
                    </div>
                </div>
            </div>
        </div>
    );
}