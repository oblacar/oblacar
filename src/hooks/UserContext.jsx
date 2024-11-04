import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { userService } from '../services/UserService';

import AuthContext from './Authorization/AuthContext';

// Создаем контекст
const UserContext = createContext();

// Начальное состояние пользователя с пустыми полями
const initialState = {
    user: {
        userId: '',
        userPhoto: '',
        userName: 'Пользователь',
        userEmail: 'Email',
        userPhone: 'Telephone',
        userAbout: '',
        userPassword: '',
        registrationDate: '',
        firebaseToken: '',
    },
};

// Редьюсер для управления состоянием пользователя
const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload }; // Заменяем пользователя реальными данными
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } }; // Обновляем поля пользователя
        case 'CLEAR_USER':
            return { ...state, user: initialState.user }; // Возвращаемся к начальным пустым значениям
        default:
            return state;
    }
};

// Провайдер контекста
export const UserProvider = ({ children }) => {
    // Используем useReducer для управления состоянием пользователя
    const [state, dispatch] = useReducer(userReducer, initialState);
    const { userId, isAuthenticated } = useContext(AuthContext);

    // Загружаем данные пользователя из базы данных при первой загрузке или изменении `userId`
    useEffect(() => {
        if (userId && isAuthenticated) {
            const loadUserProfile = async () => {
                try {
                    const userProfile = await userService.getUserProfile(
                        userId
                    );
                    dispatch({ type: 'SET_USER', payload: userProfile });
                } catch (error) {
                    console.error(
                        'Ошибка при загрузке профиля пользователя:',
                        error
                    );
                }
            };
            loadUserProfile();
        } else {
            dispatch({ type: 'CLEAR_USER' });
        }
    }, [userId, isAuthenticated]);

    // Функция для обновления данных пользователя
    const updateUser = async (updatedUserData) => {
        try {
            await userService.updateUserProfile(userId, updatedUserData); // Сохраняем изменения в базе данных
            dispatch({ type: 'UPDATE_USER', payload: updatedUserData }); // Обновляем состояние в контексте
        } catch (error) {
            console.error('Ошибка при обновлении данных пользователя:', error);
        }
    };

    // Обновление пользователя по Id
    const updateUserByUserId = async (userId, updatedUserData) => {
        try {
            // Обновляем данные в Firebase через userService
            await userService.updateUserProfile(userId, updatedUserData);
            // После успешного обновления в Firebase, обновляем контекст
            dispatch({ type: 'UPDATE_USER', payload: updatedUserData });
        } catch (error) {
            console.error(
                'Ошибка обновления профиля пользователя:',
                error.message
            );
            throw new Error(error.message); // Для обработки ошибок в компоненте
        }
    };

    //TODO Shoulde check maybe we can use only isUserLoader without isAuthentithaed in components
    const isUserLoaded = Boolean(
        state.user && state.user.userId && state.user.userId === userId
    );

    return (
        <UserContext.Provider
            value={{ user: state.user, updateUser, isUserLoaded }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
