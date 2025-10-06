// src/components/TransportAd/TransportAdDetails.jsx
import React from 'react';
import styles from './../../PersonalAdProfile/PersonalAdProfile.module.css';

import IconWithTooltip from '../../../common/IconWithTooltip/IconWithTooltip';
import {
    CalendarDaysIcon,
    MapPinIcon,
    CreditCardIcon,
    BanknotesIcon,
    TruckIcon,
    ArrowsPointingInIcon,
    ScaleIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';

import { cutNumber, formatNumber } from '../../../../utils/helper';

const PersonalTransportAdDetails = ({ ad }) => {
    if (!ad) return null;

    const {
        availabilityDate,
        departureCity,
        destinationCity,
        price,
        paymentUnit,
        paymentOptions,
        readyToNegotiate,
        truckName,
        transportType,
        loadingTypes,
        truckWeight,
        truckHeight,
        truckWidth,
        truckDepth,
    } = ad;

    const loadingTypesItem = () => {
        const s = Array.isArray(loadingTypes) ? loadingTypes.join(', ') : '';
        return s ? <>Загрузка: {s}</> : null;
    };

    const paymentOptionsItem = () => {
        let s = Array.isArray(paymentOptions) ? paymentOptions.join(', ') : '';
        if (readyToNegotiate) s = s ? `${s}, торг` : 'торг';
        return s || null;
    };

    const tonnageAndVolume = () => {
        const volNum =
            Number(truckHeight) * Number(truckWidth) * Number(truckDepth);
        const vol = volNum ? cutNumber(volNum) : null;

        const volPart = vol ? (
            <>
                {vol}м<sup>3</sup> ({Number(truckHeight)}м ×{' '}
                {Number(truckWidth)}м × {Number(truckDepth)}м)
            </>
        ) : null;

        const weightPart = truckWeight ? <>{Number(truckWeight)}т</> : null;

        if (!weightPart && !volPart) return null;

        return (
            <>
                {weightPart}
                {weightPart && volPart ? ', ' : ''}
                {volPart}
            </>
        );
    };

    return (
        <div className={styles.routeDatePrice}>
            {/* дата */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={CalendarDaysIcon}
                        tooltipText='Дата готовности машины к перевозке'
                        size='24px'
                    />
                </div>
                <span>
                    <strong>{availabilityDate || '—'}</strong>
                </span>
            </div>

            {/* маршрут */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={MapPinIcon}
                        tooltipText='Пункт отправления'
                        size='24px'
                    />
                </div>
                <span>
                    <strong>{departureCity || '—'}</strong>
                </span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={MapPinIcon}
                        tooltipText='Пункт назначения'
                        size='24px'
                    />
                </div>
                <span>
                    <strong>{destinationCity || '—'}</strong>
                </span>
            </div>

            <div className={styles.separator} />

            {/* бюджет */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={BanknotesIcon}
                        tooltipText='Стоимость перевозки'
                        size='24px'
                    />
                </div>
                <span>
                    {price
                        ? `${formatNumber(String(price))} ${
                              paymentUnit || 'руб'
                          }`
                        : '—'}
                </span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={CreditCardIcon}
                        tooltipText='Условия оплаты'
                        size='24px'
                    />
                </div>
                <span>{paymentOptionsItem() || '—'}</span>
            </div>

            <div className={styles.separator} />

            {/* ТС */}
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={TruckIcon}
                        tooltipText='Марка автомобиля'
                        size='24px'
                    />
                </div>
                <span>{truckName || '—'}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={CheckBadgeIcon}
                        tooltipText='Тип кузова'
                        size='24px'
                    />
                </div>
                <span>{transportType || '—'}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={ScaleIcon}
                        tooltipText='Грузоподъемность и габариты'
                        size='24px'
                    />
                </div>
                <span>{tonnageAndVolume() || '—'}</span>
            </div>
            <div className={styles.routeDatePriceRow}>
                <div className={styles.icon}>
                    <IconWithTooltip
                        icon={ArrowsPointingInIcon}
                        tooltipText='Доступные варианты загрузки'
                        size='24px'
                    />
                </div>
                <span>{loadingTypesItem() || '—'}</span>
            </div>
        </div>
    );
};

export default PersonalTransportAdDetails;
