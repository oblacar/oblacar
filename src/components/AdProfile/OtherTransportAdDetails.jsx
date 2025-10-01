import React from 'react';
import PhotoCarousel from '../common/PhotoCarousel/PhotoCarousel';
import { cutNumber, formatNumber } from '../../utils/helper';

const OtherTransportAdDetails = ({ ad }) => {
    const data = ad?.ad && typeof ad.ad === 'object' ? ad.ad : ad;

    const {
        truckPhotoUrls = [],
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
    } = data || {};

    const loadingTypesItem = () => {
        const s = Array.isArray(loadingTypes) ? loadingTypes.join(', ') : '';
        return s ? <>{s}</> : '—';
    };

    const paymentOptionsItem = () => {
        let s = Array.isArray(paymentOptions) ? paymentOptions.join(', ') : '';
        if (readyToNegotiate) s = s ? `${s}, торг` : 'торг';
        return s || '—';
    };

    const truckWeightValue = () => {
        const vol = Number(truckHeight) * Number(truckWidth) * Number(truckDepth);
        const volStr = vol ? `${cutNumber(vol)}м³ (${Number(truckHeight)}×${Number(truckWidth)}×${Number(truckDepth)}м)` : '';
        const weightStr = truckWeight ? `${Number(truckWeight)}т` : '';
        const join = [weightStr, volStr].filter(Boolean).join(', ');
        return join || '—';
    };

    return (
        <>
            <div className="transport-ad-profile-truck-photo-area">
                <PhotoCarousel photos={truckPhotoUrls} />
            </div>

            <div className="transport-ad-profile-rout-date-price">
                <div className="transport-ad-profile-rout-date-price-row">
                    <strong>Доступен: </strong>{availabilityDate || '—'}
                </div>
                <div className="transport-ad-profile-rout-date-price-row">
                    <strong>Откуда: </strong>{departureCity || '—'}
                </div>
                <div className="transport-ad-profile-rout-date-price-row">
                    <strong>Куда: </strong>{destinationCity || '—'}
                </div>

                <div className="transport-ad-profile-rout-date-price-row">
                    <strong>Цена: </strong>{price ? `${formatNumber(String(price))} ${paymentUnit || ''}` : '—'}
                </div>
                <div className="transport-ad-profile-rout-date-price-row">
                    <strong>Условия: </strong>{paymentOptionsItem()}
                </div>

                <div className="transport-ad-profile-truck">
                    <div className="transport-ad-profile-truck-row">
                        <strong>Марка: </strong>{truckName || '—'}
                    </div>
                    <div className="transport-ad-profile-truck-row">
                        <strong>Тип: </strong>{transportType || '—'}
                    </div>
                    <div className="transport-ad-profile-truck-row">
                        <strong>Параметры: </strong>{truckWeightValue()}
                    </div>
                    <div className="transport-ad-profile-truck-row">
                        <strong>Загрузка: </strong>{loadingTypesItem()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OtherTransportAdDetails;
