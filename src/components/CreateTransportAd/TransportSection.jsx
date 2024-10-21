import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import { truckTypesWithLoading } from '../../constants/transportAdData'; // Импортируйте ваш массив типов грузовиков

const TransportSection = ({ updateFormData, formData }) => {
    const [loadingTypes, setLoadingTypes] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value }); // Передаем данные в родительский компонент
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                updateFormData({ truckPhoto: reader.result }); // Обновляем состояние с помощью updateFormData
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTransportTypeChange = (e) => {
        const transportTypeName = e.target.value;

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
                <div className='truck-name-photo'>
                    <div className='truck-name'>
                        <p className='new-ad-title without-bottom-margine'>
                            Название:
                        </p>
                        <input
                            type='text'
                            id='truckName'
                            name='truckName'
                            value={formData.truckName}
                            onChange={handleInputChange}
                            placeholder='Название'
                        />
                    </div>
                    <div className='truck-photo'>
                        <input
                            type='file'
                            id='truckPhoto'
                            name='truckPhoto'
                            accept='image/*'
                            onChange={handleFileChange}
                            style={{ display: 'none' }} // Скрываем стандартное поле ввода
                        />
                        <div
                            onClick={() =>
                                document.getElementById('truckPhoto').click()
                            }
                            className='photo-circle'
                        >
                            {formData.truckPhoto ? (
                                <img
                                    src={formData.truckPhoto}
                                    alt='Превью фото машины'
                                    className='photo-preview'
                                />
                            ) : (
                                <span>Фото</span>
                            )}
                        </div>
                    </div>
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
                        <p className='new-ad-title weight-label'>Вес (т):</p>
                        <input
                            className='weight-input'
                            type='number'
                            name='weight'
                            value={formData.weight}
                            onChange={handleInputChange}
                            placeholder='Введите вес'
                            min='0'
                        />
                    </div>

                    <p className='new-ad-title without-bottom-margine'>
                        Объем (м3) ВхШхГ:
                    </p>
                    <div className='dimensions'>
                        <div className='value-dimension'>
                            <div className='dimension-item'>
                                <input
                                    type='number'
                                    name='height'
                                    value={formData.height}
                                    onChange={handleInputChange}
                                    placeholder='Высота'
                                    min='0'
                                />
                            </div>
                            <div className='dimension-item'>
                                <input
                                    type='number'
                                    name='width'
                                    value={formData.width}
                                    onChange={handleInputChange}
                                    placeholder='Ширина'
                                    min='0'
                                />
                            </div>
                            <div className='dimension-item'>
                                <input
                                    type='number'
                                    name='depth'
                                    value={formData.depth}
                                    onChange={handleInputChange}
                                    placeholder='Глубина'
                                    min='0'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportSection;
