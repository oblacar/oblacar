import React, { useEffect, useState } from 'react';
import { paymentUnits, paymentOptions } from '../../constants/paymentData'; // Импортируйте ваши константы

const PaymentSection = ({ formData, updateFormData }) => {
    const [selectedPaymentUnit, setSelectedPaymentUnit] = useState(
        paymentUnits[0]
    ); // Устанавливаем первый элемент по умолчанию

    const handlePriceInputChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value }); // Передаем данные в родительский компонент
    };

    useEffect(() => {
        // Устанавливаем значение по умолчанию при первом рендере
        if (paymentUnits.length > 0) {
            setSelectedPaymentUnit(paymentUnits[0]); // Выбираем первый элемент по умолчанию
            updateFormData({ paymentUnit: paymentUnits[0] }); // Обновляем значение в родительском компоненте
        }
    }, [paymentUnits]); // Зависимость для выполнения при изменении paymentUnits

    const handleRadioChange = (e) => {
        setSelectedPaymentUnit(e.target.value); // Обновляем состояние при изменении

        const { value } = e.target;
        updateFormData({ paymentUnit: value }); // Передаем данные в родительский компонент
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;

        if (name === 'readyToNegotiate') {
            updateFormData({ readyToNegotiate: checked }); // Обновляем состояние готовности к торгу
        } else {
            // Обрабатываем условия оплаты
            const updatedPaymentOptions = checked
                ? [...formData.paymentOptions, value] // Добавляем в массив
                : formData.paymentOptions.filter((option) => option !== value); // Убираем из массива

            updateFormData({ paymentOptions: updatedPaymentOptions }); // Передаем данные в родительский компонент
        }
    };

    return (
        <div className='new-ad-section'>
            <p className='new-ad-division-title'>Оплата</p>
            <div className='new-ad-card-main-area'>
                <p className='new-ad-title'>Стоимость услуги:</p>
                <div className='price-section'>
                    <input
                        type='text'
                        name='price'
                        placeholder='Сумма'
                        className='without-bottom-margine'
                        onChange={handlePriceInputChange} // Обработчик для ввода стоимости
                    />

                    {/* Радиобатоны */}
                    <div className='radio-buttons'>
                        {paymentUnits.map((unit, index) => (
                            <label
                                key={unit}
                                className='radio-item'
                            >
                                <input
                                    type='radio'
                                    name='paymentUnit'
                                    value={unit}
                                    className='input-radio'
                                    onChange={handleRadioChange} // Обработчик для радиокнопок
                                    checked={selectedPaymentUnit === unit} // Проверяем, является ли этот элемент выбранным
                                />
                                <span className='radio-title'>{unit}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <p className='new-ad-title without-bottom-margine'>
                    Готовность торговаться:
                </p>
                <div className='checkbox-item'>
                    <label className='checkbox-label'>
                        <input
                            name='readyToNegotiate'
                            type='checkbox'
                            className='input-checkbox'
                            onChange={handleCheckboxChange} // Обработчик для чекбокса
                        />
                        <span className='checkbox-title'>Торг</span>
                    </label>
                </div>

                {/* Чекбоксы для условий оплаты */}
                <div className='checkboxes'>
                    <p className='new-ad-title without-bottom-margine'>
                        Условия оплаты
                    </p>
                    {paymentOptions.map((paymentOption, index) => (
                        <div
                            key={paymentOption}
                            className='checkbox-item'
                        >
                            <label className='checkbox-label'>
                                <input
                                    type='checkbox'
                                    id={`payment-option-${index}`} // Убедитесь, что id уникален
                                    value={paymentOption}
                                    className='input-checkbox'
                                    name='paymentOptions'
                                    onChange={handleCheckboxChange} // Обработчик для условий оплаты
                                />
                                <span className='checkbox-title'>
                                    {paymentOption}
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PaymentSection;
