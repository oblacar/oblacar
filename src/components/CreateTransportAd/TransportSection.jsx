import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { FaUpload } from 'react-icons/fa';
import { truckTypesWithLoading } from '../../constants/transportAdData';

import MultiTruckPhotoUploader from '../MultiTruckPhotoUploader/MultiTruckPhotoUploader';
import AddPhotoButton from '../common/AddPhotoButton/AddPhotoButton';
import VehicleFormSection from '../CreateTransportAd/VehicleFormSection';

const TransportSection = forwardRef(({ updateFormData, formData }, ref) => {
    // ref на секцию с машиной — у неё внутри свой validateFields()
    const vehicleRef = useRef(null);

    // Проксируем валидацию выше (как у твоего RouteSection)
    useImperativeHandle(ref, () => ({
        validateFields: () => {
            return vehicleRef.current?.validateFields?.() ?? true;
        },
    }));

    const openFileDialog = () => {
        document.getElementById('file-upload')?.click();
    };

    return (
        <div className='new-ad-section'>
            <p className='new-ad-division-title'>Транспорт</p>
            <div className='new-ad-card-main-area'>
                <div className='use-truck'>
                    <div className='use-truck-message'>
                        <p>Выберите одну из своих машин</p>
                    </div>
                    <div className='use-truck-button'>
                        <FaUpload className='use-truck-btn-icon' />
                    </div>
                </div>

                <p>или введите новую</p>

                {/* Вставили вынесенную секцию машины */}
                <VehicleFormSection
                    ref={vehicleRef}
                    formData={formData}
                    updateFormData={updateFormData}
                    truckTypesWithLoading={truckTypesWithLoading}
                    openFileDialog={openFileDialog}
                    AddPhotoButton={AddPhotoButton}
                    MultiTruckPhotoUploader={MultiTruckPhotoUploader}
                />
            </div>
        </div>
    );
});

export default TransportSection;
