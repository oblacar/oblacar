import React, { useState } from 'react';
import styles from './IconWithTooltip.module.css';

const IconWithTooltip = ({ icon, tooltipText, size = '24px' }) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const handleMouseEnter = () => {
        if (tooltipText) {
            setTimeout(() => {
                setIsTooltipVisible(true);
            }, 500); // Показываем подсказку через 1 секунду
        }
    };

    const handleMouseLeave = () => {
        setIsTooltipVisible(false); // Убираем подсказку при уходе курсора
    };

    return (
        <div
            className={styles.iconContainer}
            style={{ width: size, height: size }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={styles.icon}
                style={{ width: size, height: size }}
            >
                {icon}
            </div>
            {isTooltipVisible && (
                <div className={styles.tooltip}>{tooltipText}</div>
            )}
        </div>
    );
};

export default IconWithTooltip;
