import React, { useState, useCallback } from 'react';
import { getCities } from '../../../services/CityService';
import debounce from 'lodash/debounce';

const CityAutocomplete = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    // Обернем функцию запроса в debounce для оптимизации
    const fetchCities = useCallback(
        debounce(async (input) => {
            const cities = await getCities(input);
            setSuggestions(cities);
        }, 300), // Задержка в 300 мс
        []
    );

    const handleInputChange = (e) => {
        const input = e.target.value;
        setQuery(input);

        if (input.length > 2) {
            fetchCities(input); // Вызываем дебаунс-функцию
        } else {
            setSuggestions([]);
        }
    };

    return (
        <div>
            <input
                type='text'
                value={query}
                onChange={handleInputChange}
                placeholder='Введите город'
            />
            <ul>
                {suggestions.map((city, index) => (
                    <li key={index}>{city.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default CityAutocomplete;
