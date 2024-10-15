import React from 'react';
import styles from './TransportAdItem.module.css';

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

const TransportAdItem = ({ ad }) => {
    return (
        <div className={styles.adItem}>
            <div className={styles.row}>
                <div className={`${styles.cell} ${styles.carInfo}`}>
                    <span className={styles.vehicleType}>
                        {ad.vehicleType ? `${ad.vehicleType}, ` : ''}
                    </span>

                    <span className={styles.volume}>
                        {ad.volume ? `${ad.volume} м3, ` : ''}
                    </span>

                    <span className={styles.bodyType}>
                        {ad.bodyType ? `${ad.bodyType}, ` : ''}
                    </span>

                    <span className={styles.loadingType}>
                        {ad.vehicleType ? `${ad.loadingType} ` : ''}
                    </span>
                </div>

                <div className={styles.cell}>
                    <span className={styles.location}>{ad.location}</span>
                    <span className={styles.availabilityDate}>
                        {ad.availabilityDate}
                    </span>
                </div>
                <div className={styles.cell}>
                    {ad.destination || 'Не указано'}
                </div>
                <div className={styles.cell}>{ad.price} руб.</div>
                {/* <div className={styles.cell}>{ad.contactInfo}</div> */}
            </div>
        </div>
    );
};

export default TransportAdItem;
