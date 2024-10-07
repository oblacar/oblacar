// src/hooks/Authorization/AuthContext.js

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import authReducer from './authReducer'; // Импортируем ваш редюсер
import { userService } from '../../services/UserService'; // Импортируем UserService для аутентификации

// Создание контекста
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null }); // Начальное состояние

    // Эффект для проверки наличия токена при загрузке
    useEffect(() => {
        console.log('Проверяем токен на старте');
        const token = localStorage.getItem('authToken'); // Проверяем наличие токена
        console.log('Проверили токен на старте');
        if (token) {
            console.log('Проверили токен - вошли в странный блок');
            const user = { email: 'example@example.com' }; // Здесь должна быть логика извлечения пользователя из токена
            dispatch({ type: 'LOGIN', payload: user }); // Обновляем состояние при входе
        }
    }, []);

    // Функция для входа
    const login = async (email, password) => {
        try {
            const user = await userService.loginUser({ email, password }); // Вход через UserService

            localStorage.setItem('authToken', user.uid); // Сохраняем uid в localStorage

            dispatch({ type: 'LOGIN', payload: user }); // Обновляем состояние с новым пользователем
        } catch (error) {
            console.error('Ошибка входа:', error.message); // Обработка ошибок
        }
    };

    // Функция для выхода
    const logout = async () => {
        try {
            await userService.logoutUser(); // Выход через UserService

            localStorage.removeItem('authToken'); // Очистка токена из localStorage
            
            dispatch({ type: 'LOGOUT' }); // Обновляем состояние при выходе
        } catch (error) {
            console.error('Ошибка выхода:', error.message); // Обработка ошибок
        }
    };

    // Возвращаем контекст с необходимыми параметрами
    return (
        <AuthContext.Provider
            value={{
                user: state.user, // Объект пользователя
                isAuthenticated: !!state.user, // true, если пользователь существует
                login, // Функция входа
                logout, // Функция выхода
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
