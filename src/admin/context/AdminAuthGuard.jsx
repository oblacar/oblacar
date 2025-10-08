// src/admin/context/AdminAuthGuard.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../hooks/Authorization/AuthContext';
import UserContext from '../../hooks/UserContext';

export default function AdminAuthGuard({ children }) {
    const { isAuthenticated } = useContext(AuthContext);           // флаг авторизации (Firebase Auth)
    const { user: profile, isUserLoaded } = useContext(UserContext); // профиль из БД с userRole
    const location = useLocation();

    // Ждём, пока профиль подтянется (чтобы не дёргать лишние редиректы)
    if (!isUserLoaded) return null; // или свой спиннер

    // Нет авторизации — на страницу входа
    if (!isAuthenticated) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // (Опционально) Режем доступ заблокированным
    if (profile?.status === 'blocked') {
        return <Navigate to="/blocked" replace />;
    }

    // Доступ только для admin
    const isAdmin = profile?.userRole === 'admin';
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
