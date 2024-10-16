// Для настройки календаря используем React Datepicker (react-datepicker) — популярная библиотека для React,
// которая предоставляет гибкий и настраиваемый календарь.
// npm install react-datepicker

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SearchTransport.css';

const SearchTransport = () => {
    // Состояния для полей
    const [departureCity, setDepartureCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [date, setDate] = useState(null); // Используем null для React Datepicker
    const [volume, setVolume] = useState('');
    const [weight, setWeight] = useState('');

    // Управление состоянием для нижней полосы с дополнительными опциями
    const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Логика для отправки данных формы
        console.log('Поиск транспорта:', {
            departureCity,
            destinationCity,
            date,
            volume,
            weight,
        });
    };

    return (
        <div className='search-transport-container'>
            <form
                onSubmit={handleSubmit}
                className='search-form'
            >
                <div className='upper-search-row'>
                    <input
                        type='text'
                        placeholder='От куда'
                        value={departureCity}
                        onChange={(e) => setDepartureCity(e.target.value)}
                        className='search-field departure-city'
                    />
                    <input
                        type='text'
                        placeholder='Куда'
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        className='search-field destination-city'
                    />
                    <DatePicker
                        selected={date}
                        onChange={(date) => setDate(date)}
                        dateFormat='dd/MM/yyyy'
                        placeholderText='Дата отправки'
                        className='search-field date'
                    />
                    <input
                        type='number'
                        placeholder='Вес (кг)'
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className='search-field'
                    />
                    <input
                        type='number'
                        placeholder='Объем (м³)'
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className='search-field'
                    />
                    <button
                        type='submit'
                        className='search-button'
                    >
                        Поиск
                    </button>
                </div>

                <div className='lower-search-row'>
                    <button
                        type='button'
                        className='additional-button'
                        onClick={() =>
                            setShowAdditionalOptions(!showAdditionalOptions)
                        }
                    >
                        Дополнительно
                    </button>
                </div>

                {showAdditionalOptions && (
                    <div className='additional-options'>
                        {/* Здесь будут дополнительные опции для поиска */}
                        <p>
                            Здесь можно будет выбрать дополнительные параметры
                            поиска
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SearchTransport;
