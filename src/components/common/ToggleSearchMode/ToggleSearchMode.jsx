import React from 'react';
import styles from './ToggleSwitch.module.css';

const ToggleSearchMode = ({
    firstOption,
    secondOption,
    isSelectFirst,
    onToggle,
}) => {
    const handleToggle = (isFirst) => {
        if (isSelectFirst !== isFirst) {
            onToggle(isFirst);
        }
    };

    return (
        <div className={styles.toggleContainer}>
            {/* Подвижная выделенная зона */}
            <div
                className={`${styles.highlight} ${
                    isSelectFirst ? styles.left : styles.right
                }`}
            ></div>

            {/* Первая кнопка */}
            <div
                className={`${styles.option} ${
                    isSelectFirst ? styles.selected : ''
                }`}
                onClick={() => handleToggle(true)}
            >
                <div className={styles.icon}>{firstOption.icon}</div>
                <span>{firstOption.label}</span>
            </div>

            {/* Вторая кнопка */}
            <div
                className={`${styles.option} ${
                    !isSelectFirst ? styles.selected : ''
                }`}
                onClick={() => handleToggle(false)}
            >
                <div className={styles.icon}>{secondOption.icon}</div>
                <span>{secondOption.label}</span>
            </div>
        </div>
    );
};


export default ToggleSearchMode;
