// src/components/CargoAd/PersonalCargoAdDetails.jsx
import React from 'react';
import styles from './PersonalAdProfile.module.css';

import { renderPackagingLabels } from '../../utils/packaging';

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

import { LiaTemperatureLowSolid } from "react-icons/lia";

// небольшие хелперы форматирования
const fmt = {
    date(d) {
        // 1. Обработка пустых или нулевых значений
        if (d === null || d === undefined || d === 0) {
            return '—';
        }

        let dateValue = d;

        // 2. Если пришла строка, но это не dd.mm.yyyy, 
        // мы предполагаем, что это может быть таймстемп-строка или другой формат.
        // Проверяем, похоже ли значение на dd.mm.yyyy.
        if (typeof d === 'string') {
            // Регулярное выражение: проверяем, соответствует ли формат "число.число.число"
            if (/\d{1,2}\.\d{1,2}\.\d{4}/.test(d.trim())) {
                // Если строка уже в формате дд.мм.гггг, возвращаем ее как есть
                return d.trim();
            }
            // Если это не формат дд.мм.гггг, пытаемся перевести строку в число.
            // Это нужно, если пришел таймстемп в виде строки, например '1759642468076'.
            dateValue = Number(d);

            // Если Number(d) вернул NaN (т.е. это была не таймстемп-строка, а, например, ISO-строка),
            // то возвращаем обратно исходную строку для создания Date.
            if (Number.isNaN(dateValue)) {
                dateValue = d;
            }
        }

        try {
            // 3. Создаем объект Date. 
            // new Date() корректно принимает как число-таймстемп, так и строки ISO/других форматов.
            const dateObj = new Date(dateValue);

            // 4. Проверяем, валидна ли дата. 
            // Если Date() не смог создать дату, он вернет "Invalid Date".
            if (isNaN(dateObj.getTime())) {
                return '—';
            }

            // 5. Форматируем в дд.мм.гггг (используя ручной метод для гарантии разделителя ".")
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();

            return `${day}.${month}.${year}`;

        } catch (error) {
            // Это сработает, только если в new Date() передать что-то совсем странное
            console.error('Ошибка форматирования даты:', error);
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

    // console.log('PersonalCargoAdDetails');
    // console.log(ad);

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

    // формируем массив ключей упаковки: либо массив, либо одинарный алиас
    const packagingKeys = Array.isArray(data.packagingTypes)
        ? data.packagingTypes
        : (data.packagingType ? [data.packagingType] : []);

    // переводим ключи -> русские подписи
    const packagingLabels = renderPackagingLabels(packagingKeys);

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

            <div className={styles.separator} />

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

            <div className={styles.separator} />

            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip icon={<CalendarDaysIcon />} tooltipText="Доставить до" size="24px" />
                </div>
                <span>{fmt.date(deliveryDate)}</span>
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
                    <IconWithTooltip icon={<CreditCardIcon />} tooltipText="Детали оплаты" size="24px" />
                </div>
                <span>{readyToNegotiate ? 'торг' : '-'}</span>
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
                <span>
                    {packagingLabels.length === 0 ? '—' : (
                        packagingLabels.map(lbl => (
                            <span key={lbl} className={styles.tag}>{lbl}</span>
                        ))
                    )}
                </span>
            </div>

            <div className={styles.separator} />

            {/* условия / флаги */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={<LiaTemperatureLowSolid size="32px" />}
                        tooltipText="Температурный режим"
                    // size="32px" 
                    />
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

        </div >
    );
};

export default PersonalCargoAdDetails;
