// src/components/CargoAds/CargoAdsList.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import CargoAdItem from './CargoAdItem';
import ViewModeToggle from '../common/ViewModeToggle/ViewModeToggle';
import CargoListToolbar from './CargoListToolbar/CargoListToolbar';

import { sortCargoAds } from '../../utils/sortCargoAds';
import { filterCargoAds } from '../../utils/filterCargoAds';

import './CargoAdsList.css';

import CargoAdsContext from '../../hooks/CargoAdsContext';
import Preloader from '../common/Preloader/Preloader';

const NON_ACTIVE_STATUSES = [
    'work',
    'completed',
    'deleted',
    'archived',
    'inactive',
];

const CargoAdsList = ({
    items = null,
    linkBase = '/cargo-ads',
    clickable = true,
    filterOwnerId = null,
    emptyText = 'Пока нет объявлений',
    defaultView = 'list',
}) => {
    const ctx = useContext(CargoAdsContext);

    // === режим отображения (лист/плитка) с восстановлением
    const [viewMode, setViewMode] = React.useState(
        () => localStorage.getItem('cargo_viewMode') || defaultView
    );
    React.useEffect(() => {
        localStorage.setItem('cargo_viewMode', viewMode);
    }, [viewMode]);

    // === сортировка (ключи совпадают с utils/sortCargoAds)
    const [sort, setSort] = React.useState('price_desc');

    // === фильтры (синхронизуются с тулбаром)
    // ожидается форма: { cargoTypes: string[], loadKinds: string[], packaging: string[] }
    const [filters, setFilters] = React.useState({
        cargoTypes: [],
        loadTypes: [],
        packaging: [],
    });

    // === получение данных
    const loading = items ? false : !!ctx?.loading;
    const error = items ? null : ctx?.error || null;
    const rawList = items ?? ctx?.items ?? ctx?.ads ?? [];

    // поддерживаем "расширенные" элементы {ad: {...}}
    const normalizeAd = (it) => (it && it.ad ? it.ad : it);

    let data = rawList.map(normalizeAd).filter(Boolean);

    // необязательный фильтр по владельцу
    if (filterOwnerId) {
        data = data.filter(
            (ad) => String(ad.ownerId) === String(filterOwnerId)
        );
    }

    // === применяем ФИЛЬТРЫ → потом СОРТИРОВКУ
    const displayed = React.useMemo(() => {
        const filtered = filterCargoAds(data, filters);
        return sortCargoAds(filtered, sort);
    }, [data, filters, sort]);

    return (
        <div className='cargo-ads-list'>
            {/* Панель инструментов: сорт + правый слот (переключатель вида) */}
            <div className='cargo-ads-list__toolbar'>
                <CargoListToolbar
                    sort={sort}
                    onSortChange={setSort}
                    filters={filters}
                    onFiltersChange={setFilters}
                    rightSlot={
                        <ViewModeToggle
                            mode={viewMode}
                            onChange={setViewMode}
                        />
                    }
                />
            </div>

            {loading && (
                <div className='cargo-ads-list__preloader'>
                    <Preloader />
                </div>
            )}

            {!loading && error && (
                <div className='cargo-ads-list__error'>
                    Ошибка: {String(error)}
                </div>
            )}

            {!loading && !error && displayed.length === 0 && (
                <div className='cargo-ads-list__empty'>{emptyText}</div>
            )}

            {!loading && !error && displayed.length > 0 && (
                <div
                    className={
                        viewMode === 'grid'
                            ? 'cargo-ads-list__grid'
                            : 'cargo-ads-list__column'
                    }
                >
                    {displayed.map((ad) => {
                        const key =
                            ad.adId ||
                            `${ad.departureCity}-${ad.destinationCity}-${ad.createdAt}`;

                        const status = ad?.status || 'active';
                        const derivedActive =
                            !NON_ACTIVE_STATUSES.includes(status);

                        const hasAdId = !!ad?.adId;
                        const isClickableNow =
                            clickable && derivedActive && hasAdId;

                        const card = (
                            <CargoAdItem
                                ad={ad}
                                ableHover
                                isActive={derivedActive}
                                compact={viewMode === 'grid'}
                            />
                        );

                        const itemClass =
                            viewMode === 'grid'
                                ? 'cargo-ads-list__cell'
                                : 'cargo-ads-list__item';

                        return (
                            <div
                                className={itemClass}
                                key={key}
                            >
                                {isClickableNow ? (
                                    <Link
                                        className='cargo-ads-list__link'
                                        to={`${linkBase}/${ad.adId}?type=cargo`}
                                        onClick={(e) => {
                                            if (!derivedActive) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                    >
                                        {card}
                                    </Link>
                                ) : (
                                    <div
                                        role='button'
                                        aria-disabled='true'
                                        tabIndex={-1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                    >
                                        {card}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CargoAdsList;
