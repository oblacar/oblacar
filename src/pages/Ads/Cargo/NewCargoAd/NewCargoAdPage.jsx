// src/pages/CargoAds/NewCargoAdPage.jsx
import React, { useMemo, useRef, useState, useEffect, useContext } from 'react';
import Button from '../../../../components/common/Button/Button';
import ConfirmationDialog from '../../../../components/common/ConfirmationDialog/ConfirmationDialog';
import CreateCargoAdForm from '../../../../components/CargoAds/CreateCargoAdForm/CreateCargoAdForm';
import CargoAdItem from '../../../../components/CargoAds/CargoAdItem';
import CargoAdsContext from '../../../../hooks/CargoAdsContext';
import './NewCargoAdPage.css';

const initialState = {
    ownerId: '',
    ownerName: '',
    ownerPhotoUrl: '',
    ownerRating: '',
    createdAt: new Date().toISOString(),

    // маршрут + даты
    departureCity: '',
    destinationCity: '',
    pickupDate: '',
    deliveryDate: '',

    // цена (плоско)
    price: '',
    paymentUnit: 'руб',
    readyToNegotiate: true,

    // груз
    title: '',
    cargoType: '',
    description: '',
    photos: [],

    weightTons: '',
    dimensionsMeters: { height: '', width: '', depth: '' },

    quantity: '',
    packagingType: '',
    packagingTypes: [],

    isFragile: false,
    isStackable: false,
    adrClass: '',
    temperature: { mode: 'ambient', minC: '', maxC: '' },

    preferredLoadingTypes: [],
};

const NewCargoAdPage = () => {
    const ctx = useContext(CargoAdsContext) || {};
    const { refresh } = ctx;

    // поддержим оба имени: addAd (ваше) и createAd (мой прежний)
    const saveNewAd =
        (typeof ctx.addAd === 'function' && ctx.addAd) ||
        (typeof ctx.createAd === 'function' && ctx.createAd) ||
        null;

    const formRef = useRef(null);
    const [formData, setFormData] = useState(initialState);
    const updateFormData = (patch) => setFormData((p) => ({ ...p, ...patch }));

    // ui-state: 'idle' | 'confirm' | 'saving' | 'success' | 'error'
    const [ui, setUi] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        console.log('[NewCargoAdPage] formData dates:', {
            pickupDate: formData.pickupDate,
            deliveryDate: formData.deliveryDate,
        });
    }, [formData.pickupDate, formData.deliveryDate]);

    const previewAd = useMemo(() => {
        const fd = formData;
        return {
            // маршрут + даты (Карточка умеет читать эти поля)
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
            title: fd.title,
            weightTons: fd.weightTons,
            cargoHeight: fd.dimensionsMeters?.height,
            cargoWidth: fd.dimensionsMeters?.width,
            cargoDepth: fd.dimensionsMeters?.depth,
            loadingTypes: fd.preferredLoadingTypes,

            // бейджи
            packagingTypes: fd.packagingTypes ?? [],
            isFragile: fd.isFragile,
            isStackable: fd.isStackable,
            temperature: fd.temperature,
            adrClass: fd.adrClass,

            // мета
            createdAt: fd.createdAt,

            // владелец (для карточки)
            ownerId: fd.ownerId,
            ownerName: fd.ownerName,
            ownerAvatar: fd.ownerPhotoUrl,
            ownerRating: fd.ownerRating,
        };
    }, [formData]);

    useEffect(() => {
        console.groupCollapsed('%c[NewCargoAdPage] previewAd (from formData)', 'color:#0284c7');
        console.log(formData);
        console.groupEnd();
    }, [formData]);

    const handlePlaceClick = () => {
        if (ui !== 'idle') return;
        if (!formRef.current?.validate()) return;
        setUi('confirm');
    };

    const handleConfirm = async () => {
        setUi('saving');
        try {
            if (!saveNewAd) throw new Error('Метод сохранения объявления недоступен (нет addAd/createAd в CargoAdsContext)');

            const form = formRef.current?.getFormData?.() ?? formData;

            console.groupCollapsed('%c[NEW] Submit formData', 'color:#0ea5e9');
            console.log(form);
            console.groupEnd();

            const created = await saveNewAd(form);

            console.groupCollapsed('%c[NEW] Created ← service', 'color:#22c55e');
            console.log(created);
            console.groupEnd();

            await refresh?.();

            setUi('success');
        } catch (e) {
            console.groupCollapsed('%c[NEW] Create ERROR', 'color:#ef4444');
            console.error(e);
            console.groupEnd();
            setErrorMsg(e?.message || 'Не удалось сохранить объявление. Проверьте подключение и попробуйте снова.');
            setUi('error');
        }
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
                        disabled={ui === 'saving' || ui === 'confirm' || ui === 'error'}
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
                        <Button onClick={() => setUi('idle')}>Попробовать снова</Button>
                    </div>
                </div>
            )}

            {/* подсказка под превью */}
            {ui !== 'success' && (
                <div className='new-cargo-page__subtitle'>Введите данные:</div>
            )}

            {/* ФОРМА — ВСЕГДА в DOM */}
            <div className={`ncap__form ${ui === 'saving' ? 'ncap__form--disabled' : ''} ${ui === 'success' ? 'ncap__form--hidden' : ''}`}>
                <CreateCargoAdForm
                    ref={formRef}
                    formData={formData}
                    updateFormData={updateFormData}
                // в режиме создания оставляем автодополнение городов (CitySearch)
                // usePlainCityInputs={false}
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
                    <div className='ncap__result-title'>Объявление размещено</div>
                    <div className='ncap__result-actions'>
                        <Button onClick={handleCreateAnother}>Добавить ещё</Button>
                        {/* сюда при желании кнопку ко всем объявлениям */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewCargoAdPage;
