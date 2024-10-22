import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CitySearch from '../common/CitySearch/CitySearch';

const RouteSection = ({ formData, updateFormData }) => {
    const handleDateChange = (date) => {
        if (date) {
            // Форматируем дату в 'dd.mm.yyyy'
            const formattedDate = date.toLocaleDateString('ru-RU'); // Формат даты
            updateFormData({ availabilityDate: formattedDate }); // Обновляем дату
        }
    };

    const handleDepartureCityChange = (city) => {
        updateFormData({ departureCity: city }); // Обновляем город отправления
    };

    const handleDestinationCityChange = (city) => {
        updateFormData({ destinationCity: city }); // Обновляем город назначения
    };

    return (
        <div className='new-ad-section'>
            <p className='new-ad-division-title'>Маршрут</p>
            <div className='new-ad-card-main-area'>
                <p className='new-ad-title'>Начало маршрута:</p>
                <p>Когда и где транспорт будет готов к перевозке</p>
                <div className='new-ad-date'>
                    <DatePicker
                        selected={
                            formData.availabilityDate
                                ? new Date(
                                      formData.availabilityDate
                                          .split('.')
                                          .reverse()
                                          .join('-')
                                  )
                                : null
                        }
                        onChange={handleDateChange} // Устанавливаем дату
                        dateFormat='dd.MM.yyyy'
                        placeholderText='Дата'
                        className='new-ad-date'
                    />
                </div>
                <CitySearch
                    onCitySelected={handleDepartureCityChange} // Передаем функцию
                    inputClassName='new-ad-departure'
                    placeholder='Пункт отправления'
                />
                <p className='new-ad-title'>Конец маршрута:</p>
                <p>
                    Если Вам не важно куда конкретно доставить груз по России,
                    ничего не пишите.
                </p>
                <CitySearch
                    onCitySelected={handleDestinationCityChange} // Передаем функцию
                    inputClassName='new-ad-destination'
                    placeholder='Пункт назначения (Россия)'
                />
            </div>
        </div>
    );
};

export default RouteSection;
