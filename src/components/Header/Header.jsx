// src/components/Header/Header.js

import React from 'react';
import { FaUser, FaTruck } from 'react-icons/fa'; // Импортируем иконки
import ButtonMenu from '../common/ButtonMenu/ButtonMenu';
import ButtonMenuList from '../common/ButtonMenuList/ButtonMenuList';
import styles from './Header.module.css'; // Импортируем стили

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    {/* Ваш логотип здесь */}
                    <img
                        src='/logo/logo-oblacar.png'
                        alt='Логотип'
                        className={styles.logoImage}
                    />
                </div>
                <nav className={styles.nav}>
                    {/* Добавляем ButtonMenu с соответствующими списками */}
                    <ButtonMenu
                        icon={FaUser}
                        label='Профиль'
                        MenuContent={ButtonMenuList}
                    />
                    <ButtonMenu
                        icon={FaTruck}
                        label='Грузы'
                        MenuContent={ButtonMenuList}
                    />
                </nav>
            </div>
        </header>
    );
};

export default Header;
