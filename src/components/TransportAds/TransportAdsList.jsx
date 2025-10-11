// src/components/TransportAds/TransportAdsList.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import Preloader from '../common/Preloader/Preloader';
import TransportAdsToolbar from './TransportAdsToolbar/TransportAdsToolbar';
import './TransportAdsList.css';

import { SORT_OPTIONS, DEFAULT_SORT, TRUCK_TYPE_OPTIONS, LOADING_TYPE_OPTIONS } from './utils/options';
import { sortTransportAds } from '../../utils/sortTransportAds';
import { filterTransportAds } from '../../utils/filterTransportAds';

const STORAGE_KEY = 'transportAdsViewMode';

const TransportAdsList = ({ items = [] }) => {
    const { ads, loading, error } = useContext(TransportAdContext);

    // сортировка
    const [sort, setSort] = useState(DEFAULT_SORT);

    // режим отображения
    const [mode, setMode] = useState(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        return stored === 'grid' || stored === 'list' ? stored : 'list';
    });

    // фильтры
    const [filters, setFilters] = useState({
        truckTypes: [],    // массив value из TRUCK_TYPE_OPTIONS
        loadingTypes: [],  // массив value из LOADING_TYPE_OPTIONS
    });
    const updateFilter = (key, arr) =>
        setFilters(prev => ({ ...prev, [key]: Array.isArray(arr) ? arr : [] }));

    // источник данных
    const useContextData = !items || items.length === 0;
    const list = useContextData ? ads : items;

    // сохранить режим
    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, mode); } catch { }
    }, [mode]);

    // нормализатор формы (на всякий случай, если где-то понадобится extended)
    const toExtended = (item) => (item && item.ad ? item : (item ? { ad: item, isInReviewAds: false } : null));

    // 1) фильтрация
    const filtered = useMemo(
        () => filterTransportAds(list ?? [], filters),
        [list, filters]
    );

    // 2) сортировка
    const sorted = useMemo(
        () => sortTransportAds(filtered ?? [], sort),
        [filtered, sort]
    );

    // ранние возвраты
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
                total={sorted.length}

                // сортировка
                sort={sort}
                onSortChange={setSort}
                sortOptions={SORT_OPTIONS}

                // фильтры в панели (сразу после сортировки)
                truckTypeOptions={TRUCK_TYPE_OPTIONS}
                selectedTruckTypes={filters.truckTypes}
                onTruckTypesChange={(arr) => updateFilter('truckTypes', arr)}

                loadingTypeOptions={LOADING_TYPE_OPTIONS}
                selectedLoadingTypes={filters.loadingTypes}
                onLoadingTypesChange={(arr) => updateFilter('loadingTypes', arr)}
            />

            {sorted.length === 0 ? (
                <p className="ads-empty">No transport ads available.</p>
            ) : (
                <div className={`ads-list ads-list--${mode}`}>
                    {sorted.map((item, index) => {
                        // поддерживаем plain и extended элементы
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
