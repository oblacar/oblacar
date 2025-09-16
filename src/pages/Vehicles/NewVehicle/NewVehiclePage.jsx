import React, { useRef, useState } from 'react';

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

    return (
        // <div className='new-ad-section'>
        <div className=''>
            <h2>Новая машина</h2>

            <div className='new-vehicle-layout'>
                <div className='new-vehicle-card card-wrap'>
                    <VehicleCard vehicle={formData} />
                </div>

                {/* <div className='new-vehicle-right new-ad-card-main-area'> */}
                <div className='new-vehicle-data'>
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

                    {/* Кнопки — пока без логики сохранения */}
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <button
                            className='btn primary'
                            disabled
                        >
                            Сохранить (позже)
                        </button>
                        <button
                            className='btn'
                            onClick={() => window.history.back()}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewVehiclePage;
