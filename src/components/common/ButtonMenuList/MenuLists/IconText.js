// src/components/ButtonMenuList/MenuLists/IconText.js

import React from 'react';
import {
    FaUser,
    FaSignInAlt,
    FaUserPlus,
    FaTruck,
    FaPlus,
} from 'react-icons/fa'; // Импортируем иконки
import styles from './MenuLists.module.css';

const iconMap = {
    FaUser: <FaUser />,
    FaSignInAlt: <FaSignInAlt />,
    FaUserPlus: <FaUserPlus />,
    FaTruck: <FaTruck />,
    FaPlus: <FaPlus />,
};

const IconText = ({ icon, label }) => {
    return (
        <div className={styles.iconText}>
            {iconMap[icon]} {/* Отображаем иконку */}
            <span>{label}</span>
        </div>
    );
};

export default IconText;
