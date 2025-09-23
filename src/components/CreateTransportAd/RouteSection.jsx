// src/components/.../RouteSection.jsx
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CitySearch from '../common/CitySearch/CitySearch';

const RouteSection = forwardRef(({ formData, updateFormData }, ref) => {
    const [errors, setErrors] = useState({
        availabilityDate: '',
        departureCity: '',
        destinationCity: '',
    });

    const handleDateChange = (date) => {
        if (date) {
            const formattedDate = date.toLocaleDateString('ru-RU');
            updateFormData({ availabilityDate: formattedDate });
            setErrors((prevErrors) => ({
                ...prevErrors,
                availabilityDate: '',
            }));
        }
    };

    const handleDepartureCityChange = (city) => {
        updateFormData({ departureCity: city });
        setErrors((prevErrors) => ({ ...prevErrors, departureCity: '' }));
    };

    const handleDestinationCityChange = (city) => {
        updateFormData({ destinationCity: city });
        setErrors((prevErrors) => ({ ...prevErrors, destinationCity: '' }));
    };

    useImperativeHandle(ref, () => ({
        validateFields: () => {
            let isValid = true;
            const newErrors = {};

            if (!formData.availabilityDate) {
                newErrors.availabilityDate = 'Выберите дату готовности к перевозке';
                isValid = false;
            }
            if (!formData.departureCity) {
                newErrors.departureCity = 'Укажите пункт отправления';
                isValid = false;
            }
            if (!formData.destinationCity) {
                newErrors.destinationCity = 'Пустой пункт. Автозамена: Россия.';
            }

            setErrors(newErrors);
            return isValid;
        },
    }));

    return (
        <div className="new-ad-section">
            <p className="new-ad-division-title">Маршрут</p>

            <div className="new-ad-card-main-area">
                <p className="new-ad-title">Начало маршрута:</p>
                <p>Когда и где транспорт будет готов к перевозке</p>

                <div className="new-ad-date">
                    <DatePicker
                        selected={
                            formData.availabilityDate
                                ? new Date(
                                    formData.availabilityDate.split('.').reverse().join('-')
                                )
                                : null
                        }
                        onChange={handleDateChange}
                        dateFormat="dd.MM.yyyy"
                        placeholderText="Дата"
                        // добавлен универсальный класс для инпутов формы транспорта
                        className="new-ad-date create-transport-ad-input"
                    />
                    {errors.availabilityDate && (
                        <p className="error-text create-transport-ad">
                            {errors.availabilityDate}
                        </p>
                    )}
                </div>

                <CitySearch
                    onCitySelected={handleDepartureCityChange}
                    // добавлен универсальный класс к инпуту поиска города
                    inputClassName="new-ad-departure create-transport-ad-input"
                    placeholder="Пункт отправления"
                />
                {errors.departureCity && (
                    <p className="error-text create-transport-ad">
                        {errors.departureCity}
                    </p>
                )}

                <p className="new-ad-title">Конец маршрута:</p>
                <p>
                    Если Вам не важно куда конкретно доставить груз по России, ничего не
                    пишите.
                </p>

                <CitySearch
                    onCitySelected={handleDestinationCityChange}
                    // добавлен универсальный класс к инпуту поиска города
                    inputClassName="new-ad-destination create-transport-ad-input"
                    placeholder="Пункт назначения (Россия)"
                />
                {errors.destinationCity && (
                    <p className="error-text create-transport-ad">
                        {errors.destinationCity}
                    </p>
                )}
            </div>
        </div>
    );
});

export default RouteSection;
