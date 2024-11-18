import React from 'react';
import styles from './ToggleMode.module.css';
import { FaTruck, FaCube } from 'react-icons/fa';

const ToggleMode = ({ isCarSearch, setIsCarSearch }) => {
    return (
        <div className={styles.container}>
            <div
                className={`${styles.toggleMode} ${
                    isCarSearch ? styles.car : ''
                }`}
                onClick={() => setIsCarSearch(true)}
            >
                <FaTruck className={styles.icon} />
                <span>Найти машину</span>
            </div>
            <div
                className={`${styles.toggleMode} ${
                    !isCarSearch ? styles.cargo : ''
                }`}
                onClick={() => setIsCarSearch(false)}
            >
                <FaCube className={styles.icon} />
                <span>Найти груз</span>
            </div>
        </div>
    );
};

export default ToggleMode;
