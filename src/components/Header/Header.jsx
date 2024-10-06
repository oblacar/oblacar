// src/components/Header/Header.js

import React from 'react';
import styles from './Header.module.css'; // Импортируем стили

import { IconDropdownMenuBar } from '../IconHoverCardBar/IconHoverCardBar';

import { Link } from 'react-router-dom';
import useAuth from '../../hooks/Authorization/useAuth'; // Импортируем useAuth

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth(); // Получаем информацию о пользователе из моего хука

    return (
        <header className={styles.header}>
            <div className={styles.topLine}>
                <div className={styles.container}>
                    <div className={styles.logo}>
                        <img
                            src='/logo/logo-oblacar.png'
                            alt='Логотип'
                            className={styles.logoImage}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.middleLine}>
                <span className={styles.headerSlogan}>
                    Простота в поиске, надежность в перевозке.
                </span>
                {isAuthenticated ? (
                    <>
                        <span>Привет, {user.email}!</span>
                        <button onClick={logout}>Выйти</button>
                    </>
                ) : (
                    <>
                        <Link to='/login'>Вход</Link>
                        <Link to='/register'>Регистрация</Link>
                    </>
                )}
            </div>
            <div className={styles.bottomLine}>
                <IconDropdownMenuBar className={styles.iconsArea} />
            </div>
        </header>
    );
};

export default Header;
