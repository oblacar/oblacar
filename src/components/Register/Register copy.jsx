// src/components/Register/Register.js

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userService } from '../../services/UserService'; // Импортируйте UserService
import './Register.css'; // Импорт стилей

import Button from '../common/Button/Button';

const Register = () => {
    const formik = useFormik({
        initialValues: {
            firstName: '',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('Введите ваше Имя'),
            phone: Yup.string().required('Введите телефон'),
            email: Yup.string()
                .email('Неверный формат электронной почты')
                .required(
                    'Электронная почта обязательна - это будет ваш логин.'
                ),
            password: Yup.string()
                .min(6, 'Пароль должен содержать минимум 6 символов')
                .required('Пароль обязателен'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
                .required('Подтверждение пароля обязательно'),
        }),
        onSubmit: async (values) => {
            try {
                await userService.registerUser({
                    firstName: values.firstName,
                    phone: values.phone,
                    email: values.email,
                    password: values.password,
                    role: 'владелец груза', // или другая роль по умолчанию
                    profilePicture: null,
                    additionalInfo: {},
                });
                alert('Регистрация успешна!'); // Успешная регистрация
            } catch (error) {
                alert('Ошибка регистрации: ' + error.message); // Обработка ошибок
            }
        },
    });

    return (
        <div className='register-container'>
            <h1>Регистрация пользователя</h1>
            <form onSubmit={formik.handleSubmit}>
                <div>
                    <label htmlFor='firstName'>Имя</label>
                    <input
                        id='firstName'
                        name='firstName'
                        type='text'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.firstName}
                    />
                    {formik.touched.firstName && formik.errors.firstName ? (
                        <div className='error'>{formik.errors.firstName}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor='phone'>Телефон</label>
                    <input
                        id='phone'
                        name='phone'
                        type='text'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.lastName}
                    />
                    {formik.touched.phone && formik.errors.phone ? (
                        <div className='error'>{formik.errors.phone}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor='email'>Электронная почта</label>
                    <input
                        id='email'
                        name='email'
                        type='email'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email ? (
                        <div className='error'>{formik.errors.email}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor='password'>Пароль</label>
                    <input
                        id='password'
                        name='password'
                        type='password'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <div className='error'>{formik.errors.password}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor='confirmPassword'>
                        Подтверждение пароля
                    </label>
                    <input
                        id='confirmPassword'
                        name='confirmPassword'
                        type='password'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                    />
                    {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword ? (
                        <div className='error'>
                            {formik.errors.confirmPassword}
                        </div>
                    ) : null}
                </div>
                <Button
                    type='submit'
                    size_width='large'
                    size_height='medium'
                    children='Зарегистрироваться'
                />
            </form>
        </div>
    );
};

export default Register;
