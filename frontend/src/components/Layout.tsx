// src/components/Layout.tsx
import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Briefcase,
    PlusCircle,
    User,
    LogOut,
    Search,
    ListChecks,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface LayoutProps {
    children: ReactNode;
    requireAuth?: boolean;
}

export default function Layout({ children, requireAuth = true }: LayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');

        if (token && role) {
            setIsAuthenticated(true);

            if (requireAuth && !token) {
                navigate('/login');
            }
        } else if (requireAuth && !['/login', '/register'].includes(location.pathname)) {
            navigate('/login');
        }
    }, [location.pathname, navigate, requireAuth]);

    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'Пользователь';

    const handleLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinks = isAuthenticated ? (
        userRole === 'client' ? [
            { to: '/', icon: <Home size={20} />, label: 'Главная' },
            { to: '/my-projects', icon: <Briefcase size={20} />, label: 'Мои проекты' },
            { to: '/create-project', icon: <PlusCircle size={20} />, label: 'Создать' },
        ] : [
            { to: '/', icon: <Home size={20} />, label: 'Главная' },
            { to: '/available-projects', icon: <Search size={20} />, label: 'Поиск' },
            { to: '/my-responses', icon: <ListChecks size={20} />, label: 'Отклики' },
            { to: '/assigned-projects', icon: <Briefcase size={20} />, label: 'Проекты' },
        ]
    ) : [];

    // Breadcrumbs
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        return { label: segment.charAt(0).toUpperCase() + segment.slice(1), path };
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/50">
            {/* Навигация - теперь с width-full */}
            <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50 shadow-sm w-full">
                <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
                    <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
                        {/* Логотип */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <span className="text-white font-bold text-lg">RF</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    ReFurnish
                                </h1>
                                <p className="text-xs text-gray-500">Мебель на заказ</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-1 bg-gray-100/80 rounded-xl p-1">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                                    isActive(link.to)
                                                        ? 'bg-white shadow-sm text-blue-600'
                                                        : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                                                }`}
                                            >
                                                {link.icon}
                                                <span className="font-medium">{link.label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="h-6 w-px bg-gray-300/50 mx-2"></div>

                                    <div className="flex items-center space-x-4">
                                        <Link
                                            to={userRole === 'client' ? '/client/profile' : '/master/profile'}
                                            className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-gray-100/80 transition-colors group"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                                                <User size={16} className="text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-800">{userName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {userRole === 'client' ? 'Клиент' : 'Мастер'}
                                                </p>
                                            </div>
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-colors"
                                            title="Выйти"
                                        >
                                            <LogOut size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    {!['/login', '/register'].includes(location.pathname) && (
                                        <>
                                            <Link
                                                to="/login"
                                                className="px-5 py-2.5 text-gray-700 hover:text-blue-600 font-medium rounded-xl hover:bg-gray-100/80 transition-colors"
                                            >
                                                Войти
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow"
                                            >
                                                Начать бесплатно
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-100/80 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/80">
                        <div className="px-4 py-3 space-y-1">
                            {isAuthenticated ? (
                                <>
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                                                isActive(link.to)
                                                    ? 'bg-blue-50/80 text-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-100/80'
                                            }`}
                                        >
                                            {link.icon}
                                            <span className="font-medium">{link.label}</span>
                                        </Link>
                                    ))}

                                    <Link
                                        to={userRole === 'client' ? '/client/profile' : '/master/profile'}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100/80 transition-colors"
                                    >
                                        <User size={20} />
                                        <span>Профиль</span>
                                    </Link>

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50/80 text-red-600 w-full text-left"
                                    >
                                        <LogOut size={20} />
                                        <span>Выйти</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-xl"
                                    >
                                        Войти
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 text-center transition-all"
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Breadcrumbs */}
            {isAuthenticated && location.pathname !== '/' && (
                <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto py-4">
                    <div className="max-w-7xl mx-auto">
                        <nav className="flex items-center space-x-2 text-sm">
                            <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                                <Home size={16} />
                            </Link>
                            {breadcrumbs.map((crumb, index) => (
                                <div key={crumb.path} className="flex items-center space-x-2">
                                    <ChevronRight size={16} className="text-gray-400" />
                                    <Link
                                        to={crumb.path}
                                        className={`transition-colors ${
                                            index === breadcrumbs.length - 1
                                                ? 'text-blue-600 font-medium'
                                                : 'text-gray-500 hover:text-blue-600'
                                        }`}
                                    >
                                        {crumb.label}
                                    </Link>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content - ВАЖНО: добавляем w-full и центрирование */}
            <main className={`w-full px-4 sm:px-6 lg:px-8 py-6 ${!isAuthenticated && requireAuth ? 'min-h-[calc(100vh-160px)] flex items-center justify-center' : ''}`}>
                <div className={`${isAuthenticated || !requireAuth ? 'max-w-7xl mx-auto' : 'w-full max-w-md'}`}>
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-16 border-t border-gray-200/80 bg-white/50 w-full">
                <div className="w-full px-4 py-8 mx-auto">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-6 md:mb-0">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"></div>
                                    <div>
                                        <span className="text-lg font-bold text-gray-800">ReFurnish</span>
                                        <p className="text-sm text-gray-600">Мебель на заказ</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm max-w-md">
                                    Платформа для создания уникальной мебели. Соединяем мастеров с теми, кто ценит качество и индивидуальность.
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                <p>© {new Date().getFullYear()} ReFurnish. Все права защищены.</p>
                                <p className="mt-2 text-xs">Сделано с ❤️ для ценителей красивой мебели</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}