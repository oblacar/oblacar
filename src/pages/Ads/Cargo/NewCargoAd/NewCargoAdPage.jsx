// src/pages/CargoAds/NewCargoAdPage.jsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import Button from '../../../../components/common/Button/Button';
import ConfirmationDialog from '../../../../components/common/ConfirmationDialog/ConfirmationDialog';
import CreateCargoAdForm from '../../../../components/CargoAds/CreateCargoAdForm/CreateCargoAdForm';
import CargoAdItem from '../../../../components/CargoAds/CargoAdItem';
import './NewCargoAdPage.css';

const initialState = {
    ownerId: '',
    ownerName: '',
    ownerPhotoUrl: '',
    ownerRating: '',
    createdAt: new Date().toISOString(),
    departureCity: '',
    destinationCity: '',
    pickupDate: '',
    deliveryDate: '',
    price: '',
    paymentUnit: 'руб',
    readyToNegotiate: true,
    title: '',
    cargoType: '',
    description: '',
    photos: [],
    weightTons: '',
    dimensionsMeters: { height: '', width: '', depth: '' },
    quantity: '',
    packagingType: '',
    isFragile: false,
    isStackable: false,
    adrClass: '',
    temperature: { mode: 'ambient', minC: '', maxC: '' },
    preferredLoadingTypes: [],
};

const NewCargoAdPage = () => {
    const formRef = useRef(null);
    const [formData, setFormData] = useState(initialState);
    const updateFormData = (patch) => setFormData((p) => ({ ...p, ...patch }));

    // ui-state: 'idle' | 'confirm' | 'saving' | 'success' | 'error'
    const [ui, setUi] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        console.log('[NewCargoAdPage] formData dates:', {
            pickupDate: formData.pickupDate,
            availabilityFrom: formData.availabilityFrom,
            deliveryDate: formData.deliveryDate,
            availabilityTo: formData.availabilityTo,
        });
    }, [
        formData.pickupDate,
        formData.availabilityFrom,
        formData.deliveryDate,
        formData.availabilityTo,
    ]);

    // const previewAd = useMemo(() => {
    //     const fd = formData;
    //     return {
    //         adId: '(черновик)',
    //         createdAt: fd.createdAt || new Date().toISOString(),
    //         departureCity: fd.departureCity,
    //         destinationCity: fd.destinationCity,
    //         pickupDate: fd.pickupDate,
    //         deliveryDate: fd.deliveryDate,
    //         cargoType: fd.cargoType,
    //         cargoWeight: fd.weightTons,
    //         cargoHeight: fd.dimensionsMeters?.height,
    //         cargoWidth: fd.dimensionsMeters?.width,
    //         cargoDepth: fd.dimensionsMeters?.depth,
    //         loadingTypes: fd.preferredLoadingTypes,
    //         price: fd.price,
    //         paymentUnit: fd.paymentUnit,
    //         readyToNegotiate: fd.readyToNegotiate,
    //         title: fd.title,
    //         ownerId: fd.ownerId,
    //         ownerName: fd.ownerName,
    //         ownerAvatar: fd.ownerPhotoUrl,   // CargoAdItem читает ownerAvatar/ownerAvatarUrl
    //         ownerRating: fd.ownerRating,
    //     };
    // }, [formData]);

    const previewAd = useMemo(() => {
        const fd = formData;
        return {
            // маршрут + даты
            departureCity: fd.departureCity,
            destinationCity: fd.destinationCity,
            availabilityFrom: fd.pickupDate,
            availabilityTo: fd.deliveryDate,

            // цена
            price: fd.price,
            paymentUnit: fd.paymentUnit,
            readyToNegotiate: fd.readyToNegotiate,

            // груз
            cargoType: fd.cargoType,
            title: fd.title,                // если показываешь короткое название
            weightTons: fd.weightTons,
            cargoHeight: fd.dimensionsMeters?.height,
            cargoWidth: fd.dimensionsMeters?.width,
            cargoDepth: fd.dimensionsMeters?.depth,
            loadingTypes: fd.preferredLoadingTypes,

            // НУЖНО ДЛЯ БЕЙДЖЕЙ:
            packagingTypes: fd.packagingTypes ?? [], // массив ключей
            isFragile: fd.isFragile,
            isStackable: fd.isStackable,
            temperature: fd.temperature,            // { mode: 'ambient'|'chilled'|'frozen', ... }
            adrClass: fd.adrClass,

            // (не обязательно, но ок)
            createdAt: fd.createdAt,

            // владелец
            ownerId: fd.ownerId,
            ownerName: fd.ownerName,
            ownerAvatar: fd.ownerPhotoUrl,
            ownerRating: fd.ownerRating,
        };
    }, [formData]);

    useEffect(() => {
        console.log('[NewCargoAdPage] previewAd:', formData);
    }, [formData]);

    const handlePlaceClick = () => {
        if (ui !== 'idle') return; // ← защита
        if (!formRef.current?.validate()) return;
        setUi('confirm');
    };

    const emulateSave = async () => {
        setUi('saving');

        // <<< ЭМУЛЯЦИЯ СЕТЕВОГО ЗАПРОСА >>>
        const SHOULD_SUCCEED = false; // переключи на false чтобы увидеть ошибку
        setTimeout(() => {
            if (SHOULD_SUCCEED) {
                setUi('success');
            } else {
                setErrorMsg(
                    'Не удалось сохранить объявление. Проверьте подключение и попробуйте снова.'
                );
                setUi('error');
            }
        }, 1200);
        // <<< /ЭМУЛЯЦИЯ >>>
    };

    const handleConfirm = async () => {
        setUi('idle'); // скрыть диалог
        await emulateSave();
    };

    const handleCancelConfirm = () => setUi('idle');

    const handleCreateAnother = () => {
        // сбрасываем форму и возвращаемся к заполнению
        setFormData({
            ...initialState,
            createdAt: new Date().toISOString(),
        });
        formRef.current?.reset?.();
        setUi('idle');
    };

    return (
        <div className='deliveries-container'>
            <div className='new-cargo-page__title '>
                Новое объявление о перевозке Груза
            </div>

            {/* верхняя полоса: превью + кнопка */}
            <div className='ncap__top'>
                <div className='ncap__preview'>
                    <CargoAdItem ad={previewAd} ableHover={false} />
                </div>
                {ui !== 'success' && (
                    <Button
                        onClick={handlePlaceClick}
                        disabled={
                            ui === 'saving' ||
                            ui === 'confirm' ||
                            ui === 'error'
                        }
                    >
                        + Разместить
                    </Button>
                )}
            </div>
            {/* Ошибка */}
            {ui === 'error' && (
                <div className='ncap__result ncap__result--error'>
                    <div className='ncap__result-title'>Ошибка</div>
                    <div className='ncap__result-text'>{errorMsg}</div>
                    <div className='ncap__result-actions'>
                        <Button onClick={() => setUi('idle')}>
                            Попробовать снова
                        </Button>
                    </div>
                </div>
            )}
            {/* подсказка под превью */}
            {ui !== 'success' && (
                <div className='new-cargo-page__subtitle'>Введите данные:</div>
            )}
            {/* ФОРМА — ВСЕГДА в DOM */}
            <div
                className={`ncap__form ${ui === 'saving' ? 'ncap__form--disabled' : ''
                    } ${ui === 'success' ? 'ncap__form--hidden' : ''}`}
            >
                <CreateCargoAdForm
                    ref={formRef}
                    formData={formData}
                    updateFormData={updateFormData}
                />
            </div>

            {/* подтверждение */}
            {ui === 'confirm' && (
                <div className='accf__backdrop'>
                    <ConfirmationDialog
                        message='Разместить это объявление?'
                        onConfirm={handleConfirm}
                        onCancel={handleCancelConfirm}
                    />
                </div>
            )}

            {/* прелоадер */}
            {ui === 'saving' && (
                <div className='accf__saving'>
                    <div className='accf__spinner' />
                    <div className='accf__saving-text'>Сохраняем…</div>
                </div>
            )}

            {/* Успех */}
            {ui === 'success' && (
                <div className='ncap__result ncap__result--success'>
                    <div className='ncap__result-title'>
                        Объявление размещено
                    </div>
                    <div className='ncap__result-actions'>
                        <Button onClick={handleCreateAnother}>
                            Добавить ещё
                        </Button>
                        {/* сюда при желании кнопку ко всем объявлениям */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewCargoAdPage;
