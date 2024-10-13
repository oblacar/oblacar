// src/components/Header/Header.js
// Header - содержит три рабочих полосы и логотип

import styles from './Header.module.css'; // Импортируем стили

import { IconDropdownMenuBar } from '../IconHoverCardBar/IconHoverCardBar';

import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.topLine}>
                <div className={styles.container}>
                    <Link to='/'>
                        <div className={styles.logo}>
                            <img
                                src='/logo/logo-oblacar.png'
                                alt='Логотип'
                                className={styles.logoImage}
                            />
                        </div>
                    </Link>
                </div>
            </div>
            <div className={styles.middleLine}>
                <span className={styles.headerSlogan}>
                    Простой поиск, надежная перевозка.
                </span>
            </div>
            <div className={styles.bottomLine}>
                <IconDropdownMenuBar className={styles.iconsArea} />
            </div>
        </header>
    );
};

export default Header;
