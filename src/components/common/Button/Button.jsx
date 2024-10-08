// src/components/Button/Button.js

// Примеры использования:
//  <Button type='submit' size='medium'>Войти</Button>
//  <Button type='button' onClick={handleLogout} size='medium'>Выйти</Button>
// размеры по ширине: large, medium, small, width
// размеры по высоте: high medium low

import React from 'react';
import './Button.css'; // Импортируйте стили

const Button = ({
    type = 'button',
    size_width = 'medium',
    size_height = 'medium',
    children,
    onClick,
}) => {
    return (
        <button
            type={type}
            className={`button button-width-${size_width} button-height-${size_height}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
