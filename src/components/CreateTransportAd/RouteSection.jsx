import React, { useState } from 'react';
import DatePicker from 'react-datepicker'; // Убедитесь, что у вас установлен react-datepicker
import 'react-datepicker/dist/react-datepicker.css'; // Импортируйте стили для DatePicker
import CitySearch from '../common/CitySearch/CitySearch'; // Импортируйте ваш компонент CitySearch

const RouteSection = ({
    handleDepartureCitySelected,
    handleDestinationCitySelected,
}) => {
    const [date, setDate] = useState(null); // Состояние для даты

    return (
        <div className='new-ad-section'>
            <p className='new-ad-division-title'>Маршрут</p>
            <div className='new-ad-card-main-area'>
                <p className='new-ad-title'>Начало маршрута:</p>
                <p>Когда и где транспорт будет готов к перевозке</p>
                <DatePicker
                    selected={date}
                    onChange={(date) => setDate(date)}
                    dateFormat='dd.MM.yyyy'
                    placeholderText='Дата'
                    className='new-ad-date'
                />
                <CitySearch
                    onCitySelected={handleDepartureCitySelected}
                    inputClassName='new-ad-departure'
                    placeholder='Населенный пункт'
                />
                <p className='new-ad-title'>Конец маршрута:</p>
                <p>
                    Если Вам не важно куда конкретно доставить груз по России,
                    ничего не пишите.
                </p>
                <CitySearch
                    onCitySelected={handleDestinationCitySelected}
                    inputClassName='new-ad-destination'
                    placeholder='Пункт назначения'
                />
            </div>
        </div>
    );
};

export default RouteSection;
