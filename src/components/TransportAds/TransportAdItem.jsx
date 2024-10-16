import React from 'react';
import './TransportAdItem.css';
import {
    FaTruck,
    FaUserCircle,
    FaPlus,
    FaCartPlus,
    FaFolderPlus,
    FaCheckSquare,
    FaHandshake,
    FaReceipt,
} from 'react-icons/fa';

import SingleRatingStar from '../common/SingleRatingStar/SingleRatingStar';

/*тентованный, 20 т, 90 м3, полупр.
верх., бок., задн.*/

//         this.vehicleType = vehicleType; // тип транспортного средства (например, грузовик, фура)
//         this.volume = volume; // объем
//         this.bodyType = bodyType; // тип кузова
//         this.loadingType = loadingType; // тип загрузки

//  this.adId = adId; // уникальный идентификатор объявления
//         this.ownerId = ownerId; // идентификатор владельца машины
//         this.availabilityDate = availabilityDate; // дата, когда машина доступна
//         this.location = location; // город, где находится транспортное средство
//         this.destination = destination; // предполагаемое направление (если есть)
//         this.price = price; // стоимость перевозки
//         this.payment = payment; // оплата
//         // this.description = description; // описание состояния и особенностей машины
//         this.contactInfo = contactInfo; // информация для связи с владельцем

const TransportAdItem = ({ ad, rating }) => {
    return (
        <div className='ad-item'>
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
                            {/* <div className='cell departure'>
                            </div> */}
                            <span className='departure location city'>
                                {ad.location}
                            </span>
                            <span className='destination city'>
                                {ad.destination || 'Не указано'}
                            </span>
                            {/* <div className='cell'>
                            </div> */}
                        </div>
                    </div>
                    <div className='finance'>
                        <div className='price'>{ad.price} руб.</div>
                        <div className='finance-details'>без НДС, торгуемся</div>
                    </div>
                </div>
                <div className='down-ad-row'>
                    <div className='icon-car'>
                        <FaTruck />
                    </div>
                    <div className=' car-info'>
                        <span className='vehicleType'>
                            {ad.vehicleType ? `${ad.vehicleType}, ` : ''}
                        </span>

                        <span className='volume'>
                            {ad.volume ? `${ad.volume} м3, ` : ''}
                        </span>

                        <span className='body-type'>
                            {ad.bodyType ? `${ad.bodyType}, ` : ''}
                        </span>

                        <span className='loading-type'>
                            {ad.vehicleType ? `${ad.loadingType} ` : ''}
                        </span>
                    </div>
                    <div className='icon-item-ad-bar'>
                        {/* <div className='icon-driver'>
                            <FaUserCircle />
                        </div> */}
                        <div className='container-icon-add'>
                            <div className='icon-add'>Запомнить</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportAdItem;
