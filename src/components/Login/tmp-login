// src/components/Login/Login.js

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userService } from '../../services/UserService'; // Импортируйте userService
import './Login.css'; // Импортируйте стили

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');

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
                const user = await userService.loginUser({
                    email: values.email,
                    password: values.password,
                });

                // Сохранение токена (или ID пользователя) в localStorage
                localStorage.setItem('authToken', user.uid); // Используем UID пользователя
                alert('Вход выполнен успешно!'); // Успешный вход
            } catch (error) {
                setErrorMessage('Ошибка входа: ' + error.message); // Обработка ошибок
            }
        },
    });

    const handleLogout = () => {
        userService.logoutUser(); // Вызов функции выхода
        localStorage.removeItem('authToken'); // Очистка токена из localStorage
        alert('Вы вышли из системы'); // Уведомление о выходе
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
