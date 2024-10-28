// src/components/AdProfile/AdProfile.js

import React from 'react';
import './AdProfile.css';
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';

const AdProfile = ({ ad, onSendRequest, onMessage, userType }) => {
    // Тестовые данные объявления
    const testAd = {
        truckName: 'Mercedes-Benz Actros',
        loadingTypes: 'боковая',
        truckWeight: '20 000 кг',
        truckDimensions: '2.5 x 3 x 8 м',
        departureCity: 'Москва',
        destinationCity: 'Санкт-Петербург',
        availabilityDate: '2024-11-01',
        price: '5000 ₽',
        paymentUnit: 'за поездку',
        ownerName: 'Алексей Иванов',
    };

    const adData = ad || testAd;

    return (
        <div className='ad-profile'>
            <h2>{adData.truckName}</h2>
            <div className='ad-profile-details'>
                <p>
                    <strong>Загрузка:</strong> {adData.loadingTypes}
                </p>
                <p>
                    <strong>Грузоподъемность:</strong> {adData.truckWeight}
                </p>
                <p>
                    <strong>Габариты:</strong> {adData.truckDimensions}
                </p>
                <p>
                    <strong>Откуда:</strong> {adData.departureCity}
                </p>
                <p>
                    <strong>Куда:</strong> {adData.destinationCity}
                </p>
                <p>
                    <strong>Дата:</strong> {adData.availabilityDate}
                </p>
                <p>
                    <strong>Цена:</strong> {adData.price} {adData.paymentUnit}
                </p>
                <p>
                    <strong>Владелец:</strong> {adData.ownerName}
                </p>
            </div>

            {userType === 'cargoOwner' ? (
                <div className='ad-profile-actions'>
                    <button
                        className='ad-profile-request-btn'
                        onClick={() => onSendRequest(adData)}
                    >
                        Отправить запрос владельцу
                    </button>
                    <button
                        className='ad-profile-message-btn'
                        onClick={onMessage}
                    >
                        <FaEnvelope /> Написать владельцу
                    </button>
                </div>
            ) : userType === 'transportOwner' ? (
                <div className='ad-profile-actions'>
                    <button
                        className='ad-profile-approve-btn'
                        onClick={() => onSendRequest(adData, 'approve')}
                    >
                        <FaCheck /> Подтвердить запрос
                    </button>
                    <button
                        className='ad-profile-decline-btn'
                        onClick={() => onSendRequest(adData, 'decline')}
                    >
                        <FaTimes /> Отклонить запрос
                    </button>
                </div>
            ) : null}
        </div>
    );
};

export default AdProfile;
