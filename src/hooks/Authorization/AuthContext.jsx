// src/hooks/Authorization/AuthContext.js

import React, { createContext, useReducer, useEffect } from 'react';
import authReducer from './authReducer'; // Импортируем ваш редюсер
import { userService } from '../../services/UserService'; // Импортируем UserService для аутентификации

// Создание контекста
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null }); // Начальное состояние

    // Эффект для проверки наличия токена при загрузке
    useEffect(() => {
        const token = localStorage.getItem('authToken'); // Проверяем наличие токена

        if (token) {
            //TODO токен уже существует в системе, нужно как-то подтягивать данные юзера для этого пользователя
            console.log('токен существует: ', token);

            const email = localStorage.getItem('authEmail');

            if (email) {
                const user = { email: email };
                dispatch({ type: 'LOGIN', payload: user }); // Обновляем состояние при входе
            } else {
                console.log(
                    'Почта пользователя (логин) отсуствует при обновлении страницы.'
                );
            }
        }
    }, []);

    // Функция для входа
    const login = async (email, password, isRememberUser) => {
        try {
            const user = await userService.loginUser({ email, password }); // Вход через UserService

            if (isRememberUser) {
                // внесем uid и емэйл в localStorage
                localStorage.setItem('authToken', user.uid); // Сохраняем uid в localStorage
                localStorage.setItem('authEmail', user.email); // Сохраняем uid в localStorages
            }

            //TODO нужно протестировать после подготовки формы Пользователя
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
            localStorage.removeItem('authEmail'); // Очистка токена из localStorage

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
