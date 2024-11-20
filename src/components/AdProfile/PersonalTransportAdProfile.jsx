import React, { useState, useEffect } from 'react';
import styles from './PersonalTransportAdProfile.module.css';

import IncomingRequestsList from './IncomingRequestsList';

import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { cutNumber, formatNumber } from '../../utils/helper';

import {
    CalendarDaysIcon,
    MapPinIcon,
    CreditCardIcon,
    BanknotesIcon,
    TruckIcon,
    ArrowsPointingInIcon,
    ScaleIcon,
    ArrowsPointingOutIcon,
    CloudIcon,
    CheckBadgeIcon,
    CubeIcon,
    EnvelopeIcon,
    InboxArrowDownIcon,
} from '@heroicons/react/24/outline';

import HorizontalPhotoCarousel from '../common/HorizontalPhotoCarousel/HorizontalPhotoCarousel';
import Button from '../common/Button/Button';
import IconWithTooltip from '../common/IconWithTooltip/IconWithTooltip';
import ToggleSearchMode from '../common/ToggleSearchMode/ToggleSearchMode';
import ChatInterface from '../ChatInterface/ChatInterface';

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

    //Функционал для выбора, что показывыаем: Запросы или Сообщения--->
    const [isSelectFirst, setIsSelectFirst] = useState(true);

    const handleToggle = (isFirstSelected) => {
        setIsSelectFirst(isFirstSelected);
    };
    //<---
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
        return loadingTypesString ? <>Загрузка: {loadingTypesString}</> : null;
    };

    const paymentOptionsItem = () => {
        let paymentOptionsString = paymentOptions?.join(', ');

        if (readyToNegotiate) {
            paymentOptionsString = paymentOptionsString + ', торг';
        }

        return paymentOptionsString ? (
            <>
                {/* <strong>Условия:</strong>  */}
                {paymentOptionsString}
            </>
        ) : null;
    };

    const truckWeightValue = () => {
        const valueData =
            Number(truckHeight) * Number(truckWidth) * Number(truckDepth);
        const value = cutNumber(valueData);

        const valuePart = value ? (
            <>
                {/* <strong>Габариты: </strong> */}
                {value}м<sup>3</sup> ({Number(truckHeight)}м x{' '}
                {Number(truckWidth)}м x {Number(truckDepth)}м)
            </>
        ) : null;

        const weightPart = truckWeight ? (
            <>
                {/* <strong>Тоннаж: </strong> */}
                {Number(truckWeight)}т
            </>
        ) : null;

        return (
            <>
                {weightPart}
                {', '}
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
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<CalendarDaysIcon />}
                                        tooltipText='Дата готовности машины к перевозке'
                                        size='24px'
                                    />
                                </div>
                                <span>
                                    <strong>{availabilityDate}</strong>
                                </span>
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<MapPinIcon />}
                                        tooltipText='Пункт отправления'
                                        size='24px'
                                    />
                                </div>
                                <span>
                                    <strong>{departureCity}</strong>
                                </span>
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<MapPinIcon />}
                                        tooltipText='Пункт назначения'
                                        size='24px'
                                    />
                                </div>
                                <span>
                                    <strong>{destinationCity}</strong>
                                </span>
                            </div>

                            <div className={`${styles.separator}`}></div>

                            <div className={`${styles.routeDatePriceRow}`}>
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<BanknotesIcon />}
                                        tooltipText='Стоимость перевозки'
                                        size='24px'
                                    />
                                </div>
                                <span>
                                    {formatNumber(String(price))} {paymentUnit}
                                </span>
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<CreditCardIcon />}
                                        tooltipText='Условия оплаты'
                                        size='24px'
                                    />
                                </div>
                                <span>{paymentOptionsItem()}</span>
                            </div>

                            <div className={`${styles.separator}`}></div>

                            <div className={`${styles.routeDatePriceRow}`}>
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<TruckIcon />}
                                        tooltipText='Марка автомобиля'
                                        size='24px'
                                    />
                                </div>
                                <span>{truckName}</span>
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<CheckBadgeIcon />}
                                        tooltipText='Тип кузова'
                                        size='24px'
                                    />
                                </div>
                                <span>{transportType}</span>
                            </div>

                            <div className={`${styles.routeDatePriceRow}`}>
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<ScaleIcon />}
                                        tooltipText='Грузоподъемность и Габариты'
                                        size='24px'
                                    />
                                </div>
                                <span>{truckWeightValue()}</span>
                            </div>
                            <div className={`${styles.routeDatePriceRow}`}>
                                <div className={`${styles.icon}`}>
                                    <IconWithTooltip
                                        icon={<ArrowsPointingInIcon />}
                                        tooltipText='Доступные варианты загрузки'
                                        size='24px'
                                    />
                                </div>
                                <span> {loadingTypesItem()}</span>
                            </div>
                        </div>
                        {/* <div className={styles.btns}>
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
                        </div> */}
                    </div>
                </div>

                {/* Список запросов */}
                <div className={styles.requests}>
                    <div style={{ padding: '20px', marginBottom: '30px' }}>
                        <ToggleSearchMode
                            firstOption={{
                                icon: <InboxArrowDownIcon />,
                                label: 'Запросы',
                            }}
                            secondOption={{
                                icon: <EnvelopeIcon />,
                                label: 'Сообщения',
                            }}
                            isSelectFirst={isSelectFirst}
                            onToggle={handleToggle}
                        />
                    </div>
                    {isSelectFirst && (
                        <>
                            <strong>Запросы на перевозку</strong>

                            <IncomingRequestsList adId={adId} />
                        </>
                    )}

                    {!isSelectFirst && (
                        <>
                            <strong>Переписка по Вашему объявлению. </strong>
                            <ChatInterface adId={adId} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonalTransportAdProfile;
