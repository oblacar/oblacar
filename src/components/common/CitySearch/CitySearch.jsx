// CitySearch.jsx
// Через пропсы назначить селектор inputClassName, где можно задать ширину и закругления.
// с использованием !important, можно принудительно менять другие стили.

import React, { useState, useEffect } from 'react';
import { fetchCities } from '../../../services/CityService'; // Импортируем функцию из сервиса
import './CitySearch.css';

const CitySearch = ({ onCitySelected, inputStyle, inputClassName }) => {
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
                    console.log(query);

                    const cityResults = await fetchCities(query);

                    setCities(cityResults);

                    console.log(cityResults);

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

        setShowDropdown(() => false); // Закрываем выпадающий список
        setIsCityChecked(() => true); // Пользователь выбрал город

        console.log('Город ', city.name, ' выбрали');
    };

    const handleEnterInput = () => {
        // console.log('зашли');
        setIsCityChecked(() => false); // Пользователь выбрал город
        // setShowDropdown(() => true); // Закрываем выпадающий список
    };

    const handleInputChange = (e) => {
        console.log(e.target.value);
        setQuery(e.target.value);
    };

    return (
        // <div
        //     className='city-search-container'
        //     style={{ position: 'relative', width: '300px' }}
        // >
        //     <input
        //         type='text'
        //         placeholder='Введите город'
        //         value={query}
        //         onChange={(e) => setQuery(e.target.value)} // Обновляем состояние при вводе
        //         className='city-search-input'
        //         onClick={handleEnterInput}
        //     />

        //     {showDropdown && cities.length > 0 && (
        //         <ul className='city-dropdown'>
        //             {cities.map((city, index) => (
        //                 <li
        //                     key={index}
        //                     className='city-dropdown-item'
        //                     onClick={() => handleCitySelect(city)} // Выбор города
        //                 >
        //                     {city.name}{' '}
        //                     {/* Отображаем только название города */}
        //                 </li>
        //             ))}
        //         </ul>
        //     )}
        // </div>

        <div
            className={`city-search-container `}
            // style={{ position: 'relative', width: '300px' }}
        >
            <input
                type='text'
                value={query}
                onChange={handleInputChange}
                // onChange={(e) => setQuery(e.target.value)} // Обновляем состояние при вводе
                placeholder='Введите город'
                // style={inputStyle} // Динамические стили
                className={`city-search-input  ${inputClassName}`} // Динамические классы
                onClick={handleEnterInput}
            />
            {/* {isLoading && <p>Загрузка...</p>} */}
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
