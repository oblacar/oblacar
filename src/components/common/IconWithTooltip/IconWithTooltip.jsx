import React, { useState, useRef, useEffect } from 'react';
import styles from './IconWithTooltip.module.css';

// 💡 Переименовываем 'icon' в 'Icon' с заглавной буквы
const IconWithTooltip = ({
    icon: Icon,
    tooltipText,
    size = '24px',
    onClick,
}) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const timeoutRef = useRef(null);

    // Очистка таймера при размонтировании (чтобы избежать утечек)
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleMouseEnter = () => {
        if (tooltipText) {
            // Очищаем предыдущий таймер, если он был
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Запускаем новый таймер
            timeoutRef.current = setTimeout(() => {
                setIsTooltipVisible(true);
            }, 500);
        }
    };

    const handleMouseLeave = () => {
        // Очищаем таймер, чтобы подсказка не появилась после ухода курсора
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsTooltipVisible(false);
    };

    return (
        <div
            className={styles.iconContainer}
            // 💡 Добавили onClick, который передали извне
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* ✅ Рендерим 'Icon' как компонент, передавая ему размер */}
            <Icon
                style={{ width: size, height: size }} // Часто иконки из react-icons лучше стилизовать через inline style
                size={size} // Передаем пропс size, если Icon его поддерживает
                className={styles.icon}
            />

            {isTooltipVisible && (
                <div className={styles.tooltip}>{tooltipText}</div>
            )}
        </div>
    );
};

export default IconWithTooltip;
