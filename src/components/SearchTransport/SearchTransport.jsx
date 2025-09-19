// Для настройки календаря используем React Datepicker (react-datepicker) — популярная библиотека для React,
// которая предоставляет гибкий и настраиваемый календарь.
// npm install react-datepicker

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SearchTransport.css';

import CitySearch from '../common/CitySearch/CitySearch';
import Button from '../common/Button/Button';

import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const SearchTransport = () => {
    // Состояния для полей
    const [departureCity, setDepartureCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [date, setDate] = useState(null); // Используем null для React Datepicker
    const [volume, setVolume] = useState('');
    const [weight, setWeight] = useState('');

    const handleDepartureCitySelected = (city) => {
        setDepartureCity(city);
    };

    const handleDestinationCitySelected = (city) => {
        setDestinationCity(city);
    };

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

    // Функция для добавления пробелов между тысячами
    const formatNumber = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    // Функция для обработки изменений веса инпута ??
    const handleWeightChange = (e) => {
        // Проверяем, что введен только допустимый символ (цифры)
        const value = e.target.value.replace(/\D/g, '');

        // Сохраняем числовое значение в state
        setWeight(value);
    };
    //Функция для обработки изменений объема инпута
    const handleVolumeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setVolume(value);
    };

    // Ограничиваем ввод только цифрами, разрешая стрелки, Delete, Backspace
    const handleKeyDown = (e) => {
        const allowedKeys = [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Backspace',
            'Delete',
            'Tab',
        ];

        if (
            !allowedKeys.includes(e.key) && // Разрешаем навигационные клавиши
            !/[0-9]/.test(e.key) // Разрешаем цифры
        ) {
            e.preventDefault(); // Запрещаем все остальное
        }
    };

    const PopperWrap = ({ children }) => (
        <div className='datepicker-popper-portal'>{children}</div>
    );

    return (
        <div className='search-transport-container'>
            <form
                onSubmit={handleSubmit}
                className='search-form'
            >
                <div className='upper-search-row'>
                    <CitySearch
                        onCitySelected={handleDepartureCitySelected}
                        inputClassName='search-input departure-city'
                        placeholder='От куда'
                    />
                    <CitySearch
                        onCitySelected={handleDestinationCitySelected}
                        inputClassName='search-input destination-city'
                        placeholder='Куда'
                    />
                    {/* <DatePicker
                        selected={date}
                        onChange={(date) => setDate(date)}
                        dateFormat='dd/MM/yyyy'
                        placeholderText='Дата'
                        className='search-input search-field date'
                    /> */}
                    <DatePicker
                        selected={date}
                        onChange={(d) => setDate(d)}
                        dateFormat='dd/MM/yyyy'
                        placeholderText='Дата'
                        className='search-input search-field date'
                        // withPortal // календарь рендерится в портал поверх страницы
                        popperContainer={PopperWrap}
                        popperPlacement='bottom-start'
                        showPopperArrow={false}
                        /* необязательно, но полезно на Windows, если боишься скроллбаров: */
                        shouldCloseOnScroll={(e) => true}
                    />

                    <div className='wv-group'>
                        <input
                            type='text'
                            placeholder='Вес (кг)'
                            value={weight ? `${formatNumber(weight)} кг` : ''}
                            onChange={handleWeightChange}
                            onKeyDown={handleKeyDown}
                            className='search-input search-field weight'
                        />
                        <input
                            type='text'
                            placeholder='Объем (м³)'
                            value={volume ? `${formatNumber(volume)} м³` : ''}
                            onChange={handleVolumeChange}
                            onKeyDown={handleKeyDown}
                            className='search-input search-field search-volume'
                        />
                    </div>

                    {/* <input
                        type='text'
                        placeholder='Вес (кг)'
                        value={weight ? `${formatNumber(weight)} кг` : ''}
                        onChange={handleWeightChange}
                        onKeyDown={handleKeyDown}
                        className='search-input search-field weight'
                    />
                    <input
                        type='text'
                        placeholder='Объем (м³)'
                        value={volume ? `${formatNumber(volume)} м³` : ''}
                        onChange={handleVolumeChange}
                        onKeyDown={handleKeyDown}
                        className='search-input search-field search-volume'
                    /> */}
                    {/* ⬇️ обёртка под кнопку — чтобы положить в grid-area: search */}
                    <div className='search-submit'>
                        <Button
                            type='submit'
                            size_height='high'
                        >
                            Поиск
                        </Button>
                    </div>
                </div>

                <div className='lower-search-row'>
                    <div
                        className='additional-toggle'
                        role='button'
                        tabIndex={0}
                        aria-expanded={showAdditionalOptions}
                        onClick={() => setShowAdditionalOptions((v) => !v)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setShowAdditionalOptions((v) => !v);
                            }
                        }}
                    >
                        {/* <span className='additional-toggle__label'>
                            Дополнительно
                        </span> */}
                        <span
                            className='additional-toggle__icon'
                            aria-hidden='true'
                        >
                            {showAdditionalOptions ? (
                                <FaAngleUp />
                            ) : (
                                <FaAngleDown />
                            )}
                        </span>
                    </div>
                </div>

                {showAdditionalOptions && (
                    <div className='additional-options'>
                        <p>
                            Здесь можно выбрать дополнительные параметры
                            поиска
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SearchTransport;
