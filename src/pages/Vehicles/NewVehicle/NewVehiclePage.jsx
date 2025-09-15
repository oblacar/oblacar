import React, { useRef, useState } from 'react';

// Готовая форма ввода (из твоего проекта)
import VehicleFormSection from '../../../components/CreateTransportAd/VehicleFormSection';
import { truckTypesWithLoading } from '../../../constants/transportAdData';

// Превью карточка машины (слева)
import VehicleCard from '../../../components/VehicleCard/VehicleCard';

// Кнопки/аплоадер, которые уже используются в форме
import AddPhotoButton from '../../../components/common/AddPhotoButton/AddPhotoButton';
import MultiTruckPhotoUploader from '../../../components/MultiTruckPhotoUploader/MultiTruckPhotoUploader';

import VerticalPhotoCarousel from '../../../components/common/VerticalPhotoCarousel/VerticalPhotoCarousel';

// Страница создания новой машины: слева превью, справа форма.
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
        <div className='new-ad-section'>
            <VerticalPhotoCarousel
                photos={formData.truckPhotoUrls} // массив или объект {ph1: url, ph2: url}
                mainWidth={480}
                mainHeight={360}
                stripWidth={84}
                gap={10}
            />

            <p className='new-ad-division-title'>Новая машина</p>

            <div className='new-vehicle-layout'>
                {/* Слева — превью карточки по текущим данным формы */}
                <div className='new-vehicle-left'>
                    <VehicleCard vehicle={formData} />
                </div>

                {/* Справа — форма ввода параметров */}
                <div className='new-vehicle-right new-ad-card-main-area'>
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
