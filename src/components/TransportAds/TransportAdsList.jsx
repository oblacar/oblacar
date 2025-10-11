// src/components/TransportAds/TransportAdsList.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import Preloader from '../common/Preloader/Preloader';
import TransportAdsToolbar from './TransportAdsToolbar/TransportAdsToolbar';
import './TransportAdsList.css';

const STORAGE_KEY = 'transportAdsViewMode';

const TransportAdsList = ({ items = [] }) => {
    const { ads, loading, error } = useContext(TransportAdContext);

    // если items не передан (или пуст), используем контекст
    const useContextData = !items || items.length === 0;
    const list = useContextData ? ads : items;

    // режим отображения с сохранением в localStorage
    const [mode, setMode] = useState(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        return stored === 'grid' || stored === 'list' ? stored : 'list';
    });
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, mode); } catch { }
    }, [mode]);

    // нормализуем элемент: поддержим и "расширенный" ({ad, isInReviewAds}), и "plain" (ad-объект)
    const toExtended = (item) => {
        if (item && item.ad) return item; // уже расширенная форма
        return item ? { ad: item, isInReviewAds: false } : null;
    };

    const normalized = useMemo(() => (list || []).map(toExtended).filter(Boolean), [list]);

    // показываем прелоадер/ошибку только если работаем с контекстом
    if (useContextData && loading) {
        return (
            <div className='preloader'>
                <Preloader />
            </div>
        );
    }
    if (useContextData && error) return <div className='error-message'>Error: {error}</div>;

    return (
        <div className="ads-list-container">
            <TransportAdsToolbar
                mode={mode}
                onModeChange={setMode}
                total={normalized.length}
            />

            {normalized.length === 0 ? (
                <p className="ads-empty">No transport ads available.</p>
            ) : (
                <div className={`ads-list ads-list--${mode}`}>
                    {normalized.map((ext, index) => {
                        const key = ext.ad?.adId ?? index;
                        const isActive = ext.ad?.status === 'active';

                        return (
                            <div
                                key={key}
                                className={`ads-list-item ads-list-item--${mode} ${isActive ? '' : 'is-inactive'}`}
                            >
                                {/* TransportAdItem уже готов — передаём ему режим для мелких визуальных различий */}
                                <TransportAdItem ad={ext} isActive={isActive} viewMode={mode} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TransportAdsList;
