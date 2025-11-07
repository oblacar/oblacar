import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update, remove } from 'firebase/database';
import { db } from '../../firebase';
import AdminAdPanel from '../components/AdminAdPanel';
import { AdminAdsService } from '../services/AdminAdsService';

// Если у тебя есть готовые компоненты OwnerAdPage / PublicAdPage — можно их подключить
// import OwnerAdView from '../../components/ads/OwnerAdView';
// import PublicAdView from '../../components/ads/PublicAdView';

export default function AdminAdPage() {
    const { adId } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState(null);
    const [type, setType] = useState(null); // cargo / transport
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('owner'); // owner | public

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const cargoRef = ref(db, `cargoAds/${adId}`);
                const transportRef = ref(db, `transportAds/${adId}`);

                const [cargoSnap, transportSnap] = await Promise.all([
                    get(cargoRef),
                    get(transportRef),
                ]);

                if (cargoSnap.exists()) {
                    setAd({ id: adId, ...cargoSnap.val() });
                    setType('cargo');
                } else if (transportSnap.exists()) {
                    setAd({ id: adId, ...transportSnap.val() });
                    setType('transport');
                } else {
                    alert('Объявление не найдено');
                    navigate('/admin/ads');
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [adId, navigate]);

    const handleDelete = async () => {
        if (
            !window.confirm(
                'Вы уверены, что хотите удалить объявление безвозвратно?'
            )
        )
            return;
        const root = type === 'cargo' ? 'cargoAds' : 'transportAds';
        await remove(ref(db, `${root}/${adId}`));
        alert('Объявление удалено');
        navigate('/admin/ads');
    };

    const handleBlock = async () => {
        const root = type === 'cargo' ? 'cargoAds' : 'transportAds';
        await update(ref(db, `${root}/${adId}/status`), 'blocked');
        alert('Объявление заблокировано');
        window.location.reload();
    };

    const handleRestore = async () => {
        const root = type === 'cargo' ? 'cargoAds' : 'transportAds';
        await update(ref(db, `${root}/${adId}/status`), 'active');
        alert('Объявление восстановлено');
        window.location.reload();
    };

    if (loading) return <div className='p-4'>Загрузка...</div>;
    if (!ad) return <div className='p-4'>Объявление не найдено</div>;

    return (
        <div className='admin-ad-page p-4'>
            <AdminAdPanel
                ad={ad}
                type={type}
                onDelete={handleDelete}
                onBlock={handleBlock}
                onRestore={handleRestore}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className='ad-content mt-6'>
                {/* Пока просто отобразим JSON объявления */}
                <pre
                    style={{
                        background: '#fafafa',
                        padding: '16px',
                        borderRadius: '8px',
                    }}
                >
                    {JSON.stringify(ad, null, 2)}
                </pre>

                {/* Позже можно заменить на полноценные компоненты */}
                {/* {viewMode === 'owner' ? <OwnerAdView ad={ad}/> : <PublicAdView ad={ad}/> } */}
            </div>
        </div>
    );
}
