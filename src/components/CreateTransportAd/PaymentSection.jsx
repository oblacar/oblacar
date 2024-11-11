import React, {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { paymentUnits, paymentOptions } from '../../constants/paymentData';

const PaymentSection = forwardRef(({ formData, updateFormData }, ref) => {
    const [selectedPaymentUnit, setSelectedPaymentUnit] = useState(
        paymentUnits[0]
    );
    const [inputPrice, setInputPrice] = useState('');
    const [errors, setErrors] = useState({
        price: '',
        paymentOptions: '',
    });

    const handlePriceInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setInputPrice(value);
        updateFormData({ price: value });
        setErrors((prevErrors) => ({ ...prevErrors, price: '' }));
    };

    useEffect(() => {
        if (paymentUnits.length > 0) {
            setSelectedPaymentUnit(paymentUnits[0]);
            updateFormData({ paymentUnit: paymentUnits[0] });
        }
    }, []);

    const handleRadioChange = (e) => {
        setSelectedPaymentUnit(e.target.value);
        updateFormData({ paymentUnit: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === 'readyToNegotiate') {
            updateFormData({ readyToNegotiate: checked });
        } else {
            const updatedPaymentOptions = checked
                ? [...formData.paymentOptions, value]
                : formData.paymentOptions.filter((option) => option !== value);
            updateFormData({ paymentOptions: updatedPaymentOptions });
            setErrors((prevErrors) => ({ ...prevErrors, paymentOptions: '' }));
        }
    };

    const formatNumber = (value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const handlePriceKeyDown = (e) => {
        const allowedKeys = [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Backspace',
            'Delete',
            'Tab',
        ];
        if (!allowedKeys.includes(e.key) && !/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    useImperativeHandle(ref, () => ({
        validateFields: () => {
            let isValid = true;
            const newErrors = {};

            if (!inputPrice) {
                newErrors.price = 'Укажите стоимость услуги';
                isValid = false;
            }

            if (formData.paymentOptions.length === 0) {
                newErrors.paymentOptions =
                    'Выберите хотя бы одно условие оплаты';
                isValid = false;
            }

            setErrors(newErrors);
            return isValid;
        },
    }));

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
                        value={inputPrice ? `${formatNumber(inputPrice)}` : ''}
                        onChange={handlePriceInputChange}
                        onKeyDown={handlePriceKeyDown}
                    />
                    <div className='radio-buttons'>
                        {paymentUnits.map((unit) => (
                            <label
                                key={unit}
                                className='radio-item'
                            >
                                <input
                                    type='radio'
                                    name='paymentUnit'
                                    value={unit}
                                    className='input-radio'
                                    onChange={handleRadioChange}
                                    checked={selectedPaymentUnit === unit}
                                />
                                <span className='radio-title'>{unit}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {errors.price && <p className='error-text'>{errors.price}</p>}

                <p className='new-ad-title without-bottom-margine'>
                    Готовность торговаться:
                </p>
                <div className='checkbox-item'>
                    <label className='checkbox-label'>
                        <input
                            name='readyToNegotiate'
                            type='checkbox'
                            className='input-checkbox'
                            onChange={handleCheckboxChange}
                        />
                        <span className='checkbox-title'>Торг</span>
                    </label>
                </div>

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
                                    id={`payment-option-${index}`}
                                    value={paymentOption}
                                    className='input-checkbox'
                                    name='paymentOptions'
                                    onChange={handleCheckboxChange}
                                />
                                <span className='checkbox-title'>
                                    {paymentOption}
                                </span>
                            </label>
                        </div>
                    ))}
                    {errors.paymentOptions && (
                        <p className='error-text'>{errors.paymentOptions}</p>
                    )}
                </div>
            </div>
        </div>
    );
});

export default PaymentSection;
