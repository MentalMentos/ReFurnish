// src/pages/MasterProfile.tsx
import { useState, useEffect } from 'react';
import { api } from '../api';

interface MasterProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    rating: number;
}

export default function MasterProfile() {
    const [profile, setProfile] = useState<MasterProfile | null>(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: '',
        city: '',
        phone: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/master/profile');
            setProfile(res.data);
            setForm({
                name: res.data.name || '',
                city: res.data.city || '',
                phone: res.data.phone || ''
            });
        } catch (error: any) {
            console.error('Ошибка загрузки профиля:', error);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/master/profile', form);
            setProfile({...profile!, ...form});
            setEditing(false);
            alert('Профиль обновлен!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Ошибка обновления профиля');
        }
    };

    if (!profile) return <div>Загрузка...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Мой профиль мастера</h1>
                    <button
                        onClick={() => setEditing(!editing)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        {editing ? 'Отмена' : 'Редактировать'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Имя</label>
                            {editing ? (
                                <input
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            ) : (
                                <p className="text-xl font-semibold">{profile.name}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Email</label>
                            <p className="text-gray-600">{profile.email}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Телефон</label>
                            {editing ? (
                                <input
                                    value={form.phone}
                                    onChange={e => setForm({...form, phone: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            ) : (
                                <p className="text-gray-600">{profile.phone}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Город</label>
                            {editing ? (
                                <input
                                    value={form.city}
                                    onChange={e => setForm({...form, city: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            ) : (
                                <p className="text-gray-600">{profile.city || 'Не указан'}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Рейтинг</label>
                            <div className="flex items-center">
                                <div className="text-yellow-500 text-2xl">★</div>
                                <span className="ml-2 text-xl font-bold">{profile.rating || 'Нет оценок'}</span>
                            </div>
                        </div>

                        {editing && (
                            <button
                                onClick={handleSave}
                                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Сохранить изменения
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}