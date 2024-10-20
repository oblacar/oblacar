import React from 'react';
import Button from './Button'; // Импортируйте ваш компонент Button
import { truckTypesWithLoading } from '../../constants/transportAdData'; // Импортируйте ваш массив типов грузовиков

const TransportSection = ({
    formData,
    handleTransportTypeChange,
    loadingTypes,
    test,
    setTest,
}) => {
    return (
        <div className='new-ad-section'>
            <p className='new-ad-division-title'>Транспорт</p>
            <div className='new-ad-card-main-area'>
                <p>Выберите одну из своих машин</p>
                <Button
                    type='button'
                    size_width='wide'
                    children='Выбрать машину'
                />
                <p>или введите данные новой</p>
                <p className='new-ad-title without-bottom-margine'>Тип:</p>
                <select
                    name='transportType'
                    value={test}
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
                        key={loadingType}
                        className='checkbox-item'
                    >
                        <label className='checkbox-label'>
                            <input
                                type='checkbox'
                                id={`loadingType-${index}`} // Убедитесь, что id уникален
                                value={loadingType}
                                className='input-checkbox'
                                // checked={formData.selectedCheckboxes.includes(loadingType)}
                                // onChange={handleCheckboxChange}
                            />
                            <span className='checkbox-title'>
                                {loadingType}
                            </span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransportSection;
