// src/components/Header/Header.js

import React, { useContext } from 'react';
import styles from './Header.module.css'; // Импортируем стили

import { IconDropdownMenuBar } from '../IconHoverCardBar/IconHoverCardBar';

import { Link } from 'react-router-dom';
import AuthContext from '../../hooks/Authorization/AuthContext';

const Header = () => {
    const { logout, isAuthenticated, user } = useContext(AuthContext); // Получаем функцию login из AuthContext

    const handleLogout = async () => {
        try {
            await logout(); // Используем await для ожидания завершения выхода
        } catch (error) {
            console.error('Ошибка выхода:', error.message); // Обработка ошибок
        }
    };

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
            </div>
            <div className={styles.bottomLine}>
                <IconDropdownMenuBar className={styles.iconsArea} />
            </div>
        </header>
    );
};

export default Header;
