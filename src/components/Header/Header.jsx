// src/components/Header/Header.js

import React from 'react';
import styles from './Header.module.css'; // Импортируем стили

import { IconDropdownMenuBar } from '../IconHoverCardBar/IconHoverCardBar';

const Header = () => {
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
            <div className='styles.middleLine'>
                <div className={styles.headerSlogan}>
                    Простота в поиске, надежность в перевозке.
                </div>
            </div>
            <div className={styles.bottomLine}>
                <IconDropdownMenuBar className={styles.iconsArea} />
            </div>
        </header>
    );
};

export default Header;
