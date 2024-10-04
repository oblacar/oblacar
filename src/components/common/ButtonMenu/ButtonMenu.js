// src/components/ButtonMenu/ButtonMenu.js

import React, { useState, useRef, useEffect } from 'react';
import styles from './ButtonMenu.module.css'; // Импортируем стили из CSS-модуля

const ButtonMenu = ({ icon: Icon, label, MenuContent }) => {
    const [isHovered, setIsHovered] = useState(false); // Состояние для управления нав hover
    const dropdownRef = useRef(null); // Ссылка на выпадающее меню
    const buttonRef = useRef(null); // Ссылка на кнопку

    const handleMouseEnter = () => {
        setIsHovered(true); // Открываем меню при наведении
    };

    const handleMouseLeave = () => {
        setIsHovered(false); // Закрываем меню при уходе курсора
    };

    useEffect(() => {
        if (isHovered && buttonRef.current && dropdownRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect(); // Получаем размеры кнопки
            const dropdownWidth = dropdownRef.current.offsetWidth; // Получаем ширину выпадающего меню//Он у нас ничего про ширину окна не знает!!

            console.log(dropdownWidth);

            // Устанавливаем верхнюю позицию
            dropdownRef.current.style.top = `${buttonRect.bottom}px`;

            // Проверяем, помещается ли меню в окно
            const isOverflowingRight =
                Math.round(buttonRect.right + dropdownWidth) >
                window.innerWidth;

            // console.log(isOverflowingRight);
            // console.log(Math.round(buttonRect.right + dropdownWidth));
            // console.log(window.innerWidth);

            // Устанавливаем левую позицию
            if (isOverflowingRight) {
                dropdownRef.current.style.left = `${
                    window.innerWidth - dropdownWidth
                }px`; // При необходимости выравниваем по правому краю окна
            } else {
                // dropdownRef.current.style.left = `${buttonRect.left}px`; // Выравниваем по левому краю кнопки
                dropdownRef.current.style.left = `0px`; // Выравниваем по левому краю кнопки
            }
        }
    }, [isHovered]);

    return (
        <div
            className={styles.buttonMenu}
            onMouseEnter={handleMouseEnter} // Открываем меню при наведении
            onMouseLeave={handleMouseLeave} // Закрываем меню при уходе курсора
            ref={buttonRef} // Привязываем ссылку к элементу
        >
            <Icon className={styles.icon} />
            <span className={styles.label}>{label}</span>
            {isHovered && (
                <div
                    className={styles.dropdown}
                    ref={dropdownRef} // Привязываем ссылку к выпадающему меню
                    style={{
                        position: 'absolute', // Убедитесь, что позиционирование установлено
                    }}
                >
                    <MenuContent /> {/* Отображаем меню при наведении */}
                </div>
            )}
        </div>
    );
};

export default ButtonMenu;
