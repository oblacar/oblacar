import React, { useContext, useEffect, useState } from 'react';
import './TransportAdItem.css';
import { FaTruck, FaUserCircle } from 'react-icons/fa';

import SingleRatingStar from '../common/SingleRatingStar/SingleRatingStar';
import { NumberSchema } from 'yup';

//ad:{
//         truckName: '',
//         truckPhoto: '',
//        * height: '',
//        * width: '',
//        * depth: '',
//        * weight: '',
//        * transportType: '',
//        * loadingTypes: [], // массив возможных типов загрузки
//        * availabilityDate: '', // дата, когда машина доступна
//        * departureCity: '', // город, где находится транспортное средство
//        * destinationCity: '', // предполагаемое направление (если есть)
//        * price: '', // стоимость перевозки
//        * paymentUnit: '', // единица стоимости (тыс.руб, руб, руб/км и т.д.)
//        * readyToNegotiate: false, // готовность к торгу
//        * paymentOptions: [], // условия оплаты: нал, б/нал, с Ндс, без НДС и т.д.
//}

const TransportAdItem = ({ ad, rating, isViewMode }) => {
    const [truckValue, setTruckValue] = useState(0);

    useEffect(() => {
        if (ad.width && ad.height && ad.depth) {
            const tempWidth = Number(ad.width);
            const tempHeight = Number(ad.height);
            const tempDepth = Number(ad.depth);

            const truckValue = tempWidth * tempHeight * tempDepth;

            console.log('tempDepth = ', truckValue);

            setTruckValue(() => truckValue); // Обновляем состояние
        } else {
            setTruckValue(() => 0);
        }
    }, [
        ad.transportType,
        ad.truckWeight,
        ad.truckWidth,
        ad.truckHeight,
        ad.truckDepth,
        ad.loadingTypes,
    ]);

    useEffect(() => {
        console.log(ad);
        if (ad.truckWidth && ad.truckHeight && ad.truckDepth) {
            const tempWidth = Number(ad.truckWidth);
            const tempHeight = Number(ad.truckHeight);
            const tempDepth = Number(ad.truckDepth);

            const truckValue = tempWidth * tempHeight * tempDepth;

            console.log('tempDepth = ', truckValue);

            setTruckValue(() => truckValue); // Обновляем состояние
        } else {
            setTruckValue(() => 0);
        }
    }, []);

    // выставляем пробелы между разрядами
    const formatNumber = (value) => {
        const textValue = String(value);

        console.log(textValue);

        return textValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    return (
        <div className={`ad-item ${isViewMode ? 'view-mode' : ''}`}>
            {/* <div className={`row ${rowColor}`}> */}
            <div className='row'>
                <div className='upper-ad-row'>
                    <div className='rating-star'>
                        {/* TODO временная реализация отображения объявлений без рейтинга */}
                        {rating < 2 ? null : (
                            <SingleRatingStar rating={rating} />
                        )}
                    </div>
                    <div className='departure-location-date'>
                        <div className='availability-date'>
                            {ad.availabilityDate}
                        </div>
                        <div className='departure-location'>
                            <span className='departure location city'>
                                {ad.departureCity}
                            </span>
                            <span className='destination city'>
                                {ad.destinationCity || 'Россия'}
                            </span>
                        </div>
                    </div>
                    <div className='finance'>
                        <div className='price'>
                            {formatNumber(ad.price)} {ad.paymentUnit}
                        </div>
                        <div className='finance-details'>
                            {ad.paymentOptions && ad.paymentOptions.length > 0
                                ? ad.paymentOptions.map((option, index) => (
                                      <span key={option}>
                                          {option}
                                          {index < ad.paymentOptions.length - 1
                                              ? ', '
                                              : ''}
                                      </span>
                                  ))
                                : ''}
                            {ad.readyToNegotiate && (
                                <span>
                                    {ad.paymentOptions.length > 0 ? ', ' : ''}
                                    торг
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className='down-ad-row'>
                    <div className='car-photo-icon'>
                        {ad.truckPhoto ? ( // Проверяем, есть ли фото
                            <img
                                src={ad.truckPhoto}
                                alt='Фото машины'
                                className='photo-car' // Добавьте классы для стилизации
                            />
                        ) : (
                            <div className='icon-car'>
                                <FaTruck />
                            </div>
                        )}
                    </div>
                    <div className=' car-info'>
                        <span>
                            {ad.transportType ? `${ad.transportType}` : ''}
                            {ad.weight ||
                            ad.loadingTypes.length !== 0 ||
                            truckValue ? (
                                <>{', '}</>
                            ) : (
                                ''
                            )}
                        </span>
                        <span>
                            {ad.weight ? (
                                <>
                                    <strong>{ad.weight}т</strong>,{' '}
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
                                    {` (${ad.truckWidth}м x ${ad.truckHeight}м x ${ad.truckDepth}м)`}
                                    {ad.loadingTypes.length !== 0 ? (
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
                            {ad.loadingTypes.length !== 0 ? (
                                <>
                                    <strong>загрузка: </strong>
                                    {ad.loadingTypes.map(
                                        (loadingType, index) => (
                                            <React.Fragment key={loadingType}>
                                                {/* Используем React.Fragment для оборачивания */}
                                                {loadingType}
                                                {index <
                                                    ad.loadingTypes.length -
                                                        1 && ', '}
                                            </React.Fragment>
                                        )
                                    )}
                                </>
                            ) : (
                                ''
                            )}
                        </span>
                    </div>
                    <div className='icon-item-ad-bar'>
                        {/* <div className='icon-driver'>
                            <FaUserCircle />
                        </div> */}
                        <div
                            className={`container-icon-add ${
                                isViewMode ? 'view-mode' : ''
                            }`}
                        >
                            <div className='icon-add'>Запомнить</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportAdItem;
