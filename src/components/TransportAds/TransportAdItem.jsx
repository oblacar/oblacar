import React, { useContext, useEffect, useState } from 'react';
import './TransportAdItem.css';
import { FaTruck, FaUser, FaUserCircle } from 'react-icons/fa';

import TransportAdContext from '../../hooks/TransportAdContext';
import AuthContext from '../../hooks/Authorization/AuthContext';

import ToggleIconButtonPlus from '../common/ToggleIconButtonPlus/ToggleIconButtonPlus';

import SingleRatingStar from '../common/SingleRatingStar/SingleRatingStar';
import { NumberSchema } from 'yup';

//ad:{
//         truckName: '',
//         truckPhoto: '',
//        * truckHeight: '',
//        * truckWidth: '',
//        * truckDepth: '',
//        * truckWeight: '',
//        * transportType: '',
//        * loadingTypes: [], // массив возможных типов загрузки
//        * availabilityDate: '', // дата, когда машина доступна
//        * departureCity: '', // город, где находится транспортное средство
//        * destinationCity: '', // предполагаемое направление (если есть)
//        * price: '', // стоимость перевозки
//        * paymentUnit: '', // единица стоимости (тыс.руб, руб, руб/км и т.д.)
//        * readyToNegotiate: false, // готовность к торгу
//        * paymentOptions: [], // условия оплаты: нал, б/нал, с Ндс, без НДС и т.д.
//        * userName
//      userPhotoUrl
//        * userRating
//}

const TransportAdItem = ({ ad, isViewMode }) => {
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
        truckId,
        truckName,
        truckPhotoUrl,
        transportType,
        loadingTypes,
        truckWeight,
        truckHeight,
        truckWidth,
        truckDepth,
    } = ad.ad; // Деструктурируем из вложенного объекта ad.ad

    const { removeReviewAd, addReviewAd } = useContext(TransportAdContext);
    const { user } = useContext(AuthContext);

    const [truckValue, setTruckValue] = useState(0);

    //добавление фото прямо из списка объявлений:
    const [onReviewAdsAdd, setOnReviewAdsAdd] = useState(false);

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedPhoto(reader.result);
                // Здесь можно также обновить состояние контекста или родительского компонента
                // updateFormData({ truckPhotoUrl: reader.result });
            };

            reader.readAsDataURL(file);

            ad.truckPhotoUrl = file; // Прямое изменение объекта, вы можете использовать метод, если он у вас есть

            console.log(ad);
        }
    };

    const handleClick = () => {
        document.getElementById(`fileInput-${adId}`).click(); // Программный клик по скрытому инпуту
    };
    //<----

    useEffect(() => {
        if (truckWidth && truckHeight && truckDepth) {
            const tempWidth = Number(truckWidth);
            const tempHeight = Number(truckHeight);
            const tempDepth = Number(truckDepth);

            const truckValue = tempWidth * tempHeight * tempDepth;

            // console.log('tempDepth = ', truckValue);

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
            className={`ad-item ${isViewMode ? 'view-mode' : ''} ${
                onReviewAdsAdd ? '' : 'active'
            }`}
        >
            {/* <div className={`row ${rowColor}`}> */}
            <div className='row'>
                <div className='upper-ad-row'>
                    {/* <div className='rating-star'>
                        {rating < 2 ? null : (
                            <SingleRatingStar rating={rating} />
                        )}
                    </div> */}
                    <div className='departure-location-date'>
                        <div className='availability-date'>
                            {availabilityDate}
                        </div>
                        <div className='departure-location'>
                            <span className='departure location city'>
                                {departureCity}
                            </span>
                            <span className='destination city'>
                                {destinationCity || 'Россия'}
                            </span>
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
                    <div className='car-photo-icon'>
                        {truckPhotoUrl ? ( // Проверяем, есть ли фото
                            <img
                                src={truckPhotoUrl}
                                alt='Фото машины'
                                className='photo-car' // Добавьте классы для стилизации
                            />
                        ) : (
                            <div className='icon-car'>
                                <FaTruck />
                            </div>
                        )}
                    </div>
                    {/* В этом режиме можем добавить фото машины */}
                    {/* <div
                        className='car-photo-icon'
                        onClick={handleClick}
                    >
                        {selectedPhoto || ad.truckPhoto ? ( // Проверяем, есть ли фото
                            <img
                                src={selectedPhoto || ad.truckPhoto}
                                alt='Фото машины'
                                className='photo-car' // Добавьте классы для стилизации
                            />
                        ) : (
                            <div className='icon-car'>
                                <FaTruck />
                            </div>
                        )}
                        <input
                            type='file'
                            id={`fileInput-${ad.adId}`} // Уникальный ID для каждого инпута
                            style={{ display: 'none' }} // Скрываем стандартное поле ввода
                            onChange={handleFileChange}
                            accept='image/*' // Указываем, что это изображение
                        />
                    </div> */}

                    <div className=' car-info'>
                        <span>
                            {transportType ? `${transportType}` : ''}
                            {truckWeight ||
                            loadingTypes.length !== 0 ||
                            truckValue ? (
                                <>{', '}</>
                            ) : (
                                ''
                            )}
                        </span>
                        <span>
                            {truckWeight ? (
                                <>
                                    <strong>{truckWeight}т</strong>,{' '}
                                </>
                            ) : (
                                ''
                            )}
                        </span>
                        <span>
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
                        </span>

                        <span>
                            {loadingTypes.length !== 0 ? (
                                <>
                                    <strong>загрузка: </strong>
                                    {loadingTypes.map((loadingType, index) => (
                                        <React.Fragment key={loadingType}>
                                            {/* Используем React.Fragment для оборачивания */}
                                            {loadingType}
                                            {index < loadingTypes.length - 1 &&
                                                ', '}
                                        </React.Fragment>
                                    ))}
                                </>
                            ) : (
                                ''
                            )}
                        </span>
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

                    <div className='icon-item-ad-bar'>
                        <div
                            className={`container-icon-add ${
                                isViewMode ? 'view-mode' : ''
                            }`}
                        >
                           
                            <div
                                onMouseLeave={handleMouseLeaveReviewAdsAdd}
                                onMouseEnter={handleMouseEnterReviewAdsAdd}
                            >
                                <ToggleIconButtonPlus
                                    onToggle={handleToggle}
                                    initialAdded={false}
                                />
                            </div>
                            {/* <div
                                className={`icon-add ${
                                    isInReviewAds ? 'in-review-ads' : ''
                                }`}
                                onMouseEnter={handleMouseEnterReviewAdsAdd}
                                onMouseLeave={handleMouseLeaveReviewAdsAdd}
                                onClick={() => {
                                    isInReviewAds
                                        ? removeReviewAd(ad)
                                        : addReviewAd(ad);
                                }}
                            >
                                {isInReviewAds ? 'Убрать' : 'Запомнить'}
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportAdItem;
