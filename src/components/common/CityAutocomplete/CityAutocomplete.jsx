// CitySearch.jsx

import React, { useState, useEffect } from 'react';
import { fetchCities } from '../../../services/CityService'; // Импортируем функцию из сервиса
import './CityAutocomplete.css';

const CitySearch = () => {
    const [query, setQuery] = useState(''); // Введённый пользователем текст
    const [cities, setCities] = useState([]); // Список городов для отображения
    const [showDropdown, setShowDropdown] = useState(false); // Управление видимостью выпадающего списка

    const [isCityChecked, setIsCityChecked] = useState(false); // Фиксируем, что пользователь выбрал вариант

    // Обновление списка городов при изменении ввода пользователя
    useEffect(() => {
        if (!isCityChecked) {
            // console.log('внутри эфектаы');
            if (query.length > 2) {
                const loadCities = async () => {
                    // console.log('запустили поиск городов');

                    const cityResults = await fetchCities(query);

                    setCities(cityResults);
                    setShowDropdown(true);
                };
                loadCities();
            } else {
                setCities([]); // Очищаем список при слишком коротком запросе
                setShowDropdown(false); // Скрываем выпадающий список
            }
        }
    }, [query]);

    // Обработчик выбора города из выпадающего списка
    const handleCitySelect = (city) => {
        setQuery(city.name); // Устанавливаем выбранный город в поле ввода

        setShowDropdown(false); // Закрываем выпадающий список
        setIsCityChecked(true); // Пользователь выбрал город
    };

    const handleEnterInput = () => {
        // console.log('зашли');
        setIsCityChecked(() => false); // Пользователь выбрал город
    };

    return (
        <div
            className='city-search-container'
            style={{ position: 'relative', width: '300px' }}
        >
            <input
                type='text'
                placeholder='Введите город'
                value={query}
                onChange={(e) => setQuery(e.target.value)} // Обновляем состояние при вводе
                className='city-search-input'
                onClick={handleEnterInput}
            />

            {showDropdown && cities.length > 0 && (
                <ul className='city-dropdown'>
                    {cities.map((city, index) => (
                        <li
                            key={index}
                            className='city-dropdown-item'
                            onClick={() => handleCitySelect(city)} // Выбор города
                        >
                            {city.name}{' '}
                            {/* Отображаем только название города */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CitySearch;
