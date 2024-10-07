// src/components/Button/Button.js

// Примеры использования:
//  <Button type='submit' size='medium'>Войти</Button>
//  <Button type='button' onClick={handleLogout} size='medium'>Выйти</Button>
// размеры: big, medium, small, width

import React from 'react';
import './Button.css'; // Импортируйте стили

const Button = ({ type = 'button', size = 'medium', children, onClick }) => {
    return (
        <button
            type={type}
            className={`button ${size}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
