// src/components/Register/Register.js
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../../hooks/Authorization/AuthContext';
import './Register.css';
import Button from '../common/Button/Button';
import ErrorText from '../common/ErrorText/ErrorText';
import Preloader from '../common/Preloader/Preloader';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setErrorMessage('');
    }, []);

    const navigate = useNavigate();

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
                .required('Электронная почта обязательна - это будет ваш логин.'),
            password: Yup.string()
                .min(6, 'Пароль должен содержать минимум 6 символов')
                .required('Пароль обязателен'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
                .required('Подтверждение пароля обязательно'),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                await register({
                    firstName: values.firstName,
                    phone: values.phone,
                    email: values.email,
                    password: values.password,
                });
                console.log('Регистрация успешна!');
                navigate('/');
            } catch (error) {
                setLoading(false);
                console.error('Ошибка регистрации: ' + error.message);
                setErrorMessage(error.message);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <>
            <div className="register-container">
                <h1>Регистрация пользователя</h1>

                <ErrorText errorMessage={errorMessage} />

                <form onSubmit={formik.handleSubmit}>
                    <div>
                        <label htmlFor="firstName">Имя</label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            className="register-input"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.firstName}
                        />
                        {formik.touched.firstName && formik.errors.firstName ? (
                            <div className="error">{formik.errors.firstName}</div>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="phone">Телефон</label>
                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            className="register-input"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.phone}
                        />
                        {formik.touched.phone && formik.errors.phone ? (
                            <div className="error">{formik.errors.phone}</div>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="email">Электронная почта</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="register-input"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div className="error">{formik.errors.email}</div>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="register-input"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <div className="error">{formik.errors.password}</div>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword">Подтверждение пароля</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="register-input"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.confirmPassword}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                            <div className="error">{formik.errors.confirmPassword}</div>
                        ) : null}
                    </div>

                    <div className='register-divider'>
                    </div>
                    
                    <Button
                        type="submit"
                        size_width="large"
                        size_height="medium"
                    >
                        Зарегистрироваться
                    </Button>
                </form>
            </div>

            {loading && (
                <div className="preloader-register">
                    <Preloader />
                </div>
            )}
        </>
    );
};

export default Register;
