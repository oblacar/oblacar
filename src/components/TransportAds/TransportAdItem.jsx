import React from 'react';
import styles from './TransportAdItem.css';

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

const TransportAdItem = ({ ad, rowColor }) => {
    return (
        <div className='adItem'>
            <div className={`row ${rowColor}`}>
                <div className='cell carInfo'>
                    <span className='vehicleType'>
                        {ad.vehicleType ? `${ad.vehicleType}, ` : ''}
                    </span>

                    <span className='volume'>
                        {ad.volume ? `${ad.volume} м3, ` : ''}
                    </span>

                    <span className='bodyType'>
                        {ad.bodyType ? `${ad.bodyType}, ` : ''}
                    </span>

                    <span className='loadingType'>
                        {ad.vehicleType ? `${ad.loadingType} ` : ''}
                    </span>
                </div>

                <div className='cell'>
                    <span className='location'>{ad.location}</span>
                    <span className='availabilityDate'>
                        {ad.availabilityDate}
                    </span>
                </div>
                <div className='cell'>
                    <span className='destination'>
                        {ad.destination || 'Не указано'}
                    </span>
                </div>
                <div className='cell'>
                    <span className='price'>{ad.price} руб.</span>
                </div>
                {/* <div className={styles.cell}>{ad.contactInfo}</div> */}
            </div>
        </div>
    );
};

export default TransportAdItem;
