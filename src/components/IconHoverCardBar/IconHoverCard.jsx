// src/components/IconHoverCard.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './IconHoverCardBar.module.css'; // Импортируем стили

const IconHoverCard = ({
    type,
    iconRef,
    IconComponent,
    HoverCardComponent,
    iconCoordinates,
    windowWidth,
}) => {
    const [isHovered, setIsHovered] = useState(false); // Состояние для управления видимостью

    const handleMouseEnter = () => {
        setIsHovered(true); // Устанавливаем состояние в true при наведении
    };

    const handleMouseLeave = () => {
        setIsHovered(false); // Устанавливаем состояние в false при уходе курсора
    };

    return (
        <div className={styles.iconHoverArea}>
            <div
                className={styles.headerMarketIcon}
                ref={iconRef}
            >
                <Link to='/user-profile'>
                    <div
                        className={styles.iconContainer}
                        onMouseEnter={handleMouseEnter} // Обработчик для наведения
                        onMouseLeave={handleMouseLeave} // Обработчик для ухода мыши
                    >
                        <IconComponent
                            className={`${styles.iconHover} ${
                                isHovered ? styles.iconHovered : ''
                            }`}
                        />
                        <span
                            className={`${styles.iconLabel} ${
                                isHovered ? styles.iconHovered : ''
                            }`}
                        >
                            {type}
                        </span>
                    </div>
                </Link>
            </div>
            <HoverCardComponent
                isHoveredIcon={isHovered}
                iconCoordinates={iconCoordinates}
                windowWidth={windowWidth}
            />
        </div>
    );
};

export default IconHoverCard;
