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
            console.log(formData);
            // await createVehicle(formData);
            // ... дальше: показать уведомление / редирект / очистить форму
        } catch (e) {
            console.error(e);
            // показать ошибку пользователю при необходимости
        }
    };

    return (
        <div className=''>
            <div className='page-header'>
                <h1 className='page-title'>Новая машина</h1>
            </div>

            <h2 className='section-title'>Превью</h2>
            <div className='new-vehicle-layout'>
                <div className='new-vehicle-card card-wrap'>
                    <div className='vehicle-card-shell'>
                        <VehicleCard
                            vehicle={formData}
                            isCreateCard
                            onCreateClick={handleSaveVehicle} // кнопка на превью тоже валидирует и сохраняет
                            createButtonText='Добавить в гараж'
                        />
                    </div>
                </div>

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
            </div>
        </div>
    );
};

export default NewVehiclePage;
