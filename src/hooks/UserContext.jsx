// src/hooks/Authorization/UserContext.js

import React, { createContext, useContext, useReducer } from 'react';

import User from '../entities/User/User'; // Импортируем класс User

// Создаем контекст
const UserContext = createContext();

// // Начальное состояние пользователя с фейковыми данными
// const initialState = {
//     user: {
//         id: '1',
//         firstName: 'Иван',
//         lastName: 'Иванов',
//         email: 'ivan.ivanov@example.com',
//         password: 'password123', // На практике не храните пароль в открытом виде!
//         role: 'владелец транспорта',
//         registrationDate: '2024-01-01',
//         profilePicture:
//             'https://i.postimg.cc/HndzPNv7/fotor-ai-20241008122453.jpg',
//         additionalInfo: 'Телефон: +1234567890', // Пример дополнительных данных
//     },
// };

// // Начальное состояние пользователя с использованием класса User
// const initialState = {
//     user: new User(
//         null, // userId
//         null, // userPhoto
//         '', // userName
//         '', // userEmail
//         '', // userPhone
//         '', // userAbout
//         '', // userPassword
//         new Date(), // registrationDate (по умолчанию текущая дата)
//         null, // firebaseToken
//         {} // additionalInfo
//     ),
// };

// Начальное состояние пользователя с использованием класса User
const initialState = {
    user: new User(
        '1', // 1 userId
        'https://i.postimg.cc/HndzPNv7/fotor-ai-20241008122453.jpg', // 2 userPhoto
        'Ibajj', // 3 userName
        'sds@sss', // 4 userEmail
        '2222', // 5 userPhone
        'Перевожу грузы. Есть машина. Мигаю фарами!', // 6 userAbout
        '242525', // 7 userPassword
        new Date(), // 8 registrationDate (по умолчанию текущая дата)
        null, // 9 firebaseToken
    ),
};

// Редьюсер для управления состоянием пользователя
const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } }; // Обновляем поля пользователя
        case 'CLEAR_USER':
            return {
                ...state,
                user: new User(null, null, '', '', '', '', '', null, null), // Обнуляем пользователя с соответствующими значениями
            };
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
