// src/components/ReviewAds/ReviewAdItem.jsx
import { Link } from 'react-router-dom';
import './ReviewAdItem.css';
import { FaTimesCircle } from 'react-icons/fa';
import { formatNumber } from '../../utils/helper';

const ReviewAdItem = ({
    ad,
    adType = 'transport',        // 'transport' | 'cargo'
    isActive = true,             // внешний флаг активности (например, по статусу/удалению)
    removeReviewAd,
}) => {
    // Нормализуем формат входящих данных: иногда приходит { ad }
    const data = ad?.ad || ad || {};
    const isTransport = adType === 'transport';

    // --- Общие поля ---
    const adId = data?.adId != null ? String(data.adId) : '';

    // --- Статус / активность ---
    const status = data?.status;
    const isItemActive = isActive && (status == null || status === 'active');

    // --- Дата ---
    const transportDate = data?.availabilityDate || ''; // уже строка в ваших данных
    const cargoReadyDate =
        data?.availabilityFrom ??
        data?.pickupDate ??
        data?.dates?.pickupDate ??
        data?.createdAt ??
        data?.date ??
        null;

    const displayDate = isTransport ? transportDate : fmtDate(cargoReadyDate);

    // --- Города ---
    const route = data?.route || {};
    const departureCity = isTransport
        ? (data?.departureCity || '—')
        : (route.from ?? route.departureCity ?? data?.departureCity ?? data?.from ?? '—');

    const destinationCity = isTransport
        ? (data?.destinationCity || '—')
        : (route.to ?? route.destinationCity ?? data?.destinationCity ?? data?.to ?? '—');

    // --- Цена ---
    const priceValue = isTransport
        ? data?.price
        : (isFiniteNumber(data?.price?.value) ? data.price.value : data?.price);

    const paymentUnit = isTransport
        ? (data?.paymentUnit || '')
        : (data?.price?.unit ?? data?.paymentUnit ?? 'руб');

    // --- Ссылка ---
    const linkTo = isTransport
        ? `/transport-ads/${adId}?type=transport`
        : `/cargo-ads/${adId}?type=cargo`;

    const AdContent = (
        <div className={`preview-review-ad-item ${isItemActive ? '' : 'review-ad-item-not-active'}`}>
            <div className='preview-review-ad-item-route'>
                <div className='preview-review-ad-item-date'>
                    {displayDate || '—'}
                </div>
                <div className='preview-review-ad-item-city'>
                    {departureCity || '—'}
                </div>
                <div className='preview-review-ad-item-city'>
                    {destinationCity || '—'}
                </div>
            </div>

            <div className='preview-review-ad-item-payment'>
                <div className='preview-review-ad-item-price'>
                    {isFiniteNumber(priceValue) ? formatNumber(String(priceValue)) : '—'}
                </div>
                <div className='preview-review-ad-item-payment-unit'>
                    {paymentUnit || ''}
                </div>
            </div>
        </div>
    );

    const onRemove = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!removeReviewAd) return;
        if (adType === 'cargo') {
            // для грузов — ожидается adId
            if (adId) removeReviewAd(adId);
        } else {
            // для транспорта — ожидается весь ad
            removeReviewAd(ad);
        }
    };

    return (
        <div className='preview-review-ad-item-container'>
            <div className={`preview-review-ad-item-negative-status ${isItemActive ? '' : 'review-ad-item-not-active'}`}>
                {status === 'work' && 'Занят'}
                {status === 'completed' && 'Доставлено'}
                {status === 'deleted' && 'Удалено'}
            </div>

            {/* Кликабельным делаем только если объявление активно */}
            {isItemActive ? (
                <Link to={linkTo} className='review-ad-item-link'>
                    {AdContent}
                </Link>
            ) : (
                AdContent
            )}

            <div
                className={`preview-review-ad-item-delete-icon ${isItemActive ? '' : 'review-ad-item-not-active'}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeReviewAd?.(ad, adType);
                }}
                role="button"
                title="Убрать из выбранных"
                aria-label="Убрать из выбранных"
            >
                <FaTimesCircle />
            </div>
        </div>
    );
};

export default ReviewAdItem;

/* ===== местные утилиты ===== */

function isFiniteNumber(v) {
    const n = Number(v);
    return Number.isFinite(n);
}

function fmtDate(d) {
    if (!d) return '';
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
    return '';
}
