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
        // const s = Array.isArray(loadingTypes) ? loadingTypes.join(', ') : '';
        // return s ? <>{s}</> : '—';

        return Array.isArray(loadingTypes) && loadingTypes.length ? (
            <div className='oatp-tag-list'>
                {loadingTypes.map((label, index) => (
                    <span
                        key={index}
                        className='oatp-tag'
                    >
                        {label}
                    </span>
                ))}
            </div>
        ) : (
            loadingTypes || ''
        );
    };

    const paymentOptionsItem = () => {
        const list = Array.isArray(paymentOptions) ? paymentOptions : [];

        if (list.length || readyToNegotiate) {
            return (
                <div className='oatp-tag-list'>
                    {/* Рендеринг основных тегов */}
                    {list.map((label, index) => (
                        <span
                            key={index}
                            className='oatp-tag'
                        >
                            {label}
                        </span>
                    ))}

                    {/* Условный рендеринг тега "торг" с использованием логического И (&&) */}
                    {readyToNegotiate && (
                        <span
                            key='negotiate'
                            className='oatp-tag negotiate'
                        >
                            торг
                        </span>
                    )}
                </div>
            );
        }

        // Если ничего нет
        return '';
    };

    const truckWeightValue = () => {
        const vol =
            Number(truckHeight) * Number(truckWidth) * Number(truckDepth);
        const volStr = vol
            ? `${cutNumber(vol)}м³ (${Number(truckHeight)}×${Number(
                  truckWidth
              )}×${Number(truckDepth)}м)`
            : '';
        const weightStr = truckWeight ? `${Number(truckWeight)}т` : '';
        const join = [weightStr, volStr].filter(Boolean).join(', ');
        return join || '—';
    };

    return (
        <>
            <div className='other-ad-profile-truck-photo-area'>
                <PhotoCarousel photos={truckPhotoUrls} />
            </div>

            <div className='other-ad-profile-rout-date-price'>
                <div className='other-ad-profile-rout-date-price-row'>
                    <strong>Доступен: </strong>
                    {availabilityDate || '—'}
                </div>
                <div className='other-ad-profile-rout-date-price-row'>
                    <strong>Откуда: </strong>
                    {departureCity || '—'}
                </div>
                <div className='other-ad-profile-rout-date-price-row'>
                    <strong>Куда: </strong>
                    {destinationCity || '—'}
                </div>

                <div className='other-ad-profile-rout-date-price-row'>
                    <strong>Цена: </strong>
                    {price
                        ? `${formatNumber(String(price))} ${paymentUnit || ''}`
                        : '—'}
                </div>
                <div className='other-ad-profile-rout-date-price-row'>
                    {/* <strong>Условия: </strong> */}
                    {paymentOptionsItem()}
                </div>

                <div className='other-ad-profile-separator' />

                <div className='other-ad-profile-truck'>
                    <div className='other-ad-profile-truck-row'>
                        <strong>Марка: </strong>
                        {truckName || '—'}
                    </div>
                    <div className='other-ad-profile-truck-row'>
                        <strong>Тип: </strong>
                        {transportType || '—'}
                    </div>
                    <div className='other-ad-profile-truck-row'>
                        <strong>Параметры: </strong>
                        {truckWeightValue()}
                    </div>
                    <div className='other-ad-profile-truck-row'>
                        <strong>Загрузка: </strong>
                        {loadingTypesItem()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OtherTransportAdDetails;
