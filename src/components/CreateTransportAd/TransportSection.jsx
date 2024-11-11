import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { FaUpload, FaCamera } from 'react-icons/fa';
import { truckTypesWithLoading } from '../../constants/transportAdData'; // Импортируйте ваш массив типов грузовиков

import MultiTruckPhotoUploader from '../MultiTruckPhotoUploader/MultiTruckPhotoUploader';
import AddPhotoButton from '../common/AddPhotoButton/AddPhotoButton';

const TransportSection = forwardRef(({ updateFormData, formData }, ref) => {
    const [loadingTypes, setLoadingTypes] = useState([]);
    const [errors, setErrors] = useState({
        truckName: '',
        transportType: '',
        truckWeight: '',
        truckHeight: '',
        truckWidth: '',
        truckDepth: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value }); // Передаем данные в родительский компонент

        setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    };

    const openFileDialog = () => {
        document.getElementById('file-upload').click();
    };

    const handleTransportTypeChange = (e) => {
        const transportTypeName = e.target.value;

        setErrors((prevErrors) => ({ ...prevErrors, transportType: '' }));

        // Обнуляем loadingTypes и передаем пустой массив в updateFormData
        setLoadingTypes([]); // Сбрасываем состояние локального loadingTypes
        updateFormData({
            transportType: transportTypeName,
            loadingTypes: [], // Обнуляем loadingTypes в родительском компоненте
        });

        const transportOptions = truckTypesWithLoading.find(
            (transport) => transport.name === transportTypeName
        );

        if (transportOptions) {
            setLoadingTypes(transportOptions.loadingTypes); // Обновляем локальное состояние типов загрузки
        }
    };

    const handleLoadingTypeChange = (e) => {
        const { value, checked } = e.target;
        let updatedLoadingTypes;

        if (checked) {
            updatedLoadingTypes = [...formData.loadingTypes, value]; // Добавляем в массив
        } else {
            updatedLoadingTypes = formData.loadingTypes.filter(
                (type) => type !== value
            ); // Убираем из массива
        }

        updateFormData({ loadingTypes: updatedLoadingTypes }); // Обновляем состояние в родительском компоненте
    };

    useImperativeHandle(ref, () => ({
        validateFields: () => {
            let isValid = true;
            const newErrors = {};

            if (!formData.truckName) {
                newErrors.truckName = 'Укажите марку машины';
                isValid = false;
            }
            if (!formData.transportType) {
                newErrors.transportType = 'Выберете тип машины';
                isValid = false;
            }
            if (!formData.truckWeight) {
                newErrors.truckWeight = 'Введите вес';
                isValid = false;
            }
            if (!formData.truckHeight) {
                newErrors.truckHeight = 'Укажите высоту';
                isValid = false;
            }
            if (!formData.truckWidth) {
                newErrors.truckWidth = 'Укажите ширину';
                isValid = false;
            }
            if (!formData.truckDepth) {
                newErrors.truckDepth = 'Укажите глубину';
                isValid = false;
            }

            setErrors(newErrors);
            return isValid;
        },
    }));

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

                {/* TODO Нужно сделать Отдельную компоненту. Стиль в truck-corrector еще не задан. Нужно будет его перенести в компоненту*/}
                <div className='truck-corrector '>
                    <div className='truck-name-photo'>
                        <div className='truck-name'>
                            <input
                                type='text'
                                id='truckName'
                                name='truckName'
                                value={formData.truckName}
                                onChange={handleInputChange}
                                placeholder='Марка машины'
                            />
                        </div>
                        <AddPhotoButton openFileDialog={openFileDialog} />
                    </div>
                    {errors.truckName && (
                        <p className='error-text'>{errors.truckName}</p>
                    )}
                    <div>
                        <MultiTruckPhotoUploader
                            openFileDialog={openFileDialog}
                            updateFormData={updateFormData}
                        />
                    </div>

                    <p className='new-ad-title without-bottom-margine'>Тип:</p>
                    <select
                        name='transportType'
                        value={formData.transportType}
                        onChange={handleTransportTypeChange}
                        className='select-transport-type'
                    >
                        <option
                            value=''
                            disabled
                        >
                            Выберите
                        </option>
                        {truckTypesWithLoading.map((transport) => (
                            <option
                                key={transport.name}
                                value={transport.name}
                            >
                                {transport.name}
                            </option>
                        ))}
                    </select>

                    {errors.transportType && (
                        <p className='error-text'>{errors.transportType}</p>
                    )}

                    <p className='new-ad-title without-bottom-margine'>
                        Вариант загрузки:
                    </p>

                    {loadingTypes.map((loadingType, index) => (
                        <div
                            key={`${loadingType}-${index}`}
                            className='checkbox-item'
                        >
                            {' '}
                            {/* Уникальный ключ */}
                            <label className='checkbox-label'>
                                <input
                                    type='checkbox'
                                    id={`loadingType-${index}`}
                                    value={loadingType}
                                    className='input-checkbox'
                                    onChange={handleLoadingTypeChange}
                                    checked={formData.loadingTypes.includes(
                                        loadingType
                                    )} // Устанавливаем состояние чекбокса
                                />
                                <span className='checkbox-title'>
                                    {loadingType}
                                </span>
                            </label>
                        </div>
                    ))}
                    <div className='truck-capacity'>
                        <div className='weight-dimension'>
                            <p className='new-ad-title weight-label'>
                                Вес (т):
                            </p>
                            <input
                                className='weight-input'
                                type='number'
                                name='truckWeight'
                                value={formData.truckWeight}
                                onChange={handleInputChange}
                                placeholder='Введите вес'
                                min='0'
                            />
                        </div>
                        {errors.truckWeight && (
                            <p className='error-text create-transport-ad'>
                                {errors.truckWeight}
                            </p>
                        )}
                        <p className='new-ad-title without-bottom-margine'>
                            Объем (м3) ВхШхГ:
                        </p>
                        <div className='dimensions'>
                            <div className='value-dimension'>
                                <div className='dimension-item'>
                                    <input
                                        type='number'
                                        name='truckHeight'
                                        value={formData.truckHeight}
                                        onChange={handleInputChange}
                                        placeholder='Высота'
                                        min='0'
                                        step='0.1'
                                    />
                                </div>
                                <div className='dimension-item'>
                                    <input
                                        type='number'
                                        name='truckWidth'
                                        value={formData.truckWidth}
                                        onChange={handleInputChange}
                                        placeholder='Ширина'
                                        min='0'
                                        step='0.1'
                                    />
                                </div>
                                <div className='dimension-item'>
                                    <input
                                        type='number'
                                        name='truckDepth'
                                        value={formData.truckDepth}
                                        onChange={handleInputChange}
                                        placeholder='Глубина'
                                        min='0'
                                        step='0.1'
                                    />
                                </div>
                            </div>
                        </div>
                        {errors.truckHeight && (
                            <p className='error-text create-transport-ad'>
                                {errors.truckHeight}
                            </p>
                        )}
                        {errors.truckWidth && (
                            <p className='error-text create-transport-ad'>
                                {errors.truckWidth}
                            </p>
                        )}
                        {errors.truckDepth && (
                            <p className='error-text create-transport-ad'>
                                {errors.truckDepth}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default TransportSection;
