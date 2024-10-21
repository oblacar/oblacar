import React, { useState } from 'react';

import RouteSection from './RouteSection';
import PaymentSection from './PaymentSection';
import TransportSection from './TransportSection';

// import TransportAdContext from '../../hooks/TransportAdContext'; // Импортируйте ваш TransportAdContext
// import TransportContext from '../../hooks/TransportContext'; // Импортируйте ваш TransportContext
import { TransportAd } from '../../entities/Ads/TransportAd';

import './CreateTransportAd.css'; // Импортируйте файл стилей

const CreateTransportAd = () => {
    const [formData, setFormData] = useState({
        truckName: '',
        truckPhoto: '',
        height: '',
        width: '',
        depth: '',
        weight: '',
        transportType: '',
        loadingTypes: [], // массив возможных типов загрузки
        availabilityDate: '', // дата, когда машина доступна
        departureCity: '', // город, где находится транспортное средство
        destinationCity: '', // предполагаемое направление (если есть)
        price: '', // стоимость перевозки
        paymentUnit: '', // единица стоимости (тыс.руб, руб, руб/км и т.д.)
        readyToNegotiate: false, // готовность к торгу
        paymentOptions: [], // условия оплаты: нал, б/нал, с Ндс, без НДС и т.д.
    });

    const updateFormData = (newData) => {
        setFormData((prevState) => ({
            ...prevState,
            ...newData,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Предотвращаем стандартное поведение формы

        // Создание нового объекта транспортного объявления
        const newTransportAd = new TransportAd({
            adId: Date.now(), // TODO Пример генерации уникального ID
            ownerId: 'user123', // TODO Замените на реальный ownerId
            availabilityDate: formData.availabilityDate,
            departureCity: formData.departureCity,
            destinationCity: formData.destinationCity,
            price: formData.price,
            paymentUnit: formData.paymentUnit,
            readyToNegotiate: formData.readyToNegotiate,
            paymentOptions: formData.paymentOptions,
            truckId: 'truck456', // TODO Замените на реальный truckId
            truckName: formData.truckName,
            truckPhotoUrl: formData.truckPhoto,
            vehicleType: formData.transportType,
            loadingTypes: formData.loadingTypes,
            truckWeight: formData.weight,
            truckHeight: formData.height,
            truckWidth: formData.width,
            truckDepth: formData.depth,
        });

        console.log('Созданное объявление:', newTransportAd);
        // Здесь вы можете отправить данные в базу данных позже
    };

    return (
        <form
            onSubmit={handleSubmit}
            className='create-transport-ad-form'
        >
            <h2>Новое объявление</h2>
            <div className='new-transport-ad'>
                <RouteSection
                    updateFormData={updateFormData}
                    formData={formData}
                />

                <PaymentSection
                    updateFormData={updateFormData}
                    formData={formData}
                />

                <TransportSection
                    updateFormData={updateFormData}
                    formData={formData}
                />
            </div>

            <button type='submit'>Создать объявление</button>
        </form>
    );
};

export default CreateTransportAd;
