// src/pages/Login.tsx
import { useState } from 'react';
import { api } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import {
    LogIn,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
    AlertCircle
} from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });

            const { token, role, userId, user_id, email: userEmail, name } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('user_id', user_id || userId);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userName', name || email.split('@')[0]);

            onLogin();

            // Плавный переход на главную
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 300);

        } catch (err: any) {
            console.error('❌ Ошибка логина:', err);
            setError(err.response?.data?.message || 'Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Логотип */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Добро пожаловать
                    </h1>
                    <p className="text-gray-600">
                        Войдите в ваш аккаунт ReFurnish
                    </p>
                </div>

                {/* Форма */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email адрес
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Пароль
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                                        placeholder="Введите пароль"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
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
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-700">{error}</div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Вход...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>Войти в аккаунт</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">ИЛИ</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">
                                Ещё нет аккаунта?
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300"
                            >
                                Создать новый аккаунт
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-8 py-4 border-t border-gray-200/80">
                        <p className="text-xs text-gray-500 text-center">
                            Нажимая "Войти", вы соглашаетесь с нашими{" "}
                            <a href="#" className="text-blue-600 hover:underline">Условиями</a> и{" "}
                            <a href="#" className="text-blue-600 hover:underline">Политикой конфиденциальности</a>
                        </p>
                    </div>
                </div>

                {/* Дополнительная информация */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                        <div className="text-2xl mb-2">🚀</div>
                        <h4 className="font-medium text-gray-800 text-sm">Быстро</h4>
                        <p className="text-xs text-gray-600">Создание проекта за 5 минут</p>
                    </div>
                    <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                        <div className="text-2xl mb-2">🛡️</div>
                        <h4 className="font-medium text-gray-800 text-sm">Безопасно</h4>
                        <p className="text-xs text-gray-600">Защита ваших данных</p>
                    </div>
                    <div className="p-4 bg-white/50 rounded-xl border border-gray-200/50">
                        <div className="text-2xl mb-2">⭐</div>
                        <h4 className="font-medium text-gray-800 text-sm">Качественно</h4>
                        <p className="text-xs text-gray-600">Только проверенные мастера</p>
                    </div>
                </div>
            </div>
        </div>
    );
}