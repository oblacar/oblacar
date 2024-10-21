// CitySearch.jsx
// Через пропсы назначить селектор inputClassName, где можно задать ширину и закругления.
// с использованием !important, можно принудительно менять другие стили.

import React, { useState, useEffect } from 'react';
import { fetchCities } from '../../../services/CityService'; // Импортируем функцию из сервиса
import './CitySearch.css';

const CitySearch = ({ onCitySelected, placeholder, inputClassName }) => {
    const [query, setQuery] = useState(''); // Введённый пользователем текст
    const [cities, setCities] = useState([]); // Список городов для отображения
    const [showDropdown, setShowDropdown] = useState(false); // Управление видимостью выпадающего списка

    const [isCityChecked, setIsCityChecked] = useState(false); // Фиксируем, что пользователь выбрал вариант

    // Обновление списка городов при изменении ввода пользователя
    useEffect(() => {
        if (!isCityChecked) {
            if (query.length > 2) {
                const loadCities = async () => {
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

        onCitySelected(city.name);

        setShowDropdown(() => false); // Закрываем выпадающий список
        setIsCityChecked(() => true); // Пользователь выбрал город
    };

    const handleEnterInput = () => {
        setIsCityChecked(() => false); // Пользователь выбрал город
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);

        onCitySelected(e.target.value);
    };

    return (
        <div className={`city-search-container `}>
            <input
                type='text'
                value={query}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={`city-search-input  ${inputClassName}`} // Динамические классы
                onClick={handleEnterInput}
            />
            {showDropdown && cities.length != 0 && (
                <ul className='city-dropdown'>
                    {cities.map((city, index) => (
                        <li
                            key={index}
                            className='city-dropdown-item'
                            onClick={() => handleCitySelect(city)} // Выбор города
                        >
                            {city.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CitySearch;
