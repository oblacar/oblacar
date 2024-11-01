// src/components/AdProfile/AdProfile.js

import React from 'react';
import './AdProfile.css';
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';

import { cutNumber } from '../../utils/helper';

const AdProfile = ({ ad, onSendRequest, onMessage, userType }) => {
    // Тестовые данные объявления

    const testAd2 = {
        ad: {
            adId: 'ad_10',
            ownerId: 'owner_6',
            availabilityDate: '30.10.2024',
            departureCity: 'Томск',
            destinationCity: 'Уфа',
            price: 650,
            paymentUnit: 'тыс. руб',
            readyToNegotiate: false,
            paymentOptions: ['б/нал с НДС', 'б/нал без НДС'],
            truckId: 'truck_1',
            truckName: 'Mercedes-Benz Actros',
            truckPhotoUrls: '',
            transportType: 'Автовоз',
            loadingTypes: ['верхняя'],
            truckWeight: 5.9,
            truckHeight: 2.15,
            truckWidth: 1.95,
            truckDepth: 1.65,
            ownerName: 'Борис',
            ownerPhotoUrl: '',
            ownerRating: 4.95,
            status: 'active',
        },
        isInReviewAds: false,
    };

    const {
        availabilityDate,
        departureCity,
        destinationCity,
        price,
        paymentUnit,
        paymentOptions,
        truckName,
        transportType,
        loadingTypes,
        truckWeight,
        truckHeight,
        truckWidth,
        truckDepth,
    } = testAd2.ad;

    const loadingTypesItem = () => {
        const loadingTypesString = loadingTypes.join(', ');

        return loadingTypesString ? (
            <>
                <strong>Загрузка:</strong>
                {loadingTypesString}
            </>
        ) : null;
    };

    const paymentOptionsItem = () => {
        const paymentOptionsString = paymentOptions.join(', ');

        return paymentOptionsString ? (
            <>
                <strong>Условия:</strong> {paymentOptionsString}
            </>
        ) : null;
    };

    const truckWeightValue = () => {
        const valueData =
            Number(truckHeight) * Number(truckWidth) * Number(truckDepth);
        const value = cutNumber(valueData);

        const valuePart = value ? (
            <div>
                <strong>Габариты: </strong>
                {value}м<sup>3</sup> ({Number(truckHeight)}м x{' '}
                {Number(truckWidth)}м x {Number(truckDepth)}
                м)
            </div>
        ) : null;

        const weightPart = truckWeight ? (
            <div>
                <strong>Тоннаж: </strong>
                {Number(truckWeight)}т
            </div>
        ) : null;

        return (
            <>
                {weightPart}
                {valuePart}
            </>
        );
    };

    const testAd = {
        truckName: 'Mercedes-Benz Actros',
        loadingTypes: 'боковая',
        truckWeight: '20 000 кг',
        truckDimensions: '2.5 x 3 x 8 м',
        departureCity: 'Москва',
        destinationCity: 'Санкт-Петербург',
        availabilityDate: '2024-11-01',
        price: '5000 ₽',
        paymentUnit: 'за поездку',
        ownerName: 'Алексей Иванов',
    };

    const adData = ad || testAd;

    return (
        <>
            <div className='transport-ad-profile'>
                <div className='transport-ad-profile-main-data'>
                    <div className='transport-ad-profile-rout-date-price'>
                        <div className='transport-ad-profile-date transport-ad-profile-rout-date-price-row'>
                            <strong>Доступен:</strong> {availabilityDate}
                        </div>
                        <div className='transport-ad-profile-departure-city transport-ad-profile-rout-date-price-row'>
                            <strong>Откуда:</strong> {departureCity}
                        </div>
                        <div className='transport-ad-profile-destination-city transport-ad-profile-rout-date-price-row'>
                            <strong>Куда:</strong> {destinationCity}
                        </div>
                        <div className='transport-ad-profile-price transport-ad-profile-rout-date-price-row'>
                            <strong>Цена:</strong> {price} {paymentUnit}
                        </div>
                        <div className='transport-ad-profile-price transport-ad-profile-rout-date-price-row'>
                            {paymentOptionsItem()}
                        </div>

                        <div className='transport-ad-profile-truck'>
                            <div className='transport-ad-profile-truck-name transport-ad-profile-truck-row'>
                                <strong>Марка: </strong>
                                {truckName}
                            </div>
                            <div className='transport-ad-profile-truck-type transport-ad-profile-truck-row'>
                                <strong>Тип: </strong>
                                {transportType}
                            </div>
                            <div className='transport-ad-profile-truck-weight-value transport-ad-profile-truck-row'>
                                {truckWeightValue()}
                            </div>
                            <div className='transport-ad-profile-truck-loadings transport-ad-profile-truck-row'>
                                {loadingTypesItem()}
                            </div>
                        </div>
                    </div>
                    <div className='transport-ad-profile-truck-photo-area'>
                        <div className='transport-ad-profile-truck-photo'>
                            PHOTO
                        </div>
                        <div className='transport-ad-profile-truck-photo-preview-area'></div>
                    </div>
                </div>
                {userType === 'cargoOwner' ? (
                    <div className='ad-profile-actions'>
                        <button
                            className='ad-profile-request-btn'
                            onClick={() => onSendRequest(adData)}
                        >
                            Отправить запрос владельцу
                        </button>
                        <button
                            className='ad-profile-message-btn'
                            onClick={onMessage}
                        >
                            <FaEnvelope /> Написать владельцу
                        </button>
                    </div>
                ) : userType === 'transportOwner' ? (
                    <div className='ad-profile-actions'>
                        <button
                            className='ad-profile-approve-btn'
                            onClick={() => onSendRequest(adData, 'approve')}
                        >
                            <FaCheck /> Подтвердить запрос
                        </button>
                        <button
                            className='ad-profile-decline-btn'
                            onClick={() => onSendRequest(adData, 'decline')}
                        >
                            <FaTimes /> Отклонить запрос
                        </button>
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default AdProfile;
