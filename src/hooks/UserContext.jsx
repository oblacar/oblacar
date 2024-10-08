// src/hooks/Authorization/UserContext.js

import React, { createContext, useContext, useReducer } from 'react';

// Создаем контекст
const UserContext = createContext();

// Начальное состояние пользователя с фейковыми данными
const initialState = {
    user: {
        id: '1',
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'ivan.ivanov@example.com',
        password: 'password123', // На практике не храните пароль в открытом виде!
        role: 'владелец транспорта',
        registrationDate: '2024-01-01',
        profilePicture:
            'https://i.postimg.cc/HndzPNv7/fotor-ai-20241008122453.jpg',
        additionalInfo: 'Телефон: +1234567890', // Пример дополнительных данных
    },
};

// Редьюсер для управления состоянием пользователя
const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'CLEAR_USER':
            return { ...state, user: null };
        default:
            return state;
    }
};

// Провайдер контекста
export const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    return (
        <UserContext.Provider value={{ state, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};

// Хук для использования контекста
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default UserContext;
