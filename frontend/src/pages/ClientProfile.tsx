// src/pages/ClientProfile.tsx
import { useState, useEffect } from 'react';
import { api } from '../api';

interface ClientProfile {
    id: string;
    email: string;
    phone: string;
}

export default function ClientProfile() {
    const [profile, setProfile] = useState<ClientProfile | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/client/profile');
            setProfile(res.data);
        } catch (error: any) {
            console.error('Ошибка загрузки профиля:', error);
        }
    };

    if (!profile) return <div>Загрузка...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-8">Мой профиль</h1>

                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <p className="text-gray-800 text-lg">{profile.email}</p>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Телефон</label>
                        <p className="text-gray-800 text-lg">{profile.phone}</p>
                    </div>

                    <div className="pt-8 border-t">
                        <h2 className="text-lg font-semibold mb-4">Статистика</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">0</div>
                                <div className="text-sm text-gray-600">Активных проектов</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">0</div>
                                <div className="text-sm text-gray-600">В работе</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">0</div>
                                <div className="text-sm text-gray-600">Завершенных</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">0</div>
                                <div className="text-sm text-gray-600">Всего проектов</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}