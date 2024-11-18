import React, { useState, useEffect } from 'react';
import styles from './PersonalTransportAdProfile.module.css';

import IncomingRequestsList from './IncomingRequestsList';

import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { cutNumber, formatNumber } from '../../utils/helper';

import HorizontalPhotoCarousel from '../common/HorizontalPhotoCarousel/HorizontalPhotoCarousel';
import Button from '../common/Button/Button';

const PersonalTransportAdProfile = ({
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
        return <div className={styles.loading}>Загрузка объявления...</div>;
    }

    const {
        adId,
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
        <div className={styles.fakePage}>
            <div className={styles.pageContainer}>
                {/* Блок объявления */}
                <div className={styles.transportAdProfile}>
                    <div className={styles.adContainer}>
                        <div className={styles.photoArea}>
                            <HorizontalPhotoCarousel
                                photos={ad.truckPhotoUrls || []}
                            />
                        </div>
                        <div className={styles.routeDatePrice}>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <strong>Доступен:</strong> {availabilityDate}
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <strong>Откуда:</strong> {departureCity}
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <strong>Куда:</strong> {destinationCity}
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <strong>Цена:</strong>{' '}
                                {formatNumber(String(price))} {paymentUnit}
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                {paymentOptionsItem()}
                            </div>

                            <div className={styles.truck}>
                                <div
                                    className={`${styles.truckRow} ${styles.truckName}`}
                                >
                                    <strong>Марка: </strong>
                                    {truckName}
                                </div>
                                <div className={`${styles.truckRow}`}>
                                    <strong>Тип: </strong>
                                    {transportType}
                                </div>
                                <div className={`${styles.truckRow}`}>
                                    {truckWeightValue()}
                                </div>
                                <div className={`${styles.truckRow}`}>
                                    {loadingTypesItem()}
                                </div>
                            </div>
                        </div>
                        <div className={styles.btns}>
                            <Button
                                type='button'
                                children='Удалить'
                                type_btn='reverse-no'
                                icon={<TrashIcon />}
                                className={styles.deleteBtn}
                            />
                            <Button
                                type='button'
                                children='Редактировать'
                                icon={<PencilSquareIcon />}
                                className={styles.correctionBtn}
                            />
                        </div>
                    </div>
                </div>

                {/* Список запросов */}
                <div className={styles.requests}>
                    <strong>Запросы на перевозку</strong>
                    <IncomingRequestsList adId={adId} />
                </div>
            </div>
        </div>
    );
};

export default PersonalTransportAdProfile;
