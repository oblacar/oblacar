// src/hooks/Authorization/AuthContext.js

import React, { createContext, useReducer, useContext } from 'react';
import authReducer from './authReducer';

// Создание контекста
const AuthContext = createContext();

// Провайдер для контекста
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null });

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук для использования контекста
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context; // Возвращаем контекст
};

// Экспортируем AuthContext как именованный экспорт
export { AuthContext }; // Теперь AuthContext экспортируется как именованный экспорт
