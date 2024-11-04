import React, { createContext, useReducer, useEffect } from 'react';
import authReducer from './authReducer';
import { userService } from '../../services/UserService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        userId: null,
        isAuthenticated: false,
    });

    // Эффект для проверки состояния пользователя при загрузке
    useEffect(() => {
        const token = localStorage.getItem('authToken');

        // Если токена нет, делаем принудительный выход
        if (!token) {
            userService.logoutUser();

            dispatch({ type: 'LOGOUT' });

            return; // Останавливаем выполнение, если токен отсутствует
        }

        // Отслеживаем изменения аутентификации
        const unsubscribe = userService.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    dispatch({ type: 'LOGIN', payload: { userId: user.uid } });

                    console.log(
                        'Пользователь аутентифицирован, UID:',
                        user.uid
                    );
                } catch (error) {
                    console.error(
                        'Ошибка загрузки профиля пользователя:',
                        error.message
                    );
                }
            } else {
                dispatch({ type: 'LOGOUT' });
            }
        });

        // Очистка подписки при размонтировании компонента
        return () => unsubscribe();
    }, []);

    // Функция для регистрации
    const register = async (data) => {
        try {
            // Регистрируем пользователя и получаем объект пользователя
            const user = await userService.registerUser(data);

            // Обновляем состояние аутентификации
            dispatch({ type: 'LOGIN', payload: { userId: user.uid } });

            // Сохраняем токен в localStorage
            localStorage.setItem('authToken', user.uid);
            localStorage.setItem('authEmail', user.email);

            console.log(
                'Пользователь успешно вошёл в систему после регистрации'
            );

            return user; //TODO пока нигде не используется вроде бы. Нужно проверять.
        } catch (error) {
            // Выбросываем ошибку
            throw new Error(error.message); // Пробрасываем ошибку дальше
        }
    };

    // Функция для входа
    const login = async (email, password, isRememberUser) => {
        try {
            const user = await userService.loginUser({ email, password });

            // Обновление состояния аутентификации
            dispatch({ type: 'LOGIN', payload: { userId: user.uid } });

            // Если выбран "Запомнить меня"
            if (isRememberUser) {
                localStorage.setItem('authToken', user.uid); // Сохраняем UID в localStorage
                localStorage.setItem('authEmail', user.email); // Сохраняем email в localStorage
            } else {
                // Если не выбран, можно очистить localStorage
                localStorage.removeItem('authToken');
                localStorage.removeItem('authEmail');
            }
        } catch (error) {
            throw new Error(error.message); // Пробрасываем ошибку дальше
        }
    };

    // Функция для выхода
    const logout = async () => {
        try {
            await userService.logoutUser();

            // Обновление состояния аутентификации
            dispatch({ type: 'LOGOUT' });

            // Очищаем localStorage при выходе
            localStorage.removeItem('authToken');
            localStorage.removeItem('authEmail');
        } catch (error) {
            console.error('Ошибка выхода:', error.message);
        }
    };

    // Возвращаем контекст с необходимыми параметрами
    return (
        <AuthContext.Provider
            value={{
                userId: state.userId,
                isAuthenticated: state.isAuthenticated,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
