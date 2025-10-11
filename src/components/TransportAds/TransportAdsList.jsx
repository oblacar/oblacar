// src/components/TransportAds/TransportAdsList.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import Preloader from '../common/Preloader/Preloader';
import TransportAdsToolbar from './TransportAdsToolbar/TransportAdsToolbar';
import './TransportAdsList.css';

import { SORT_OPTIONS, DEFAULT_SORT } from './utils/options';
import { sortTransportAds } from '../../utils/sortTransportAds';

const STORAGE_KEY = 'transportAdsViewMode';

const TransportAdsList = ({ items = [] }) => {
    const { ads, loading, error } = useContext(TransportAdContext);

    const [sort, setSort] = useState(DEFAULT_SORT);
    const [mode, setMode] = useState(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        return stored === 'grid' || stored === 'list' ? stored : 'list';
    });

    // если items не передан (или пуст), используем контекст
    const useContextData = !items || items.length === 0;
    const list = useContextData ? ads : items;

    // сохраняем режим
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, mode); } catch { }
    }, [mode]);

    // --- ВСЕ ХУКИ ВЫШЕ ЛЮБЫХ RETURN ---
    // нормализатор формы элемента
    const toExtended = (item) => (item && item.ad ? item : (item ? { ad: item, isInReviewAds: false } : null));

    const normalized = useMemo(
        () => (list || []).map(toExtended).filter(Boolean),
        [list]
    );

    const sorted = useMemo(
        () => sortTransportAds(list ?? [], sort),   // сортируем исходные данные (plain/extended — не важно)
        [list, sort]
    );
    // ------------------------------------

    // показываем прелоадер/ошибку только если работаем с контекстом
    if (useContextData && loading) {
        return (
            <div className='preloader'>
                <Preloader />
            </div>
        );
    }
    if (useContextData && error) {
        return <div className='error-message'>Error: {error}</div>;
    }

    return (
        <div className="ads-list-container">
            <TransportAdsToolbar
                mode={mode}
                onModeChange={setMode}
                total={normalized.length}

                // сортировочные пропсы
                sort={sort}
                onSortChange={setSort}
                sortOptions={SORT_OPTIONS}
            />

            {sorted.length === 0 ? (
                <p className="ads-empty">No transport ads available.</p>
            ) : (
                <div className={`ads-list ads-list--${mode}`}>
                    {sorted.map((item, index) => {
                        // sortTransportAds может вернуть plain или extended — поддержим оба
                        const ext = item && item.ad ? item : { ad: item, isInReviewAds: false };

                        const key = ext.ad?.adId ?? index;
                        const isActive = ext.ad?.status === 'active';

                        return (
                            <div
                                key={key}
                                className={`ads-list-item ads-list-item--${mode} ${isActive ? '' : 'is-inactive'}`}
                            >
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
