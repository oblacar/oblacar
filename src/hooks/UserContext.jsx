import React, { createContext, useContext, useReducer } from 'react';
import User from '../entities/User/User'; // Импортируем класс User

// Создаем контекст
const UserContext = createContext();

// Начальное состояние пользователя с использованием класса User
const initialState = {
    user: new User(
        null, // userId
        null, // userPhoto
        '', // userName
        '', // userEmail
        '', // userPhone
        '', // userAbout
        '', // userPassword
        new Date(), // registrationDate (по умолчанию текущая дата)
        null // firebaseToken
    ),
};

// Редьюсер для управления состоянием пользователя
const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload }; // Полностью заменяем пользователя
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } }; // Обновляем поля пользователя
        case 'CLEAR_USER':
            return initialState; // Сбрасываем состояние пользователя
        default:
            return state;
    }
};

// Провайдер контекста
export const UserProvider = ({ children }) => {
    // Используем useReducer для управления состоянием пользователя
    const [state, dispatch] = useReducer(userReducer, initialState);

    return (
        <UserContext.Provider value={{ state, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
