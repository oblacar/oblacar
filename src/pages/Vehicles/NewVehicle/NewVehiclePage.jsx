import React, { useRef, useState, useContext } from 'react';

import './NewVehiclePage.css';

import { VehicleContext } from '../../../hooks/VehicleContext';

// Готовая форма ввода (из твоего проекта)
import VehicleFormSection from '../../../components/CreateTransportAd/VehicleFormSection';
import { truckTypesWithLoading } from '../../../constants/transportAdData';

// Превью карточка машины (слева)
import VehicleCard from '../../../components/VehicleCard/VehicleCard';

// Кнопки/аплоадер, которые уже используются в форме
import AddPhotoButton from '../../../components/common/AddPhotoButton/AddPhotoButton';
import MultiTruckPhotoUploader from '../../../components/MultiTruckPhotoUploader/MultiTruckPhotoUploader';

import ConfirmationDialog from '../../../components/common/ConfirmationDialog/ConfirmationDialog';


// ЛОГИКИ СОХРАНЕНИЯ НЕТ — только разметка и локальный стейт.

const NewVehiclePage = () => {
    const vehicleRef = useRef(null);

    const { createVehicle } = useContext(VehicleContext);

    const [formData, setFormData] = useState({
        truckName: '',
        transportType: '',
        loadingTypes: [], // массив строк
        truckWeight: '',
        truckHeight: '',
        truckWidth: '',
        truckDepth: '',
        truckPhotoUrls: {}, // объект { ph1: url, ph2: url, ... } или массив — форма поддержит
    });

    const [ui, setUi] = useState({
        showConfirm: false,
        saving: false,
        success: false,
        error: '',
    });

    const updateFormData = (patch) =>
        setFormData((prev) => ({ ...prev, ...patch }));



    const handleSaveVehicle = async () => {
        // 1) Вызвать валидацию у формы
        const ok = vehicleRef.current?.validateFields?.();
        if (!ok) {
            // опционально: проскроллить к первой ошибке
            document
                .querySelector('.error-text')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // 2) Если всё ок — сохраняем (через контекст/сервис)
        try {
            // console.log(formData);

            setUi((u) => ({ ...u, showConfirm: true, error: '' }));
            // await createVehicle(formData);
            // ... дальше: показать уведомление / редирект / очистить форму
        } catch (e) {
            console.error(e);
            // показать ошибку пользователю при необходимости
        }
    };

    // 1) Нажали "Сохранить" (с карточки или изнизу формы) → спрашиваем подтверждение
    // const handleSaveVehicle = () => {
    //     setUi((u) => ({ ...u, showConfirm: true, error: '' }));
    // };

    // 2) Пользователь подтвердил — валидируем и пишем в БД
    const handleConfirmSave = async () => {
        setUi((u) => ({ ...u, showConfirm: false }));

        const ok = vehicleRef.current?.validateFields?.();
        if (!ok) {
            document.querySelector('.error-text')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        try {

            console.log(formData);

            setUi((u) => ({ ...u, saving: true, error: '' }));
            // await createVehicle(formData);
            setUi((u) => ({ ...u, saving: false, success: true }));
            // опционально: очистить форму
            // setFormData({...});
            // window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            setUi((u) => ({ ...u, saving: false, error: e?.message || 'Ошибка сохранения' }));
        }
    };

    // 3) Отмена подтверждения
    const handleCancelConfirm = () => setUi((u) => ({ ...u, showConfirm: false }));

    // 4) «Добавить ещё одну» — сбрасываем успех и (по желанию) форму
    const handleAddAnother = () => {
        setUi((u) => ({ ...u, success: false, error: '' }));
        setFormData({
            truckName: '',
            transportType: '',
            loadingTypes: [],
            truckWeight: '',
            truckHeight: '',
            truckWidth: '',
            truckDepth: '',
            truckPhotoUrls: [],
        });
    };

    return (
        <div className=''>
            <div className='page-header'>
                <h1 className='page-title'>Новая машина</h1>
            </div>

            {/* Успех / Ошибка */}
            {ui.success && (
                <div className="notice success">
                    Машина сохранена.
                    <button className="btn" onClick={handleAddAnother} style={{ marginLeft: 8 }}>
                        Добавить ещё одну
                    </button>
                </div>
            )}
            {ui.error && <div className="notice error">Ошибка: {ui.error}</div>}

            {!ui.success && <div>
                <h2 className='section-title'>Превью</h2>
                <div className='new-vehicle-layout'>
                    <div className='new-vehicle-card card-wrap'>
                        <div className='vehicle-card-shell'>
                            <VehicleCard
                                vehicle={formData}
                                isCreateCard
                                onCreateClick={handleSaveVehicle} // кнопка на превью тоже валидирует и сохраняет
                                createButtonText='Сохранить'
                            />

                            {ui.saving && (
                                <div className="saving-overlay">
                                    <div className="spinner" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>}

            <h2 className='section-title'>Введите характеристики:</h2>
            <div className='new-vehicle-data'>
                <div className='new-vehicle-data-container'>
                    <VehicleFormSection
                        ref={vehicleRef}
                        formData={formData}
                        updateFormData={updateFormData}
                        truckTypesWithLoading={truckTypesWithLoading}
                        openFileDialog={() =>
                            document.getElementById('file-upload')?.click()
                        }
                        AddPhotoButton={AddPhotoButton}
                        MultiTruckPhotoUploader={MultiTruckPhotoUploader}
                    />
                </div>
            </div>


            {/* Диалог подтверждения */}
            {ui.showConfirm && (
                <div className="confirmation-backdrop">
                    <ConfirmationDialog
                        message="Сохранить машину в гараж?"
                        onConfirm={handleConfirmSave}
                        onCancel={handleCancelConfirm}
                    />
                </div>
            )}
        </div>
    );
};

export default NewVehiclePage;
