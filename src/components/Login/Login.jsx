// src/components/Login/Login.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import Button from '../common/Button/Button';
import ErrorText from '../common/ErrorText/ErrorText';
import Preloader from '../common/Preloader/Preloader';

import AuthContext from '../../hooks/Authorization/AuthContext';
import UserContext from '../../hooks/UserContext';

import './Login.css';

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [postLogin, setPostLogin] = useState(false); // флаг «логин прошёл, ждём профиль»

    const navigate = useNavigate();
    const location = useLocation();

    const { login, isAuthenticated } = useContext(AuthContext);
    const { user: profile, isUserLoaded } = useContext(UserContext);

    useEffect(() => {
        setErrorMessage('');
    }, []);

    // Редирект после логина, когда профиль подгрузился
    useEffect(() => {
        // Три условия:
        // 1) пользователь аутентифицирован (или только что залогинился)
        // 2) профиль подгружен из UserContext
        // 3) инициатором был логин отсюда (postLogin) ИЛИ юзер уже был залогинен
        if (!isUserLoaded) return;
        if (!(postLogin || isAuthenticated)) return;

        const role = profile?.userRole ?? 'user';
        const from = location.state?.from?.pathname;

        if (role === 'admin') {
            navigate('/admin', { replace: true });
        } else if (from) {
            navigate(from, { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }, [postLogin, isAuthenticated, isUserLoaded, profile, navigate, location.state]);

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Неверный формат электронной почты')
                .required('Электронная почта обязательна'),
            password: Yup.string().required('Пароль обязателен'),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setErrorMessage('');
                await login(values.email, values.password, rememberMe);
                setPostLogin(true); // не навигируем сразу — дождёмся профиля в useEffect
            } catch (error) {
                setErrorMessage(error?.message || 'Ошибка входа');
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
                            autoComplete="username"
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
                            autoComplete="current-password"
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
                        <span
                            className="remember-me-label"
                            onClick={() => setRememberMe((v) => !v)}
                        >
                            Запомнить меня
                        </span>
                    </div>

                    <div>
                        <Button type="submit" size_width="wide" disabled={loading}>
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
