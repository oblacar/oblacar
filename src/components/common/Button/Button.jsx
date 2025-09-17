// src/components/Button/Button.js

// Примеры использования:
//  <Button type='submit' size='medium'>Войти</Button>
//  <Button type='button' onClick={handleLogout} size='medium'>Выйти</Button>
// размеры по ширине: large, medium, small, width
// размеры по высоте: high medium low
// type_btn = '', // тип кнопки: пустая - страндарт, yes - да, no - нет, orange -оранжевая, reverse - обычная перевернутая
// reverse-no, reverse-yes

import React from 'react';
import './Button.css'; // Импортируйте стили

const Button = ({
    type = 'button',
    type_btn = '', 
    size_width = '',
    size_height = 'medium',
    children,
    icon = null, // Новый проп для иконки
    onClick,
}) => {
    return (
        <button
            type={type}
            className={`button ${type_btn} button-width-${size_width} button-height-${size_height}`}
            onClick={onClick}
        >
            {icon && <span className='button-icon'>{icon}</span>}{' '}
            {/* Отображение иконки */}
            {children}
        </button>
    );
};

export default Button;
