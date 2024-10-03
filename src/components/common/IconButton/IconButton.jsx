// src/components/IconButton/IconButton.js
import React from 'react';
import styles from './IconButton.module.css'; // Импорт стилей

function IconButton({ icon: Icon, label, onClick }) {
    return (
        <button
            className={styles.iconButton}
            onClick={onClick}
        >
            <Icon className={styles.icon} />
            <span className={styles.label}>{label}</span>
        </button>
    );
}

export default IconButton;
