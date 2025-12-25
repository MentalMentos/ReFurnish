// src/pages/Dashboard.tsx
import { Link } from 'react-router-dom';
import {
    PlusCircle,
    Briefcase,
    User,
    TrendingUp,
    Clock,
    CheckCircle,
    Sparkles,
    ArrowRight,
    Search,
    ListChecks
} from 'lucide-react';

export default function Dashboard() {
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'Пользователь';

    const clientStats = [
        { title: 'Активные проекты', value: 0, icon: <Briefcase />, color: 'from-blue-500 to-blue-600', change: '+0%' },
        { title: 'В работе', value: 0, icon: <Clock />, color: 'from-yellow-500 to-orange-500', change: '+0%' },
        { title: 'Завершённые', value: 0, icon: <CheckCircle />, color: 'from-green-500 to-emerald-600', change: '+0%' },
        { title: 'Общий бюджет', value: 0, icon: <TrendingUp />, color: 'from-purple-500 to-pink-600', change: '+0%' },
    ];

    const masterStats = [
        { title: 'Отклики', value: 0, icon: <Sparkles />, color: 'from-blue-500 to-blue-600', change: '+0%' },
        { title: 'Проекты', value: 0, icon: <Briefcase />, color: 'from-green-500 to-emerald-600', change: '+0%' },
        { title: 'Доход', value: 0, icon: <TrendingUp />, color: 'from-purple-500 to-pink-600', change: '+0%' },
        { title: 'Рейтинг', value: 0, icon: '⭐', color: 'from-yellow-500 to-orange-500', change: '+0%' },
    ];

    const features = [
        {
            icon: '🎯',
            title: 'Точный поиск',
            description: 'Найдите идеального мастера под ваши требования',
            color: 'bg-blue-50 border-blue-200'
        },
        {
            icon: '⚡',
            title: 'Быстрое создание',
            description: 'Опубликуйте проект за 5 минут',
            color: 'bg-purple-50 border-purple-200'
        },
        {
            icon: '🛡️',
            title: 'Безопасность',
            description: 'Гарантия качества и безопасные платежи',
            color: 'bg-green-50 border-green-200'
        },
        {
            icon: '🤝',
            title: 'Прямой контакт',
            description: 'Общайтесь с мастерами напрямую',
            color: 'bg-orange-50 border-orange-200'
        },
    ];

    const quickActions = userRole === 'client' ? [
        { to: '/create-project', icon: <PlusCircle />, title: 'Создать проект', description: 'Опишите вашу мебель', color: 'from-blue-500 to-purple-600' },
        { to: '/my-projects', icon: <Briefcase />, title: 'Мои проекты', description: 'Управляйте заказами', color: 'from-green-500 to-emerald-600' },
        { to: '/client/profile', icon: <User />, title: 'Профиль', description: 'Личные данные', color: 'from-orange-500 to-red-600' },
    ] : [
        { to: '/available-projects', icon: <Search />, title: 'Поиск проектов', description: 'Найдите заказы', color: 'from-blue-500 to-purple-600' },
        { to: '/my-responses', icon: <ListChecks />, title: 'Мои отклики', description: 'Отслеживайте отклики', color: 'from-green-500 to-emerald-600' },
        { to: '/master/profile', icon: <User />, title: 'Профиль мастера', description: 'Портфолио и рейтинг', color: 'from-orange-500 to-red-600' },
    ];

    return (
        <div className="w-full space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-bold mb-4">
                        Добро пожаловать, <span className="bg-white/20 px-3 py-1 rounded-lg">{userName}</span>!
                    </h1>
                    <p className="text-lg opacity-90 mb-6">
                        {userRole === 'client'
                            ? 'Создайте проект мечты и найдите лучшего мастера'
                            : 'Найдите интересные проекты и покажите своё мастерство'
                        }
                    </p>
                    <Link
                        to={userRole === 'client' ? '/create-project' : '/available-projects'}
                        className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                        <span>{userRole === 'client' ? 'Создать проект' : 'Найти проекты'}</span>
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(userRole === 'client' ? clientStats : masterStats).map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                <div className="text-white">{stat.icon}</div>
                            </div>
                            {stat.change && (
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                        <div className="text-gray-600 text-sm">{stat.title}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Быстрые действия</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.to}
                            className="group bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`mb-4 w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                                <div className="text-white">{action.icon}</div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {action.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                            <div className="flex items-center text-blue-600 text-sm font-medium">
                                Перейти
                                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Почему выбирают нас</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className={`${feature.color} border rounded-xl p-6 hover:shadow-md transition-shadow`}>
                            <div className="text-3xl mb-4">{feature.icon}</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                    Как это работает?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                            1
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{userRole === 'client' ? 'Опишите проект' : 'Найдите проект'}</h3>
                        <p className="text-gray-600">
                            {userRole === 'client'
                                ? 'Подробно расскажите, какую мебель хотите получить'
                                : 'Выберите проект, соответствующий вашему опыту'
                            }
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                            2
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{userRole === 'client' ? 'Выберите мастера' : 'Отправьте предложение'}</h3>
                        <p className="text-gray-600">
                            {userRole === 'client'
                                ? 'Просмотрите отклики мастеров и выберите лучшего'
                                : 'Предложите свою цену и условия выполнения работы'
                            }
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
                            3
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{userRole === 'client' ? 'Получите мебель' : 'Выполните работу'}</h3>
                        <p className="text-gray-600">
                            {userRole === 'client'
                                ? 'Получите готовое изделие в оговоренные сроки'
                                : 'Создайте качественную мебель и получите оплату'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}