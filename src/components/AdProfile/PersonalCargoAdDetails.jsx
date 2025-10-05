// src/components/CargoAd/PersonalCargoAdDetails.jsx
import React from 'react';
import styles from './PersonalAdProfile.module.css';

import IconWithTooltip from '../common/IconWithTooltip/IconWithTooltip';
import {
    CalendarDaysIcon,
    MapPinIcon,
    BanknotesIcon,
    CreditCardIcon,
    CubeIcon,
    ScaleIcon,
    ArrowsPointingOutIcon,
    BeakerIcon,
    ExclamationTriangleIcon,
    TagIcon,
} from '@heroicons/react/24/outline';

// небольшие хелперы форматирования
const fmt = {
    date(d) {
        if (!d) return '—';
        // если пришла строка dd.MM.yyyy — покажем как есть
        if (typeof d === 'string') return d;
        try {
            const t = Date.parse(d);
            return Number.isNaN(t) ? '—' : new Date(t).toLocaleDateString('ru-RU');
        } catch {
            return '—';
        }
    },
    price(v, unit = 'руб') {
        const n = Number(v);
        if (!Number.isFinite(n)) return '—';
        return `${n.toLocaleString('ru-RU')} ${unit}`;
    },
    dims({ height, width, depth }) {
        const H = Number(height), W = Number(width), D = Number(depth);
        const s = (x) =>
            Number.isFinite(x) ? String(Math.round(x * 100) / 100).replace(/\.00?$/, '') : '—';
        if (![H, W, D].some(Number.isFinite)) return '—';
        return `${s(H)} × ${s(W)} × ${s(D)} м`;
    },
    list(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return '—';
        return arr.join(', ');
    },
};

const PersonalCargoAdDetails = ({ ad }) => {
    if (!ad) return null;

    // поддержим обе схемы (плоскую и вложенную)

    console.log('PersonalCargoAdDetails');
    console.log(ad);
    
    const data = ad?.ad ? ad.ad : ad;

    const createdAt = data.createdAt || data.date;
    const departureCity = data.route?.from || data.departureCity;
    const destinationCity = data.route?.to || data.destinationCity;

    const pickupDate = data.pickupDate ?? data.availabilityFrom;
    const deliveryDate = data.deliveryDate ?? data.availabilityTo;

    const title = data.title || data.cargo?.title || data.cargoName || '';
    const cargoType = data.cargoType || data.cargo?.type || '';
    const weightTons = data.weightTons ?? data.cargo?.weightTons ?? data.weight ?? '';
    const quantity = data.quantity ?? '';
    const dims = data.dimensionsMeters || data.cargo?.dims || {
        height: data.cargo?.h ?? data.height,
        width: data.cargo?.w ?? data.width,
        depth: data.cargo?.d ?? data.depth,
    };

    const packagingTypes = data.packagingTypes ?? data.packagingType
        ? Array.isArray(data.packagingTypes) ? data.packagingTypes : [data.packagingType]
        : [];

    const isFragile = Boolean(data.isFragile ?? data.cargo?.fragile);
    const isStackable = Boolean(data.isStackable ?? data.cargo?.isStackable);
    const adrClass = data.adrClass ?? data.cargo?.adrClass ?? '';

    const temp = data.temperature || data.cargo?.temperature || { mode: 'ambient' };
    const temperatureStr = (() => {
        if (!temp) return '—';
        const mode =
            temp.mode === 'chilled' ? 'охлаждение' :
                temp.mode === 'frozen' ? 'заморозка' :
                    'обычная';
        const bounds =
            (temp.minC !== '' || temp.maxC !== '') ? ` (${temp.minC ?? ''}…${temp.maxC ?? ''}°C)` : '';
        return `${mode}${bounds}`;
    })();

    const loadingTypes = data.preferredLoadingTypes ?? data.loadingTypes ?? [];

    const price = data.price;
    const paymentUnit = data.paymentUnit || 'руб';
    const readyToNegotiate = Boolean(data.readyToNegotiate);

    return (
        <div className={styles.routeDatePrice}>
            {/* создано */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<CalendarDaysIcon />} tooltipText="Дата объявления" size="24px" />
                </div>
                <span>{fmt.date(createdAt)}</span>
            </div>

            {/* маршрут */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<MapPinIcon />} tooltipText="Пункт отправления" size="24px" />
                </div>
                <span><strong>{departureCity || '—'}</strong></span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<MapPinIcon />} tooltipText="Пункт назначения" size="24px" />
                </div>
                <span><strong>{destinationCity || '—'}</strong></span>
            </div>

            <div className={styles.separator} />

            {/* сроки */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<CalendarDaysIcon />} tooltipText="Забор (готовность к отгрузке)" size="24px" />
                </div>
                <span><strong>
                    {fmt.date(pickupDate)}
                </strong>
                </span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<CalendarDaysIcon />} tooltipText="Доставить до" size="24px" />
                </div>
                <span>{fmt.date(deliveryDate)}</span>
            </div>

            <div className={styles.separator} />

            {/* о грузе */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<TagIcon />} tooltipText="Короткое название груза" size="24px" />
                </div>
                <span>{title || '—'}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<CubeIcon />} tooltipText="Тип груза" size="24px" />
                </div>
                <span>{cargoType || '—'}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<ScaleIcon />} tooltipText="Вес, т" size="24px" />
                </div>
                <span>{weightTons ? String(weightTons) : '—'}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<ArrowsPointingOutIcon />} tooltipText="Габариты (В×Ш×Г)" size="24px" />
                </div>
                <span>{fmt.dims(dims)}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<CubeIcon />} tooltipText="Количество мест" size="24px" />
                </div>
                <span>{quantity || '—'}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<CubeIcon />} tooltipText="Тип упаковки" size="24px" />
                </div>
                <span>{fmt.list(packagingTypes)}</span>
            </div>

            <div className={styles.separator} />

            {/* условия / флаги */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<BeakerIcon />} tooltipText="Температурный режим" size="24px" />
                </div>
                <span>{temperatureStr}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<ExclamationTriangleIcon />} tooltipText="ADR класс (опасный груз)" size="24px" />
                </div>
                <span>{adrClass ? String(adrClass) : '—'}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<ArrowsPointingOutIcon />} tooltipText="Предпочтительные варианты загрузки" size="24px" />
                </div>
                <span>{fmt.list(loadingTypes)}</span>
            </div>

            <div className={styles.separator} />

            {/* бюджет */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<BanknotesIcon />} tooltipText="Стоимость" size="24px" />
                </div>
                <span>{fmt.price(price, paymentUnit)}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<CreditCardIcon />} tooltipText="Готовность обсуждать" size="24px" />
                </div>
                <span>{readyToNegotiate ? 'да' : 'нет'}</span>
            </div>
        </div >
    );
};

export default PersonalCargoAdDetails;
