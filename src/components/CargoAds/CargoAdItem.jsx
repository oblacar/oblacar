// src/components/CargoAds/CargoAdItem.jsx
import React, { useMemo } from 'react';
// import {
//     FaCouch,
//     FaAppleAlt,
//     FaBoxOpen,
//     FaFlask,
//     FaIndustry,
//     FaTools,
//     FaLaptop,
//     FaTint,
//     FaCubes,
//     FaCube,
//     FaShoppingBag,
//     FaOilCan,
//     FaSnowflake,
//     FaThermometerHalf,
//     FaLayerGroup,
//     FaWineGlass,
// } from 'react-icons/fa';

import CargoBadgesRow from './icons/CargoBadgesRow';

import './CargoAdItem.css';

/**
 * Карточка объявления о перевозке груза (элемент списка).
 *
 * Поддерживаем плоские и { ad } структуры.
 * Ключевые поля:
 * - route.{from,to} | top-level: departureCity, destinationCity
 * - availabilityFrom, availabilityTo (даты)
 * - cargo.{name|title,type,weightTons|weight,dims{h,w,d},fragile,temperature}
 * - packagingTypes?: string[] (ключи мультиселекта)
 * - loadingTypes?: array|object
 * - price.{value,unit,readyToNegotiate} | top-level: price, paymentUnit, readyToNegotiate
 * - owner / ownerId / ownerName / ownerAvatar / rating
 */
const CargoAdItem = ({ ad = {}, className = '', ableHover = true }) => {
    const data = ad?.ad ? ad.ad : ad;

    const {
        adId,
        createdAt,
        date,
        route = {},
        cargo = {},
        loadingTypes,
        packagingTypes = data.packagingTypes || [],
        price = {},
    } = data;

    // дата создания
    const created = createdAt || date || null;
    const dateStr = created ? fmtDate(created) : null;

    // маршрут
    const from =
        route.from ??
        route.departureCity ??
        data.departureCity ??
        data.from ??
        '—';

    const to =
        route.to ??
        route.destinationCity ??
        data.destinationCity ??
        data.to ??
        '—';

    // даты перевозки
    const pickup =
        data.availabilityFrom ??
        data.pickupDate ??
        data.dates?.pickupDate ??
        null;

    const delivery =
        data.availabilityTo ??
        data.deliveryDate ??
        data.dates?.deliveryDate ??
        null;

    // груз
    const cargoName =
        data.title ?? '';

    const cargoType = cargo.type ?? data.cargoType ?? '';

    const weight =
        cargo.weightTons ??
        cargo.weight ??
        data.cargoWeightTons ??
        data.cargoWeight ??
        data.weightTons ??
        data.weight ??
        null;

    const dims = cargo.dims || {
        h: cargo.h ?? data.cargoHeight ?? data.height ?? data.truckHeight,
        w: cargo.w ?? data.cargoWidth ?? data.width ?? data.truckWidth,
        d: cargo.d ?? data.cargoDepth ?? data.depth ?? data.truckDepth,
    };

    const tagsLoading = useMemo(
        () => normalizeLoadingTypes(loadingTypes ?? data.loadingTypes),
        [loadingTypes, data.loadingTypes]
    );

    const temperature = cargo.temperature ?? data.temperature ?? null; // строка типа "0…+5°C" — оставим как флаг наличия
    const temperatureMode =
        (data.temperature?.mode ?? cargo.temperature?.mode) ||
        data.temperatureMode ||
        null; // 'ambient'|'chilled'|'frozen' (если есть)
    const fragile = Boolean(cargo.fragile ?? data.fragile);
    const isStackable = Boolean(data.isStackable ?? cargo.isStackable);

    // цена
    const priceValue = price.value ?? data.price;
    const priceUnit = price.unit ?? data.paymentUnit ?? 'руб';
    const bargain = Boolean(price.readyToNegotiate ?? data.readyToNegotiate);

    // владелец
    const owner = data.owner || {
        id: data.ownerId,
        name: data.ownerName || data.userName,
        avatarUrl: data.ownerAvatar || data.avatarUrl,
        rating: data.ownerRating ?? data.rating,
    };
    const ownerName = owner?.name || 'Без имени';
    const ownerAvatar = owner?.avatarUrl || null;
    const ownerRating = isFiniteNumber(owner?.rating)
        ? Number(owner.rating)
        : null;

    const rootClass = [
        'cargo-card',
        className,
        !ableHover ? 'cargo-card--nohover' : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={rootClass}>
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
                        Дата объявления: {String(dateStr) ? String(dateStr) : '-'}
                    </div>

                    <div className='cargo-card__body'>
                        <div className='cargo-card__row'>
                            <span className='cargo-card__label'>Груз:</span>
                            <span className='cargo-card__value'>
                                {cargoName || '—'}
                            </span>
                        </div>

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
                    <button
                        type='button'
                        className='cargo-card__icon-btn'
                        title='Добавить в варианты'
                        aria-label='Добавить в варианты'
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log('Добавить в варианты:', adId || data);
                        }}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CargoAdItem;

/* ===== УТИЛИТЫ ===== */

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
