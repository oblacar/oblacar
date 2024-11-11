import React, { useRef, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { TransportAd } from '../../entities/Ads/TransportAd';
import UserContext from '../../hooks/UserContext';
import TransportAdContext from '../../hooks/TransportAdContext';

import TransportAdItem from '../TransportAds/TransportAdItem';
import RouteSection from './RouteSection';
import PaymentSection from './PaymentSection';
import TransportSection from './TransportSection';
import Overlay from '../common/Overlay/Overlay';
import ConfirmationDialog from '../common/ConfirmationDialog/ConfirmationDialog';

import './CreateTransportAd.css';
import Button from '../common/Button/Button';
import { FaPlus, FaPen } from 'react-icons/fa';

const InitialTransportAdData = {
    ownerId: '',
    ownerName: '',
    ownerPhotoUrl: '',
    ownerRating: 0,
    truckId: '',
    truckName: '',
    truckPhotoUrls: [],
    transportType: '',
    truckWeight: 0,
    truckHeight: 0,
    truckWidth: 0,
    truckDepth: 0,
    loadingTypes: [],
    availabilityDate: '',
    departureCity: '',
    destinationCity: '',
    price: 0,
    paymentUnit: '',
    readyToNegotiate: false,
    paymentOptions: [],
};

const CreateTransportAd = () => {
    const { user } = useContext(UserContext);
    const { addAd } = useContext(TransportAdContext);

    const [isReadyForNewAd, setIsReadyForNewAd] = useState(true);

    // const navigate = useNavigate();

    // Ссылки на разделы для валидации
    const routeSectionRef = useRef();
    const paymentSectionRef = useRef();
    const transportSectionRef = useRef();

    // Состояние данных формы
    const [formData, setFormData] = useState(InitialTransportAdData);

    // Управление показом Overlay
    const [isOverlayVisible, setOverlayVisible] = useState(false);

    // Установка данных пользователя
    useEffect(() => {
        if (user) {
            // setFormData((prev) => ({
            //     ...prev,
            //     ownerId: user.userId,
            //     ownerName: user.userName,
            //     ownerPhotoUrl: user.userPhoto,
            //     ownerRating: user.userRating || 3.5,
            // }));
            setAdOwnerData();
        }
    }, [user]);

    const setAdOwnerData = () => {
        setFormData((prev) => ({
            ...prev,
            ownerId: user.userId,
            ownerName: user.userName,
            ownerPhotoUrl: user.userPhoto,
            ownerRating: user.userRating || 3.5,
        }));
    };

    const updateFormData = (newData) => {
        setFormData((prevState) => ({
            ...prevState,
            ...newData,
        }));
    };

    // Открытие подтверждающего окна при отправке
    const handleOpenConfirmation = (e) => {
        e.preventDefault();
        let isValid = routeSectionRef.current.validateFields();
        if (!isValid) return;

        isValid = paymentSectionRef.current.validateFields();
        if (!isValid) return;

        isValid = transportSectionRef.current.validateFields();
        if (!isValid) return;

        // Показываем Overlay и подтверждающий диалог
        setOverlayVisible(true);
    };

    // Отправка данных при подтверждении
    const handleConfirmPlacement = () => {
        const newTransportAd = new TransportAd({
            adId: Date.now(),
            ...formData,
            status: 'active',
        });

        try {
            addAd(newTransportAd);
            // navigate('/');/TODO не факт, что нужен принудильный переход на главную. Нужно подумать.
            setIsReadyForNewAd(false);
        } catch (error) {
            console.error('Ошибка при создании объявления:', error);
        } finally {
            setOverlayVisible(false);
        }
    };

    const handleCloseOverlay = () => setOverlayVisible(false);

    const handlePreparingForNewAdCreation = () => {
        setIsReadyForNewAd(true);
        setFormData(InitialTransportAdData);
        setAdOwnerData();
    };

    return (
        <>
            <form
                onSubmit={handleOpenConfirmation}
                className='create-transport-ad-form'
            >
                {isReadyForNewAd ? (
                    <h2>Новое объявление</h2>
                ) : (
                    <h2>Объявление размещено!</h2>
                )}

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
                        {isReadyForNewAd ? (
                            <Button
                                type='submit'
                                type_btn='yes'
                                icon={<FaPlus />}
                            >
                                Разместить
                            </Button>
                        ) : (
                            <>
                                {/* <Button
                                    type='button'
                                    icon={<FaPen />}
                                    children='Создать новое'
                                    onClick={handlePreparingForNewAdCreation}
                                /> */}
                            </>
                        )}
                    </div>
                </div>

                {isReadyForNewAd ? (
                    <>
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
                                ref={transportSectionRef}
                                updateFormData={updateFormData}
                                formData={formData}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <Button
                            type='button'
                            icon={<FaPen />}
                            children='Создать новое'
                            onClick={handlePreparingForNewAdCreation}
                        />
                    </>
                )}
            </form>

            {isOverlayVisible && (
                <Overlay onClose={handleCloseOverlay}>
                    <ConfirmationDialog
                        message='Вы уверены, что хотите разместить объявление?'
                        onConfirm={handleConfirmPlacement}
                        onCancel={handleCloseOverlay}
                    />
                </Overlay>
            )}
        </>
    );
};

export default CreateTransportAd;
