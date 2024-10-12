// src/components/Login/Login.js

import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom'; // Импортируем Link для навигации
import { useFormik } from 'formik';
import * as Yup from 'yup';

import Button from '../common/Button/Button'; // Импортируем новый компонент Button
import ErrorText from '../common/ErrorText/ErrorText'

import AuthContext from '../../hooks/Authorization/AuthContext';

import './Login.css'; // Импортируйте стили

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const { login, error } = useContext(AuthContext); // Получаем функцию login из AuthContext
    const [rememberMe, setRememberMe] = useState(true);

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
                const user = await login(
                    values.email,
                    values.password,
                    rememberMe
                ); // Используем функцию login из AuthContext

                console.log('Вход выполнен успешно!', user);
            } catch (error) {
                setErrorMessage('Ошибка входа: ' + error.message); // Обработка ошибок
            }
        },
    });

    return (
        <div className='login-container'>
            <h1>Вход в систему</h1>

            <ErrorText error={error} />

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
                <div className='remember-me-container'>
                    <input
                        type='checkbox'
                        id='rememberMe'
                        name='rememberMe'
                        className='remember-me-checkbox'
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)} // Обновляем состояние флажка
                    />
                    <span
                        htmlFor='rememberMe'
                        className='remember-me-label'
                        onClick={() => setRememberMe(() => !rememberMe)}
                    >
                        Запомнить меня
                    </span>
                </div>
                <div>
                    <Button
                        type='submit'
                        size_width='wide'
                    >
                        Войти
                    </Button>
                </div>
                <div className='remember-me-line'></div> {/* Линия сверху */}
                <span className='or-word'>или</span>
                <Link
                    className='link-word'
                    to='/register'
                >
                    Зарегистрироваться
                </Link>
            </form>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </div>
    );
};

export default Login;
