import React from 'react';

const PaymentSection = ({
    formData,
    handlePriceInputChange,
    paymentUnits,
    paymentOptions,
    handleRadioChange,
    handleCheckboxChange,
}) => {
    return (
        <div className='new-ad-section'>
            <p className='new-ad-division-title'>Оплата</p>
            <div className='new-ad-card-main-area'>
                <p className='new-ad-title'>Стоимость услуги:</p>

                <input
                    type='text'
                    name='price'
                    value={formData.price}
                    onChange={handlePriceInputChange}
                    placeholder='Сумма'
                    className='without-bottom-margine'
                />

                {/* Радиобатоны */}
                <div className='radio-buttons'>
                    {paymentUnits.map((unit) => (
                        <label
                            key={unit}
                            className='radio-item'
                        >
                            <input
                                type='radio'
                                name='paymentMethod'
                                value={unit}
                                className='input-radio'
                                checked={formData.paymentMethod === unit}
                                onChange={handleRadioChange}
                            />
                            <span className='radio-title'>{unit}</span>
                        </label>
                    ))}
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
                            checked={formData.readyToNegotiate}
                            onChange={handleCheckboxChange} // Обработчик изменени
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
                                    checked={formData.paymentOptions.includes(
                                        paymentOption
                                    )}
                                    onChange={handleCheckboxChange}
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
