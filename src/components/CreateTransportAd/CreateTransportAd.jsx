import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { FaPlus } from 'react-icons/fa';

import AuthContext from '../../hooks/Authorization/AuthContext';
import TransportAdContext from '../../hooks/TransportAdContext';

import TransportAdItem from '../TransportAds/TransportAdItem';

import RouteSection from './RouteSection';
import PaymentSection from './PaymentSection';
import TransportSection from './TransportSection';

import Button from '../common/Button/Button';

// import TransportAdContext from '../../hooks/TransportAdContext'; // Импортируйте ваш TransportAdContext
// import TransportContext from '../../hooks/TransportContext'; // Импортируйте ваш TransportContext
import { TransportAd } from '../../entities/Ads/TransportAd';

import './CreateTransportAd.css'; // Импортируйте файл стилей

const CreateTransportAd = () => {
    const { user } = useContext(AuthContext);
    const { addAd } = useContext(TransportAdContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        ownerId: '',
        ownerName: '',
        ownerPhotoUrl: '',
        // ownerRating: user.userRating,
        ownerRating: 0,

        truckId: '',
        truckName: '',
        truckPhotoUrl: '',
        transportType: '',
        truckWeight: 0,
        truckHeight: 0,
        truckWidth: 0,
        truckDepth: 0,
        loadingTypes: [], // массив возможных типов загрузки
        availabilityDate: '', // дата, когда машина доступна
        departureCity: '', // город, где находится транспортное средство
        destinationCity: '', // предполагаемое направление (если есть)
        price: 0, // стоимость перевозки
        paymentUnit: '', // единица стоимости (тыс.руб, руб, руб/км и т.д.)
        readyToNegotiate: false, // готовность к торгу
        paymentOptions: [], // условия оплаты: нал, б/нал, с Ндс, без НДС и т.д.
    });

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                ownerId: user.userId,
                ownerName: user.userName,
                ownerPhotoUrl: user.userPhoto,
                ownerRating: user.userRating || 3.5, // Если у user нет рейтинга, по умолчанию 3.5
            }));
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                ownerId: user.userId,
                ownerName: user.userName,
                ownerPhotoUrl: user.userPhoto,
                ownerRating: user.userRating || 3.5, // Если у user нет рейтинга, по умолчанию 3.5
            }));
        }
    }, []);

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

            // ownerId: 'user123', // TODO Замените на реальный ownerId
            ownerId: formData.ownerId,
            ownerName: formData.ownerName,
            ownerPhotoUrl: formData.ownerPhotoUrl,
            // ownerRating: formData.userRating,
            ownerRating: 3.5,

            availabilityDate: formData.availabilityDate,
            //  ||
            // new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),

            departureCity: formData.departureCity,
            destinationCity: formData.destinationCity,

            paymentUnit: formData.paymentUnit,
            price: Number(formData.price),
            readyToNegotiate: formData.readyToNegotiate,
            status: 'active',

            paymentOptions:
                formData.paymentOptions.length > 0
                    ? formData.paymentOptions
                    : '',

            truckId: Date.now(), // TODO Замените на реальный truckId
            truckName: formData.truckName,
            truckPhotoUrl: formData.truckPhotoUrl,
            transportType: formData.transportType,

            loadingTypes:
                formData.loadingTypes.length > 0 ? formData.loadingTypes : '',
            truckWeight: Number(formData.truckWeight),
            truckHeight: Number(formData.truckHeight),
            truckWidth: Number(formData.truckWidth),
            truckDepth: Number(formData.truckDepth),
        });

        console.log('Созданное объявление:', newTransportAd);
        // Здесь вы можете отправить данные в базу данных позже

        try {
            const result = addAd(newTransportAd);

            if (result) {
                navigate('/'); // Перенаправление на главную страницу
            }
        } catch (error) {
            console.error('Ошибка при создании объявления:', error);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className='create-transport-ad-form'
        >
            <h2>Новое объявление</h2>
            <div className='new-ad-show'>
                <div className='ad-example'>
                    <TransportAdItem
                        ad={{
                            ad: formData,
                            isInReviewAds: false,
                        }}
                        // rating='4'
                        isViewMode={true}
                    />
                </div>
                <div className='button-submit-ad-div'>
                    {/* <button type='submit'>Создать объявление</button> */}
                    <Button
                        type='submit'
                        type_btn='yes'
                        children='Разместить'
                        icon={<FaPlus />} // Передача иконки
                    />
                </div>
            </div>
            <h3>Введите данные: </h3>
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
        </form>
    );
};

export default CreateTransportAd;
