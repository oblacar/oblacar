// src/components/Login/Login.js

import React, { useState, useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import AuthContext from '../../hooks/Authorization/AuthContext';

import './Login.css'; // Импортируйте стили

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const { login, logout } = useContext(AuthContext); // Получаем функцию login из AuthContext

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Неверный формат электронной почты')
                .required('Электронная почта обязательна'),
            password: Yup.string().required('Пароль обязателен'),
        }),
        onSubmit: async (values) => {
            try {
                const user = await login(values.email, values.password); // Используем функцию login из AuthContext

                console.log('Вход выполнен успешно!', user);
            } catch (error) {
                setErrorMessage('Ошибка входа: ' + error.message); // Обработка ошибок
            }
        },
    });

    const handleLogout = async () => {
        try {
            await logout(); // Используем await для ожидания завершения выхода
            localStorage.removeItem('authToken'); // Очистка токена из localStorage
        } catch (error) {
            console.error('Ошибка выхода:', error.message); // Обработка ошибок
        }
    };

    return (
        <div className='login-container'>
            <h1>Вход в систему</h1>
            <form onSubmit={formik.handleSubmit}>
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
                        <div style={{ color: 'red' }}>
                            {formik.errors.email}
                        </div>
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
                        <div style={{ color: 'red' }}>
                            {formik.errors.password}
                        </div>
                    ) : null}
                </div>

                <button type='submit'>Войти</button>
                <button
                    type='button'
                    onClick={handleLogout}
                >
                    Выйти
                </button>
            </form>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </div>
    );
};

export default Login;
