// src/components/Footer/Footer.js

import React from 'react';
import styles from './Footer.module.css'; // Импортируем стили

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p>© {new Date().getFullYear()} Oblacar. Все права защищены.</p>
        </footer>
    );
};

export default Footer;
