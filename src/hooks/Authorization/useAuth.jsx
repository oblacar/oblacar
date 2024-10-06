// src/hooks/Authorization/useAuth.js

import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Используем именованный импорт

const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const { state, dispatch } = context;

    const login = (user) => {
        dispatch({ type: 'LOGIN', payload: user });
    };

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return {
        user: state.user,
        isAuthenticated: !!state.user, // Возвращаем true или false в зависимости от наличия пользователя
        login,
        logout,
    };
};

export default useAuth;
