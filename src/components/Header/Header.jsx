// src/components/Header/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import IconButton from '../common/IconButton/IconButton'; // Импортируем новый компонент
import { FaUser, FaTruck, FaBox } from 'react-icons/fa'; // Иконки

function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Логотип */}
                <Link
                    to='/'
                    className={styles.logo}
                >
                    <img
                        src='/logo/logo-oblacar.png'
                        alt='Oblacar Logo'
                        className={styles.logoImage}
                    />
                </Link>

                {/* Иконки с кнопками */}
                <nav className={styles.nav}>
                    <Link to='/profile'>
                        <IconButton
                            icon={FaUser}
                            label='Профиль'
                        />
                    </Link>
                    <Link to='/find-vehicle'>
                        <IconButton
                            icon={FaTruck}
                            label='Найти машину'
                        />
                    </Link>
                    <Link to='/find-cargo'>
                        <IconButton
                            icon={FaBox}
                            label='Найти груз'
                        />
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;
