// Очень важный компонент. Используется для превью, списка объявлений и т.п.

import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './TransportAdItem.css';
import {
    FaTruck,
    FaUser,
    FaCheck, // оставлен на случай, если где-то ещё используете
} from 'react-icons/fa';

import TransportAdContext from '../../hooks/TransportAdContext';
import AuthContext from '../../hooks/Authorization/AuthContext';

import IconWithTooltip from '../common/IconWithTooltip/IconWithTooltip';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

import SingleRatingStar from '../common/SingleRatingStar/SingleRatingStar';
import { NumberSchema } from 'yup';

const TransportAdItem = ({
    ad,
    isViewMode = false,
    // hasAddToVariantsBtn = true,
    // isHovered = true,
    // isClickable = true,
    isActive = true,
    viewMode = 'list',  // 'list' | 'grid'
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

    // локальный статус «в Вариантах» (оптимистичный апдейт)
    const [inReview, setInReview] = useState(!!isInReviewAds);
    useEffect(() => { setInReview(!!isInReviewAds); }, [isInReviewAds]);

    useEffect(() => {
        if (truckWidth && truckHeight && truckDepth) {
            const tempWidth = Number(truckWidth);
            const tempHeight = Number(truckHeight);
            const tempDepth = Number(truckDepth);
            const truckValue = tempWidth * tempHeight * tempDepth;
            setTruckValue(() => cutNumber(truckValue));
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
        if (truckWidth && truckHeight && truckDepth) {
            const tempWidth = Number(truckWidth);
            const tempHeight = Number(truckHeight);
            const tempDepth = Number(truckDepth);
            const truckValue = tempWidth * tempHeight * tempDepth;
            setTruckValue(() => cutNumber(truckValue));
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
        const result = num;
        const trimmed = Math.abs(result) < 1e-10 ? 0 : Number(result.toFixed(3));
        return trimmed.toString().replace('.', ',');
    };

    const handleToggleReviewAd = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (inReview) {
            removeReviewAd(ad);
        } else {
            addReviewAd(ad);
        }
        setInReview((v) => !v); // оптимистично
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

            {/* Флажок «Варианты» (как в объявлении Груза) */}
            {isActive ? (
                <div
                    className={`transport-ad-book-mark oap-in-review ${inReview ? 'oap-in-review--is-active' : ''}`}
                    onClick={handleToggleReviewAd}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    role="button"
                    tabIndex={0}
                    aria-label={inReview ? 'Убрать из Вариантов' : 'Добавить в Варианты'}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleToggleReviewAd(e);
                    }}
                >
                    <IconWithTooltip
                        icon={inReview ? FaBookmark : FaRegBookmark}
                        tooltipText={inReview ? 'Убрать из Вариантов' : 'Добавить в Варианты'}
                        size="18px"
                    />
                </div>
            ) : null}

            <div
                className={`ad-item ${isViewMode ? 'view-mode' : ''} ad-item--${viewMode} ${isActive ? '' : 'ad-item-not-available'} ${isSelectedAdItem ? 'ad-item-mouse-enter' : ''}`}
            >
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
                                {formatNumber(price)} <span className='price-unit'>
                                    {paymentUnit}
                                </span>
                            </div>
                            <div className='finance-details'>
                                {paymentOptions && paymentOptions.length > 0 && paymentOptions.map((option) => (
                                    <span key={option} className="finance-tag">{option}</span>
                                ))}

                                {readyToNegotiate && (
                                    <span className="finance-tag finance-tag--deal">торг</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='down-ad-row'>
                        <div className='car-info'>
                            <div className='car-photo-icon'>
                                {truckPhotoUrls && truckPhotoUrls[0] ? (
                                    <img
                                        src={truckPhotoUrls[0]}
                                        alt='Фото машины'
                                        className='photo-car'
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
                                    {truckWeight || loadingTypes.length !== 0 || truckValue ? (<> , </>) : ''}

                                    {truckWeight ? (<><strong>{truckWeight}т</strong>, </>) : ''}

                                    {truckValue ? (
                                        <>
                                            <strong>
                                                {truckValue}м<sup>3</sup>
                                            </strong>
                                            {` (${truckWidth}м x ${truckHeight}м x ${truckDepth}м)`}
                                            {loadingTypes.length !== 0 ? (<> , </>) : ''}
                                        </>
                                    ) : ('')}
                                </div>
                                <div>
                                    {loadingTypes.length !== 0 ? (
                                        <>
                                            <strong>загрузка: </strong>
                                            {loadingTypes.map((loadingType, index) => (
                                                <React.Fragment key={loadingType}>
                                                    {loadingType}
                                                    {index < loadingTypes.length - 1 && ', '}
                                                </React.Fragment>
                                            ))}
                                        </>
                                    ) : ('')}
                                </div>
                            </div>
                        </div>

                        <div className='ad-user-info'>
                            <div className='ad-user-photo'>
                                {ownerPhotoUrl ? (
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
                                ) : ('')}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default TransportAdItem;
