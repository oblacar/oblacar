import React, { useRef, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { TransportAd } from '../../entities/Ads/TransportAd';

// import AuthContext from '../../hooks/Authorization/AuthContext';
import UserContext from '../../hooks/UserContext';
import TransportAdContext from '../../hooks/TransportAdContext';

import TransportAdItem from '../TransportAds/TransportAdItem';

import RouteSection from './RouteSection';
import PaymentSection from './PaymentSection';
import TransportSection from './TransportSection';

import './CreateTransportAd.css'; // Импортируйте файл стилей
import Button from '../common/Button/Button';
import { FaPlus } from 'react-icons/fa';

const CreateTransportAd = () => {
    const { user } = useContext(UserContext);
    const { addAd } = useContext(TransportAdContext);

    //ссылка на разделы для отработки валидации заполнения форм
    const routeSectionRef = useRef();
    const paymentSectionRef = useRef();

    //TODO Пока не используем переброску на главную страницу
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        ownerId: '',
        ownerName: '',
        ownerPhotoUrl: '',
        // ownerRating: user.userRating,
        ownerRating: 0,

        truckId: '',
        truckName: '',
        truckPhotoUrls: [],
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
                ownerRating: user.userRating || 3.5, // TODO. Если у user нет рейтинга, по умолчанию 3.5
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
                ownerRating: user.userRating || 3.5, // TODO. Если у user нет рейтинга, по умолчанию 3.5
            }));
        }
    }, []);

    const updateFormData = (newData) => {
        setFormData((prevState) => ({
            ...prevState,
            ...newData,
        }));

        // console.log(newData);
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Предотвращаем стандартное поведение формы

        let isValid = routeSectionRef.current.validateFields();
        if (!isValid) {
            return;
        }

        isValid = paymentSectionRef.current.validateFields();
        if (!isValid) {
            return;
        }

        // Создание нового объекта транспортного объявления
        const newTransportAd = new TransportAd({
            adId: Date.now(), // TODO Пример генерации уникального ID

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
            truckPhotoUrls:
                formData.truckPhotoUrls.length > 0
                    ? formData.truckPhotoUrls
                    : '',

            transportType: formData.transportType,

            loadingTypes:
                formData.loadingTypes.length > 0 ? formData.loadingTypes : '',

            truckWeight: Number(formData.truckWeight),
            truckHeight: Number(formData.truckHeight),
            truckWidth: Number(formData.truckWidth),
            truckDepth: Number(formData.truckDepth),
        });

        // Здесь вы можете отправить данные в базу данных позже
        // console.log('Создано новое объявление:', newTransportAd);

        try {
            const result = addAd(newTransportAd);

            // if (result) {
            //     navigate('/'); // TODO. Нужно подумать, а правильно ли перекидывать на главную страниуц.
            // }
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
                        isViewMode={true}
                    />
                </div>
                <div className='button-submit-ad-div'>
                    <Button
                        type='submit'
                        type_btn='yes'
                        children='Разместить'
                        icon={<FaPlus />}
                    />
                </div>
            </div>
            <h3>Введите данные: </h3>
            <div className='new-transport-ad'>
                <RouteSection
                    ref={routeSectionRef}
                    updateFormData={updateFormData}
                    formData={formData}
                />

                <PaymentSection
                    ref={paymentSectionRef}
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
