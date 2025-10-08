// src/components/CargoAds/CargoAdItem.jsx
import React, { useMemo, useContext, useState, useCallback } from 'react';
import CargoBadgesRow from './icons/CargoBadgesRow';
import CargoAdsContext from '../../hooks/CargoAdsContext';
import ToggleIconButtonPlus from '../common/ToggleIconButtonPlus/ToggleIconButtonPlus';
import './CargoAdItem.css';
import { FaCheck } from 'react-icons/fa';

/**
 * Карточка объявления о перевозке груза (элемент списка).
 *
 * Поддерживаем плоские и { ad } структуры.
 */
const CargoAdItem = ({
    ad = {},
    className = '',
    ableHover = true,
    isViewMode = false,
    isActive = true, // внешняя «галка активности» (сохраняем поведение); дополнительно учитываем статус
    compact = '',
}) => {
    const data = ad?.ad ? ad.ad : ad;

    const {
        adId,
        createdAt,
        date,
        route = {},
        cargo = {},
        loadingTypes,
        price = {},
    } = data || {};

    // ------ НОВОЕ: статус карточки ------
    const status = data?.status || 'active';
    const nonActiveStatuses = [
        'work',
        'completed',
        'deleted',
        'archived',
        'inactive',
    ];
    const derivedActive = !nonActiveStatuses.includes(status);
    const isActiveFinal = Boolean(isActive && derivedActive); // Итого

    const statusLabel = getCargoStatusLabel(status);

    // === CONTEXT: работа с "Вариантами" (review) ===
    const { addReviewAd, removeReviewAd, reviewAds, isReviewed } =
        useContext(CargoAdsContext) || {};

    // объявление может быть уже "расширенным"
    const isExtended = ad && typeof ad.isInReviewAds === 'boolean' && ad.ad;
    const extAd = isExtended ? ad : { ad: data, isInReviewAds: false };

    // определяем, находится ли объявление в "Вариантах"
    const isInReviewFromAd = isExtended ? Boolean(ad.isInReviewAds) : false;
    const isInReviewFromCtx = useMemo(() => {
        if (!Array.isArray(reviewAds)) return false;
        const set = new Set(reviewAds.map((x) => x?.ad?.adId));
        return set.has(adId);
    }, [reviewAds, adId]);

    const isInReview = isInReviewFromAd || isInReviewFromCtx;

    // локальная подсветка кнопки (как у тебя в транспортном итеме)
    const [isSelectedAdItem, setIsSelectedAdItem] = useState(isInReview);

    // hover на самом тоггле — чтобы можно было визуально отключать кликабельность карточки, если используете такой класс
    const [onReviewAdsAdd, setOnReviewAdsAdd] = useState(false);

    // id объявления
    const adKey = String(data?.adId ?? adId ?? data?.id ?? '');

    // уже в отобранных?
    const isInReviewAds = isReviewed ? isReviewed(adKey) : false;

    // hover-обработчики для тоггла (как в транспорте)
    const handleMouseEnterReviewAdsAdd = () => setOnReviewAdsAdd(true);
    const handleMouseLeaveReviewAdsAdd = () => setOnReviewAdsAdd(false);

    // обработчик тоггла
    const handleToggle = useCallback(
        (willBeAdded) => {
            if (!adKey) return;
            if (willBeAdded) {
                addReviewAd?.(adKey);
            } else {
                removeReviewAd?.(adKey);
            }
        },
        [adKey, addReviewAd, removeReviewAd]
    );

    // «щит» от навигации: гасим события
    const stopNav = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // дата создания
    const created = createdAt || date || null;
    const dateStr = created ? fmtDate(created) : null;

    // маршрут
    const from =
        route.from ??
        route.departureCity ??
        data?.departureCity ??
        data?.from ??
        '—';

    const to =
        route.to ??
        route.destinationCity ??
        data?.destinationCity ??
        data?.to ??
        '—';

    // даты перевозки
    const pickup =
        data?.availabilityFrom ??
        data?.pickupDate ??
        data?.dates?.pickupDate ??
        null;

    const delivery =
        data?.availabilityTo ??
        data?.deliveryDate ??
        data?.dates?.deliveryDate ??
        null;

    // груз
    const cargoName = data?.title ?? cargo?.name ?? data?.cargoName ?? '—';
    const cargoType = cargo?.type ?? data?.cargoType ?? '';

    const weight =
        cargo?.weightTons ??
        cargo?.weight ??
        data?.cargoWeightTons ??
        data?.cargoWeight ??
        data?.weightTons ??
        data?.weight ??
        null;

    const dims = cargo?.dims || {
        h:
            cargo?.h ??
            data?.cargoHeight ??
            data?.dimensionsMeters?.height ??
            data?.truckHeight,
        w:
            cargo?.w ??
            data?.cargoWidth ??
            data?.dimensionsMeters?.width ??
            data?.truckWidth,
        d:
            cargo?.d ??
            data?.cargoDepth ??
            data?.dimensionsMeters?.depth ??
            data?.truckDepth,
    };

    const tagsLoading = useMemo(
        () => normalizeLoadingTypes(loadingTypes ?? data?.loadingTypes),
        [loadingTypes, data?.loadingTypes]
    );

    const temperature = cargo?.temperature ?? data?.temperature ?? null;
    const temperatureMode =
        (data?.temperature?.mode ?? cargo?.temperature?.mode) ||
        data?.temperatureMode ||
        null;
    const fragile = Boolean(cargo?.fragile ?? data?.fragile);
    const isStackable = Boolean(data?.isStackable ?? cargo?.isStackable);

    // цена
    const priceValue = isFiniteNumber(price?.value) ? price.value : data?.price;
    const priceUnit = price?.unit ?? data?.paymentUnit ?? 'руб';
    const bargain = Boolean(price?.readyToNegotiate ?? data?.readyToNegotiate);

    // владелец
    const ownerRaw = data?.owner || {};
    const owner = {
        id: data?.ownerId ?? ownerRaw?.id ?? null,
        name:
            data?.ownerName ?? data?.userName ?? ownerRaw?.name ?? 'Без имени',
        photoUrl:
            ownerRaw?.photoUrl ??
            data?.ownerPhotoUrl ??
            data?.ownerAvatar ??
            data?.avatarUrl ??
            null,
        rating: isFiniteNumber(ownerRaw?.rating)
            ? Number(ownerRaw.rating)
            : isFiniteNumber(data?.ownerRating)
                ? Number(data.ownerRating)
                : isFiniteNumber(data?.rating)
                    ? Number(data.rating)
                    : null,
    };

    const ownerName = owner.name;
    const ownerAvatar = owner.photoUrl;
    const ownerRating = owner.rating;

    const rootClass = [
        'cargo-card',
        className,
        !ableHover ? 'cargo-card--nohover' : '',
        !isActiveFinal ? 'is-disabled' : '',
        compact ? 'cargo-card--compact' : '',
    ].filter(Boolean).join(' ');


    return (
        <div
            className={rootClass}
            onMouseEnter={() => setIsSelectedAdItem(true)}
            onMouseLeave={() => setIsSelectedAdItem(false)}
            aria-disabled={!isActiveFinal}
            title={!isActiveFinal && statusLabel ? statusLabel : undefined}
        >
            {/* Бейдж статуса, как у транспортной карточки */}
            <div
                className={`ad-cargo-item-show-status ${isActiveFinal ? '' : 'no-active'
                    }`}
            >
                {status === 'work' && 'Занят'}
                {status === 'completed' && 'Доставлено'}
                {status === 'deleted' && 'Удалено'}
                {status === 'archived' && 'Скрыто'}
                {status === 'inactive' && 'Не активно'}
            </div>

            {isInReviewAds ? (
                <div className='ad-item-show-in-review'>
                    <FaCheck />
                </div>
            ) : null}

            {/* ВЕРХ: 2 колонки — слева контент, справа даты+цена */}
            <div className='cargo-card__head'>
                {/* ЛЕВЫЙ СТОЛБЕЦ */}
                <div className='cargo-card__leftcol'>
                    <div className='cargo-card__cities'>
                        <span className='cargo-card__city'>{from || '-'}</span>
                        <span className='cargo-card__arrow'>→</span>
                        <span className='cargo-card__city'>{to || '-'}</span>
                    </div>

                    <div className='cargo-card__meta'>
                        Дата объявления:{' '}
                        {String(dateStr) ? String(dateStr) : '-'}
                    </div>

                    <div className='cargo-card__body'>
                        <div className='cargo-card__row'>
                            <span className='cargo-card__label'>Груз:</span>
                            <span className='cargo-card__value'>
                                {cargoName || '—'}
                            </span>
                        </div>

                        {cargoType && (
                            <div className='cargo-card__row'>
                                <span className='cargo-card__label'>Тип:</span>
                                <span className='cargo-card__value'>
                                    {cargoType}
                                </span>
                            </div>
                        )}

                        <div className='cargo-card__row'>
                            <span className='cargo-card__label'>Вес:</span>
                            <span className='cargo-card__value'>
                                {isFiniteNumber(weight)
                                    ? `${fmtNum(weight)} т`
                                    : '—'}
                            </span>
                        </div>

                        <div className='cargo-card__row'>
                            <span className='cargo-card__label'>Габариты:</span>
                            <span className='cargo-card__value'>
                                {fmtDims(dims?.h, dims?.w, dims?.d)} м
                            </span>
                        </div>

                        {!!tagsLoading.length && (
                            <div className='cargo-card__row cargo-card__row--tags'>
                                <span className='cargo-card__label'>
                                    Загрузка:
                                </span>
                                <span className='cargo-card__tags'>
                                    {tagsLoading.map((t) => (
                                        <span
                                            key={t}
                                            className='cargo-card__tag'
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ПРАВЫЙ СТОЛБЕЦ */}
                <div className='cargo-card__right'>
                    <div className='cargo-card__dates'>
                        <div className='cargo-card__date-row'>
                            <span className='cargo-card__date-label'>
                                Загрузка
                            </span>
                            <span className='cargo-card__date-value cargo-card__date-pickup'>
                                {pickup ? fmtDate(pickup) : '-'}
                            </span>
                        </div>

                        <div className='cargo-card__date-row'>
                            <span className='cargo-card__date-label'>
                                Доставка до
                            </span>
                            <span className='cargo-card__date-value cargo-card__date-delivery'>
                                {delivery ? fmtDate(delivery) : '-'}
                            </span>
                        </div>
                    </div>

                    <div className='cargo-card__price'>
                        {isFiniteNumber(priceValue) ? (
                            <>
                                <div className='cargo-card__price-value'>
                                    {fmtPrice(priceValue)}
                                </div>
                                <div className='cargo-card__price-unit'>
                                    {priceUnit}
                                </div>
                            </>
                        ) : (
                            <div className='cargo-card__price-na'>
                                Цена не указана
                            </div>
                        )}
                    </div>

                    {bargain && <div className='cargo-card__bargain'>торг</div>}
                </div>
            </div>

            {/* НИЗ: бейджи + владелец + действие */}
            <div className='cargo-card__foot'>
                <div className='cargo-card__foot-left'>
                    <CargoBadgesRow
                        ad={ad}
                        size={16}
                        gap={6}
                    />
                </div>

                <div className='cargo-card__owner'>
                    <div className='cargo-card__owner-avatar'>
                        {ownerAvatar ? (
                            <img
                                src={ownerAvatar}
                                alt={ownerName}
                            />
                        ) : (
                            <div className='cargo-card__owner-fallback'>
                                {String(ownerName).slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className='cargo-card__owner-meta'>
                        <div
                            className='cargo-card__owner-name'
                            title={ownerName}
                        >
                            {ownerName}
                        </div>
                        {ownerRating != null && (
                            <div
                                className='cargo-card__owner-rating'
                                aria-label={`Рейтинг ${ownerRating} из 5`}
                            >
                                {renderStars(ownerRating)}
                            </div>
                        )}
                    </div>
                </div>

                <div className='cargo-card__foot-right'>
                    {isActiveFinal ? (
                        <div
                            className={`container-icon-add-review-cargo-ad ${isViewMode ? 'view-mode' : ''
                                }`}
                        >
                            <div
                                onMouseEnter={handleMouseEnterReviewAdsAdd}
                                onMouseLeave={handleMouseLeaveReviewAdsAdd}
                                onMouseDown={stopNav}
                                onClick={stopNav}
                                onTouchStart={stopNav}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ')
                                        stopNav(e);
                                }}
                                role='button'
                                tabIndex={0}
                                aria-label='Добавить в варианты'
                            >
                                <ToggleIconButtonPlus
                                    onToggle={handleToggle}
                                    initialAdded={isInReviewAds}
                                    isColored={isSelectedAdItem}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default CargoAdItem;

/* ===== УТИЛИТЫ ===== */

function getCargoStatusLabel(status) {
    switch (status) {
        case 'work':
            return 'Занят';
        case 'completed':
            return 'Доставлено';
        case 'deleted':
            return 'Удалено';
        case 'archived':
            return 'Скрыто';
        case 'inactive':
            return 'Не активно';
        default:
            return '';
    }
}

function normalizeLoadingTypes(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object')
        return Object.keys(val).filter((k) => !!val[k]);
    return [];
}

function fmtDate(d) {
    if (!d) return '—';
    if (typeof d === 'string') {
        const m = d.match(/^(\d{2})[./](\d{2})[./](\d{4})$/);
        if (m) return `${m[1]}.${m[2]}.${m[3]}`;
        const t = Date.parse(d);
        if (!Number.isNaN(t)) return new Date(t).toLocaleDateString('ru-RU');
        return d;
    }
    if (typeof d === 'number') return new Date(d).toLocaleDateString('ru-RU');
    if (d instanceof Date && !Number.isNaN(d.getTime()))
        return d.toLocaleDateString('ru-RU');
    return '—';
}

function fmtNum(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return '—';
    return String(Math.round(num * 100) / 100).replace(/\.00?$/, '');
}

function fmtDims(h, w, d) {
    const H = Number(h),
        W = Number(w),
        D = Number(d);
    const hasAny = [H, W, D].some(Number.isFinite);
    if (!hasAny) return '—';
    const s = (x) =>
        Number.isFinite(Number(x))
            ? String(Math.round(Number(x) * 100) / 100).replace(/\.00?$/, '')
            : '—';
    return `${s(H)}×${s(W)}×${s(D)}`;
}

function fmtPrice(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('ru-RU');
}

function isFiniteNumber(v) {
    return Number.isFinite(Number(v));
}

function renderStars(value) {
    const v = Math.max(0, Math.min(5, Number(value)));
    const full = Math.floor(v);
    const half = v - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
        <>
            {'★'.repeat(full)}
            {half ? '☆' : ''}
            {'✩'.repeat(empty)}
        </>
    );
}
