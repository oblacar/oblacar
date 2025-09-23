// src/components/Login/Login.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import Button from '../common/Button/Button';
import ErrorText from '../common/ErrorText/ErrorText';
import Preloader from '../common/Preloader/Preloader';

import AuthContext from '../../hooks/Authorization/AuthContext';

import './Login.css';

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const { login } = useContext(AuthContext);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setErrorMessage('');
    }, []);

    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Неверный формат электронной почты').required('Электронная почта обязательна'),
            password: Yup.string().required('Пароль обязателен'),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const user = await login(values.email, values.password, rememberMe);
                console.log('Вход выполнен успешно!', user);
                navigate('/');
            } catch (error) {
                setLoading(false);
                setErrorMessage(error.message);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <>
            <div className="login-container">
                <h1>Вход в систему</h1>

                <ErrorText errorMessage={errorMessage} />

                <form onSubmit={formik.handleSubmit}>
                    <div>
                        <label htmlFor="email">Электронная почта</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="login-input"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div style={{ color: 'red' }}>{formik.errors.email}</div>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="login-input"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <div style={{ color: 'red' }}>{formik.errors.password}</div>
                        ) : null}
                    </div>

                    <div className="remember-me-container">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            name="rememberMe"
                            className="remember-me-checkbox login-input login-input--checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        {/* Можно заменить на <label htmlFor="rememberMe"> для лучшей доступности */}
                        <span
                            className="remember-me-label"
                            onClick={() => setRememberMe((v) => !v)}
                        >
                            Запомнить меня
                        </span>
                    </div>

                    <div>
                        <Button type="submit" size_width="wide">
                            Войти
                        </Button>
                    </div>

                    <div className="remember-me-line" />
                    <span className="or-word">или</span>
                    <Link className="link-word" to="/register">
                        Зарегистрироваться
                    </Link>
                </form>
            </div>

            {loading && (
                <div className="preloader-login">
                    <Preloader />
                </div>
            )}
        </>
    );
};

export default Login;
