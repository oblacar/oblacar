import React, { useContext, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import RouteSection from './RouteSection';
import PaymentSection from './PaymentSection';
import TransportSection from './TransportSection';

import TransportAdContext from '../../hooks/TransportAdContext'; // Импортируйте ваш TransportAdContext
import TransportContext from '../../hooks/TransportContext'; // Импортируйте ваш TransportContext
import { paymentOptions, paymentUnits } from '../../constants/paymentData';
import { truckTypesWithLoading } from '../../constants/transportAdData';

// import CitySearch from '../common/CitySearch/CitySearch';
import Button from '../common/Button/Button';

import './CreateTransportAd.css'; // Импортируйте файл стилей

const CreateTransportAd = () => {
    const { transports } = useContext(TransportContext); // Получите доступ к машинам из контекста транспортных средств
    const { createTransportAd } = useContext(TransportAdContext); // Получите доступ к созданию объявления
    const [formData, setFormData] = useState({
        transportId: '',
        loadingType: '',
        photo: '',
        departureCity: '',
        destinationCity: '',
        readyDate: '',
        price: '',
        paymentMethod: '',
        readyToNegotiate: false,
        paymentOptions: [],
        // selectedCheckboxes: [],
    });
    const [availableLoadingTypes, setAvailableLoadingTypes] = useState([]); // Определяем состояние для доступных типов загрузки

    const [departureCity, setDepartureCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');
    const [date, setDate] = useState(null); // Используем null для React Datepicker

    const [test, setTest] = useState('');
    const [loadingTypes, setLoadingTypes] = useState([]);

    // const availableLoadingTypes =
    // truckTypesWithLoading.find(
    //     (transport) => transport.id === formData.transportId
    // )?.loadingTypes || [];

    useEffect(() => {
        // Загружаем машины при монтировании компонента, если нужно
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { files } = e.target; // Получаем файлы из события
        if (files && files.length > 0) {
            const file = files[0]; // Берем первый файл
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prevState) => ({
                    ...prevState,
                    truckPhoto: reader.result, // Сохраняем URL изображения в состоянии
                }));
            };
            reader.readAsDataURL(file); // Читаем файл как URL
        }
    };

    const handleTransportTypeChange = (e) => {
        const selectedTransportName = e.target.value;

        setTest(selectedTransportName);

        const selectTransportType = truckTypesWithLoading.find(
            (truck) => truck.name === selectedTransportName
        );

        setLoadingTypes(() => selectTransportType.loadingTypes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await createTransportAd(formData);
        console.log(result);
        // Обработка успешной отправки
    };

    const handleDepartureCitySelected = (city) => {
        setDepartureCity(city);
        console.log('Выбранный город отправления:', city);
    };

    const handleDestinationCitySelected = (city) => {
        setDestinationCity(city);
        console.log('Выбранный город отправления:', city);
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target; // Получаем имя, значение и состояние чекбокса

        if (name === 'readyToNegotiate') {
            // Если это чекбокс "Торг", обновляем его состояние
            setFormData((prevState) => ({
                ...prevState,
                readyToNegotiate: checked, // Устанавливаем состояние чекбокса
            }));
        } else if (name === 'paymentOptions') {
            // Обрабатываем другие чекбоксы (массив выбранных чекбоксов)
            setFormData((prevState) => {
                const paymentOptions = checked
                    ? [...prevState.paymentOptions, value] // Добавляем в массив
                    : prevState.paymentOptions.filter(
                          (checkbox) => checkbox !== value
                      ); // Убираем из массива

                return { ...prevState, paymentOptions }; // Обновляем состояние
            });
        } else {
            // Обрабатываем другие чекбоксы (массив выбранных чекбоксов)
            setFormData((prevState) => {
                const selectedCheckboxes = checked
                    ? [...prevState.selectedCheckboxes, value] // Добавляем в массив
                    : prevState.selectedCheckboxes.filter(
                          (checkbox) => checkbox !== value
                      ); // Убираем из массива

                return { ...prevState, selectedCheckboxes }; // Обновляем состояние
            });
        }
    };

    const handleRadioChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value, // Обновляем поле, соответствующее имени
        }));
    };

    return (
        <form
            onSubmit={handleSubmit}
            className='create-transport-ad-form'
        >
            <h2>Новое объявление</h2>
            <div className='new-transport-ad'>
                <RouteSection
                    handleDepartureCitySelected={handleDepartureCitySelected}
                    handleDestinationCitySelected={
                        handleDestinationCitySelected
                    }
                />

                {/* Блок Оплата  */}

                <PaymentSection
                    formData={formData}
                    handlePriceInputChange={handleInputChange}
                    paymentUnits={paymentUnits}
                    paymentOptions={paymentOptions}
                    handleRadioChange={handleRadioChange}
                    handleCheckboxChange={handleCheckboxChange}
                />
                {/* Блок Транспорт  */}
                <TransportSection />
            </div>

            <button type='submit'>Создать объявление</button>
        </form>
    );
};

export default CreateTransportAd;
