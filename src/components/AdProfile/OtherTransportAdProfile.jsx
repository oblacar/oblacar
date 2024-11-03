// src/components/AdProfile/AdProfile.js

import React, { useState, useEffect, useRef } from 'react';
import './OtherTransportAdProfile.css';
import {
    FaUser,
    FaEnvelope,
    FaCheck,
    FaTimes,
    FaCommentDots,
} from 'react-icons/fa';

import { cutNumber, formatNumber } from '../../utils/helper';

import PhotoCarousel from '../common/PhotoCarousel/PhotoCarousel';
import Button from '../common/Button/Button';

const OtherTransportAdProfile = ({
    ad,
    onSendRequest,
    onMessage,
    userType,
}) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ad) {
            setIsLoading(false);
        }
    }, [ad]);

    if (isLoading) {
        return <div className='loading'>Загрузка объявления...</div>;
    }

    const {
        ownerPhotoUrl,
        ownerName,
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
        ownerRating,
    } = ad;

    const loadingTypesItem = () => {
        const loadingTypesString = loadingTypes?.join(', ');
        return loadingTypesString ? (
            <>
                <strong>Загрузка:</strong> {loadingTypesString}
            </>
        ) : null;
    };

    const paymentOptionsItem = () => {
        let paymentOptionsString = paymentOptions?.join(', ');

        if (readyToNegotiate) {
            paymentOptionsString = paymentOptionsString + ', торг';
        }

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
                {Number(truckWidth)}м x {Number(truckDepth)}м)
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

    return (
        <>
            <div className='transport-ad-profile'>
                <div className='transport-ad-profile-main-data'>
                    <div className='transport-ad-profile-truck-photo-area'>
                        <PhotoCarousel photos={ad.truckPhotoUrls || []} />
                    </div>
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
                            <strong>Цена:</strong> {formatNumber(String(price))}{' '}
                            {paymentUnit}
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
                </div>
                <div className='transport-ad-profile-owner-data'>
                    <div className='transport-ad-profile-user-data'>
                        <div className='transport-ad-profile-user-photo-rating'>
                            <div className='transport-ad-profile-user-photo'>
                                {ownerPhotoUrl ? ( // Проверяем, есть ли фото
                                    <img
                                        src={ownerPhotoUrl}
                                        alt='Хозяин объявления'
                                        className='transport-ad-profile-photo-car-owner'
                                    />
                                ) : (
                                    <FaUser />
                                )}
                                {ownerRating ? (
                                    <div className='transport-ad-profile-user-rating'>
                                        ★ {ownerRating}
                                    </div>
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                        <div className='transport-ad-profile-user-name'>
                            {ownerName}
                        </div>

                        <div className='transport-ad-profile-user-btn-message'>
                            <Button
                                type='button'
                                children='Написать'
                                icon={<FaCommentDots />}
                            />
                        </div>
                    </div>
                    <div className='transport-ad-profile-owner-send-request'>
                        <strong>
                            Опишите груз и отправьте Перевозчику запрос на
                            подтверждение доставки.
                        </strong>
                        <textarea placeholder='Описание вашего груза и детали перевозки.'></textarea>
                        <Button
                            type='button'
                            children='Отправить запрос'
                            icon={<FaEnvelope />}
                            type_btn='reverse'
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default OtherTransportAdProfile;
