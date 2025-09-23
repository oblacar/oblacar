// src/pages/CargoAds/NewCargoAdPage.jsx
import React, { useMemo, useRef, useState } from 'react';
import Button from '../../../../components/common/Button/Button';
import ConfirmationDialog from '../../../../components/common/ConfirmationDialog/ConfirmationDialog';
import CreateCargoAdForm from '../../../../components/CargoAds/CreateCargoAdForm/CreateCargoAdForm';
import CargoAdItem from '../../../../components/CargoAds/CargoAdItem';

import './NewCargoAdPage.css';

const initialState = {
    // Маршрут
    departureCity: '',
    destinationCity: '',
    pickupDate: '', // dd.MM.yyyy
    deliveryDate: '', // dd.MM.yyyy
    // Стоимость
    price: '',
    paymentUnit: 'руб',
    readyToNegotiate: true,
    // Груз
    title: '',
    cargoType: '',
    description: '',
    photos: [], // base64 (позже сервис заменит на URL из Storage)
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

    // локальный стейт объявления (единый источник правды)
    const [formData, setFormData] = useState(initialState);

    const updateFormData = (patch) =>
        setFormData((prev) => ({ ...prev, ...patch }));

    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    // превью собираем из formData
    const previewAd = useMemo(() => {
        const fd = formData;
        if (!fd) return null;

        return {
            adId: '(черновик)',
            departureCity: fd.departureCity,
            destinationCity: fd.destinationCity,
            pickupDate: fd.pickupDate,
            deliveryDate: fd.deliveryDate,
            cargoType: fd.cargoType,
            cargoWeight: fd.weightTons,
            cargoHeight: fd.dimensionsMeters?.height,
            cargoWidth: fd.dimensionsMeters?.width,
            cargoDepth: fd.dimensionsMeters?.depth,
            loadingTypes: fd.preferredLoadingTypes,
            price: fd.price,
            paymentUnit: fd.paymentUnit,
            readyToNegotiate: fd.readyToNegotiate,
        };
    }, [formData]);

    const handlePlaceClick = () => {
        // просим форму провалидировать ТЕКУЩИЙ formData
        if (!formRef.current?.validate()) return;
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        setSaving(true);
        try {
            const dataToSave = formRef.current?.getFormData?.() ?? formData;

            // TODO: вызвать сервис/контекст для сохранения
            // await cargoAdsService.create(dataToSave)  или  await ctx.createAd(dataToSave)

            // сброс
            setFormData(initialState);
            formRef.current?.reset?.(); // чтобы, если внутри формы есть локальные штуки, тоже почистились
        } catch (e) {
            console.error('Ошибка сохранения:', e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='deliveries-container'>
            <div className='new-cargo-page__title'>
                Новое объявление о перевозке Груза
            </div>

            {/* превью слева — кнопка справа */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    justifyContent: 'space-between',
                    marginBottom: 12,
                }}
            >
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <CargoAdItem ad={previewAd} />
                </div>

                <Button onClick={handlePlaceClick}>+ Разместить</Button>
            </div>

            <div className='new-cargo-page__subtitle'>Введите данные:</div>

            {/* ВАЖНО: передаём форму в «контролируемом» режиме */}
            <CreateCargoAdForm
                ref={formRef}
                formData={formData}
                updateFormData={updateFormData}
            />

            {showConfirm && (
                <div className='accf__backdrop'>
                    <ConfirmationDialog
                        message='Разместить это объявление?'
                        onConfirm={handleConfirm}
                        onCancel={() => setShowConfirm(false)}
                    />
                </div>
            )}

            {saving && (
                <div className='accf__saving'>
                    <div className='accf__spinner' />
                    <div className='accf__saving-text'>Сохраняем…</div>
                </div>
            )}
        </div>
    );
};

export default NewCargoAdPage;
