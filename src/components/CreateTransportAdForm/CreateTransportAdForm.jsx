// src/components/CreateTransportAdForm.js
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TransportAdService from '../services/TransportAdService';
import styles from './CreateTransportAdForm.module.css'; // Добавьте свои стили

const CreateTransportAdForm = () => {
    const formik = useFormik({
        initialValues: {
            vehicleType: '',
            availabilityDate: '',
            location: '',
            destination: '',
            price: '',
            description: '',
            contactInfo: '',
        },
        validationSchema: Yup.object({
            vehicleType: Yup.string().required(
                'Тип транспортного средства обязателен'
            ),
            availabilityDate: Yup.date()
                .required('Дата доступности обязательна')
                .nullable(),
            location: Yup.string().required('Город обязателен'),
            price: Yup.number()
                .required('Цена обязательна')
                .positive('Цена должна быть положительной'),
            description: Yup.string().required('Описание обязательно'),
            contactInfo: Yup.string().required(
                'Контактная информация обязательна'
            ),
        }),
        onSubmit: async (values) => {
            try {
                await TransportAdService.createAd(values);
                alert('Объявление успешно создано!');
                formik.resetForm(); // Сброс формы после успешной отправки
            } catch (error) {
                alert('Ошибка при создании объявления: ' + error.message);
            }
        },
    });

    return (
        <form
            onSubmit={formik.handleSubmit}
            className={styles.createTransportAdForm}
        >
            <h2>Создать новое объявление</h2>

            <div>
                <label htmlFor='vehicleType'>Тип транспортного средства</label>
                <input
                    id='vehicleType'
                    name='vehicleType'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.vehicleType}
                />
                {formik.touched.vehicleType && formik.errors.vehicleType ? (
                    <div>{formik.errors.vehicleType}</div>
                ) : null}
            </div>

            <div>
                <label htmlFor='availabilityDate'>Дата доступности</label>
                <input
                    id='availabilityDate'
                    name='availabilityDate'
                    type='date'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.availabilityDate}
                />
                {formik.touched.availabilityDate &&
                formik.errors.availabilityDate ? (
                    <div>{formik.errors.availabilityDate}</div>
                ) : null}
            </div>

            <div>
                <label htmlFor='location'>Город</label>
                <input
                    id='location'
                    name='location'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.location}
                />
                {formik.touched.location && formik.errors.location ? (
                    <div>{formik.errors.location}</div>
                ) : null}
            </div>

            <div>
                <label htmlFor='destination'>Предполагаемое направление</label>
                <input
                    id='destination'
                    name='destination'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.destination}
                />
            </div>

            <div>
                <label htmlFor='price'>Цена</label>
                <input
                    id='price'
                    name='price'
                    type='number'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.price}
                />
                {formik.touched.price && formik.errors.price ? (
                    <div>{formik.errors.price}</div>
                ) : null}
            </div>

            <div>
                <label htmlFor='description'>Описание</label>
                <textarea
                    id='description'
                    name='description'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.description}
                />
                {formik.touched.description && formik.errors.description ? (
                    <div>{formik.errors.description}</div>
                ) : null}
            </div>

            <div>
                <label htmlFor='contactInfo'>Контактная информация</label>
                <input
                    id='contactInfo'
                    name='contactInfo'
                    type='text'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.contactInfo}
                />
                {formik.touched.contactInfo && formik.errors.contactInfo ? (
                    <div>{formik.errors.contactInfo}</div>
                ) : null}
            </div>

            <button type='submit'>Создать объявление</button>
        </form>
    );
};

export default CreateTransportAdForm;
