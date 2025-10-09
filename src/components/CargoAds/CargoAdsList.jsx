// src/components/CargoAds/CargoAdsList.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import CargoAdItem from './CargoAdItem';
import ViewModeToggle from '../common/ViewModeToggle/ViewModeToggle';
import CargoListToolbar from './CargoListToolbar/CargoListToolbar'; // <— новая панель

import './CargoAdsList.css';

// Если нужен контекст — подключим его; если items передан, контекст не используем.
import CargoAdsContext from '../../hooks/CargoAdsContext';

// (опционально) твой прелоадер
import Preloader from '../common/Preloader/Preloader';

const NON_ACTIVE_STATUSES = ['work', 'completed', 'deleted', 'archived', 'inactive'];

// Наборы опций для фильтров (при желании можно собрать динамически из data)
const LOAD_TYPES = ['верхняя', 'боковая', 'задняя', 'без ворот'];
const LOAD_KINDS = ['гидроборт', 'кран', 'пандус', 'налив', 'насыпь', 'паллеты'];
const SPECIAL_TAGS = ['опасный', 'хрупкий', 'охлаждение', 'заморозка'];

const CargoAdsList = ({
    items = null,
    linkBase = '/cargo-ads',
    clickable = true,
    filterOwnerId = null,
    emptyText = 'Пока нет объявлений',
    defaultView = 'list',
}) => {
    const ctx = useContext(CargoAdsContext);

    // — режим отображения (лист/плитка) с localStorage
    const [viewMode, setViewMode] = React.useState(() =>
        localStorage.getItem('cargo_viewMode') || defaultView
    );
    React.useEffect(() => {
        localStorage.setItem('cargo_viewMode', viewMode);
    }, [viewMode]);

    // — данные
    const loading = items ? false : !!ctx?.loading;
    const error = items ? null : ctx?.error || null;
    const rawList = items ?? ctx?.items ?? ctx?.ads ?? [];
    const normalizeAd = (it) => (it && it.ad ? it.ad : it);

    let data = rawList.map(normalizeAd).filter(Boolean);
    if (filterOwnerId) {
        data = data.filter((ad) => String(ad.ownerId) === String(filterOwnerId));
    }

    // === сортировка и фильтры (локальный стейт)
    const [sort, setSort] = React.useState('priceDesc');
    const [filters, setFilters] = React.useState({
        loadTypes: [],
        loadKinds: [],
        specials: { all: true, set: [] }, // "Все" — спец-фильтры не применяются
    });

    // — утилиты сортировки
    const collator = React.useMemo(
        () => new Intl.Collator('ru', { numeric: true, sensitivity: 'base' }),
        []
    );
    const get = React.useCallback((a, key) => {
        switch (key) {
            case 'price': return Number(a?.price?.value ?? a?.price) || null;
            case 'from': return a?.route?.from ?? a?.departureCity ?? a?.from ?? '';
            case 'pickup': return a?.availabilityFrom ?? a?.pickupDate ?? a?.dates?.pickupDate ?? null;
            default: return null;
        }
    }, []);
    const compare = React.useCallback((s) => (x, y) => {
        const dir = (s.endsWith('Desc') || s === 'latest') ? -1 : 1;
        if (s.startsWith('price')) {
            const vx = get(x, 'price'), vy = get(y, 'price');
            if (vx == null && vy == null) return 0;
            if (vx == null) return 1; if (vy == null) return -1;
            return dir * (vx - vy);
        }
        if (s.startsWith('from')) {
            return dir * collator.compare(String(get(x, 'from')), String(get(y, 'from')));
        }
        if (s === 'soonest' || s === 'latest') {
            const vx = new Date(get(x, 'pickup') ?? 8640000000000000).getTime();
            const vy = new Date(get(y, 'pickup') ?? 8640000000000000).getTime();
            return dir * (vx - vy);
        }
        return 0;
    }, [collator, get]);

    // — фильтры
    const matchesFilters = React.useCallback((ad) => {
        const a = ad?.ad ? ad.ad : ad;

        // типы загрузки
        if (filters.loadTypes.length) {
            const set = normalizeLoadingTypes(a?.loadingTypes ?? a?.loading_types);
            if (!filters.loadTypes.some(t => set.includes(t))) return false;
        }

        // варианты/способы
        if (filters.loadKinds.length) {
            const kinds = normalizeLoadingTypes(a?.loadingKinds ?? a?.loading_kinds);
            if (!filters.loadKinds.some(t => kinds.includes(t))) return false;
        }

        // особые грузы
        if (!filters.specials.all) {
            const flags = new Set([
                a?.dangerous ? 'опасный' : null,
                (a?.fragile || a?.cargo?.fragile) ? 'хрупкий' : null,
                (a?.temperature?.mode === 'cool' || a?.cooling) ? 'охлаждение' : null,
                (a?.temperature?.mode === 'freeze' || a?.freezing) ? 'заморозка' : null,
            ].filter(Boolean));
            const wanted = filters.specials.set;
            if (!wanted.length) return false;
            if (!wanted.some(tag => flags.has(tag))) return false;
        }

        return true;
    }, [filters]);

    // — применяем фильтры + сортировку
    const view = React.useMemo(() => {
        const filtered = data.filter(matchesFilters);
        const arr = [...filtered];
        arr.sort(compare(sort));
        return arr;
    }, [data, matchesFilters, sort, compare]);

    return (
        <div className="cargo-ads-list">
            {/* Панель инструментов: сортировка/фильтры + переключатель вида */}
            <div className="cargo-ads-list__toolbar" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <CargoListToolbar
                    sort={sort}
                    onChangeSort={setSort}
                    loadingTypes={LOAD_TYPES}
                    loadingKinds={LOAD_KINDS}
                    specialTags={SPECIAL_TAGS}
                    value={filters}
                    onChangeFilters={setFilters}
                />
                <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            </div>

            {loading && (
                <div className="cargo-ads-list__preloader">
                    <Preloader />
                </div>
            )}

            {!loading && error && (
                <div className="cargo-ads-list__error">Ошибка: {String(error)}</div>
            )}

            {!loading && !error && view.length === 0 && (
                <div className="cargo-ads-list__empty">{emptyText}</div>
            )}

            {!loading && !error && view.length > 0 && (
                <div className={viewMode === 'grid' ? 'cargo-ads-list__grid' : 'cargo-ads-list__column'}>
                    {view.map((ad) => {
                        const key = ad.adId || `${ad.departureCity}-${ad.destinationCity}-${ad.createdAt}`;

                        const status = ad?.status || 'active';
                        const derivedActive = !NON_ACTIVE_STATUSES.includes(status);

                        const hasAdId = !!ad?.adId;
                        const isClickableNow = clickable && derivedActive && hasAdId;

                        const card = (
                            <CargoAdItem
                                ad={ad}
                                ableHover={true}
                                isActive={derivedActive}
                                compact={viewMode === 'grid'}
                            />
                        );

                        const itemClass = viewMode === 'grid' ? 'cargo-ads-list__cell' : 'cargo-ads-list__item';

                        return (
                            <div className={itemClass} key={key}>
                                {isClickableNow ? (
                                    <Link
                                        className="cargo-ads-list__link"
                                        to={`${linkBase}/${ad.adId}?type=cargo`}
                                        onClick={(e) => {
                                            if (!derivedActive) { e.preventDefault(); e.stopPropagation(); }
                                        }}
                                    >
                                        {card}
                                    </Link>
                                ) : (
                                    <div
                                        role="button"
                                        aria-disabled="true"
                                        tabIndex={-1}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
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

// === утилита
function normalizeLoadingTypes(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === 'object') return Object.keys(val).filter((k) => !!val[k]);
    return [];
}
