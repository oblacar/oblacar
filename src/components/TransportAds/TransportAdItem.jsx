//Очень важный компонет. Используется для превью, списка объявлений и т.п.

import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './TransportAdItem.css';
import {
    FaTruck,
    FaUser,
    FaCheckCircle,
    FaCheck,
    FaPlus,
    FaUserCircle,
} from 'react-icons/fa';

import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkIconOutline } from '@heroicons/react/24/outline';

import TransportAdContext from '../../hooks/TransportAdContext';
import AuthContext from '../../hooks/Authorization/AuthContext';

import ToggleIconButtonPlus from '../common/ToggleIconButtonPlus/ToggleIconButtonPlus';

import SingleRatingStar from '../common/SingleRatingStar/SingleRatingStar';
import { NumberSchema } from 'yup';

const TransportAdItem = ({
    ad,
    isViewMode = false,
    // hasAddToVariantsBtn = true,
    // isHovered = true,
    // isClickable = true,
    isActive = true,
    viewMode = 'list',  // <— НОВОЕ: 'list' | 'grid'
}) => {
    const isGrid = viewMode === 'grid';

    const { isInReviewAds } = ad;
    const {
        adId,
        ownerId,
        ownerName,
        ownerPhotoUrl,
        ownerRating,
        availabilityDate,
        departureCity,
        destinationCity,
        price,
        paymentUnit,
        readyToNegotiate,
        paymentOptions,
        status,
        truckId,
        truckName,
        truckPhotoUrls,
        transportType,
        loadingTypes,
        truckWeight,
        truckHeight,
        truckWidth,
        truckDepth,
    } = ad.ad; // Деструктурируем из вложенного объекта ad.ad

    const { removeReviewAd, addReviewAd } = useContext(TransportAdContext);
    const [isSelectedAdItem, setIsSelectedAdItem] = useState(false);

    const [truckValue, setTruckValue] = useState(0);

    //добавление фото прямо из списка объявлений:
    const [onReviewAdsAdd, setOnReviewAdsAdd] = useState(false);

    useEffect(() => {
        if (truckWidth && truckHeight && truckDepth) {
            const tempWidth = Number(truckWidth);
            const tempHeight = Number(truckHeight);
            const tempDepth = Number(truckDepth);

            const truckValue = tempWidth * tempHeight * tempDepth;

            setTruckValue(() => cutNumber(truckValue)); // Обновляем состояние
        } else {
            setTruckValue(() => 0);
        }
    }, [
        transportType,
        truckWeight,
        truckWidth,
        truckHeight,
        truckDepth,
        loadingTypes,
    ]);

    useEffect(() => {
        // console.log(ad);
        if (truckWidth && truckHeight && truckDepth) {
            const tempWidth = Number(truckWidth);
            const tempHeight = Number(truckHeight);
            const tempDepth = Number(truckDepth);

            const truckValue = tempWidth * tempHeight * tempDepth;

            setTruckValue(() => cutNumber(truckValue)); // Обновляем состояние
        } else {
            setTruckValue(() => 0);
        }
    }, []);

    // выставляем пробелы между разрядами
    const formatNumber = (value) => {
        const textValue = String(value);

        return textValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    // Обрезаем по третий знак после запятой:
    const cutNumber = (num) => {
        // Умножение трех чисел
        const result = num; // Замените на ваше умножение

        // Обрезаем число до трех знаков после запятой
        const trimmed =
            Math.abs(result) < 1e-10 ? 0 : Number(result.toFixed(3));

        // Форматируем число с запятой
        return trimmed.toString().replace('.', ',');
    };

    const handleMouseEnterReviewAdsAdd = () => {
        setOnReviewAdsAdd(() => true);
    };
    const handleMouseLeaveReviewAdsAdd = () => {
        setOnReviewAdsAdd(() => false);
    };

    const handleToggle = (isAdded) => {
        if (isAdded) {
            addReviewAd(ad);
        } else {
            removeReviewAd(ad);
        }
    };

    return (
        <div
            className={`ad-item-container ad-item-container--${viewMode}`}
            onMouseEnter={() => setIsSelectedAdItem(() => true)}
            onMouseLeave={() => setIsSelectedAdItem(() => false)}
        >
            <div
                className={`ad-item-show-status ${isActive ? '' : 'no-active'}`}
            >
                {status === 'work' ? 'Занят' : null}
                {status === 'completed' ? 'Доставлено' : null}
            </div>
            <div
                className={`ad-item ${isViewMode ? 'view-mode' : ''} ad-item--${viewMode}  ${onReviewAdsAdd ? '' : 'ad-item-available-for-click'
                    }   ${isActive ? '' : 'ad-item-not-available'} ${isSelectedAdItem ? 'ad-item-mouse-enter' : ''
                    }`}
            >
                {isInReviewAds ? (
                    <>
                        <div className={`ad-item-show-in-review`}>
                            <FaCheck />
                        </div>
                        {/* <BookmarkIconSolid className='bookmark-icon-solid' /> */}
                    </>
                ) : (
                    // <BookmarkIconOutline className='bookmark-icon-outline ' />
                    ''
                )}

                {/* <div className='row'> */}
                <Link to={`/transport-ads/${adId}?type='transport'`}>
                    <div className='upper-ad-row'>
                        <div className='departure-location-date'>
                            <div className='availability-date'>{availabilityDate}</div>

                            <div className='departure-location'>
                                <span className='departure location city'>{departureCity}</span>

                                {(departureCity && (destinationCity || 'Россия')) && (
                                    <span className='location-sep' aria-hidden="true">→</span>
                                )}

                                <span className='destination city'>{destinationCity || 'Россия'}</span>
                            </div>
                        </div>

                        <div className='finance'>
                            <div className='price'>
                                {formatNumber(price)} {paymentUnit}
                            </div>
                            <div className='finance-details'>
                                {paymentOptions && paymentOptions.length > 0
                                    ? paymentOptions.map((option, index) => (
                                        <span key={option}>
                                            {option}
                                            {index < paymentOptions.length - 1
                                                ? ', '
                                                : ''}
                                        </span>
                                    ))
                                    : ''}
                                {readyToNegotiate && (
                                    <span>
                                        {paymentOptions.length > 0 ? ', ' : ''}
                                        торг
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='down-ad-row'>
                        <div className='car-info'>
                            <div className='car-photo-icon'>
                                {truckPhotoUrls && truckPhotoUrls[0] ? ( // Проверяем, есть ли фото
                                    <img
                                        src={truckPhotoUrls[0]}
                                        alt='Фото машины'
                                        className='photo-car' // Добавьте классы для стилизации
                                    />
                                ) : (
                                    <div className='icon-car'>
                                        <FaTruck />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div>
                                    {truckName ? `${truckName}, ` : ''}

                                    {transportType ? `${transportType}` : ''}
                                    {truckWeight ||
                                        loadingTypes.length !== 0 ||
                                        truckValue ? (
                                        <>{', '}</>
                                    ) : (
                                        ''
                                    )}

                                    {truckWeight ? (
                                        <>
                                            <strong>{truckWeight}т</strong>,{' '}
                                        </>
                                    ) : (
                                        ''
                                    )}

                                    {truckValue ? (
                                        <>
                                            <strong>
                                                {truckValue}м<sup>3</sup>
                                            </strong>
                                            {` (${truckWidth}м x ${truckHeight}м x ${truckDepth}м)`}
                                            {loadingTypes.length !== 0 ? (
                                                <>{', '}</>
                                            ) : (
                                                ''
                                            )}
                                        </>
                                    ) : (
                                        ''
                                    )}
                                </div>
                                <div>
                                    {loadingTypes.length !== 0 ? (
                                        <>
                                            <strong>загрузка: </strong>
                                            {loadingTypes.map(
                                                (loadingType, index) => (
                                                    <React.Fragment
                                                        key={loadingType}
                                                    >
                                                        {/* Используем React.Fragment для оборачивания */}
                                                        {loadingType}
                                                        {index <
                                                            loadingTypes.length -
                                                            1 && ', '}
                                                    </React.Fragment>
                                                )
                                            )}
                                        </>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='ad-user-info'>
                            <div className='ad-user-photo'>
                                {ownerPhotoUrl ? ( // Проверяем, есть ли фото
                                    <img
                                        src={ownerPhotoUrl}
                                        alt='Хозяин объявления'
                                        className='ad-photo-car-owner'
                                    />
                                ) : (
                                    <FaUser />
                                )}
                            </div>

                            <div className='ad-user-name-rating'>
                                <div className='ad-user-name'>{ownerName}</div>

                                {ownerRating ? (
                                    <div className='ad-user-rating'>
                                        ★ {ownerRating}
                                    </div>
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
                {/* </div> */}
            </div>
            {/* <div className='icon-item-ad-bar'> */}

            {isActive ? (
                <div
                    className={`container-icon-add ${isViewMode ? 'view-mode' : ''} container-icon-add--${viewMode}`}
                >
                    <div
                        onMouseLeave={handleMouseLeaveReviewAdsAdd}
                        onMouseEnter={handleMouseEnterReviewAdsAdd}
                    >
                        <ToggleIconButtonPlus
                            onToggle={handleToggle}
                            initialAdded={isInReviewAds}
                            isColored={isSelectedAdItem}
                        />
                    </div>
                </div>
            ) : (
                ''
            )}
            {/* </div> */}
        </div>
    );
};

export default TransportAdItem;
