import React, {
    createContext,
    useReducer,
    useEffect,
    useContext,
    useState,
} from 'react';
import authReducer from './authReducer';
import { userService } from '../../services/UserService'; // Импорт UserService для взаимодействия с Firebase
// import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Импорт аутентификации Firebase

import UserContext from '../UserContext'; // Импортируем UserContext

// Создание контекста
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null });
    // const auth = getAuth();
    const { dispatch: userDispatch } = useContext(UserContext); // Получаем dispatch из UserContext напрямую
    const [error, setError] = useState(''); // Состояние для ошибок

    // Эффект для проверки состояния пользователя при загрузке
    useEffect(() => {
        const token = localStorage.getItem('authToken');

        // Если токена нет, делаем принудительный выход
        if (!token) {
            // auth.signOut();
            userService.logoutUser();
            dispatch({ type: 'LOGOUT' });
            userDispatch({ type: 'CLEAR_USER' });
            return; // Останавливаем выполнение, если токен отсутствует
        }

        const unsubscribe = userService.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    console.log(
                        'Пользователь аутентифицирован, UID:',
                        user.uid
                    );

                    // Если пользователь авторизован, подтягиваем его профиль из базы данных
                    const userProfile = await userService.getUserProfile(
                        user.uid
                    );

                    if (userProfile) {
                        console.log(
                            'Загружен профиль пользователя:',
                            userProfile
                        );

                        dispatch({
                            type: 'LOGIN',
                            payload: { ...user, ...userProfile },
                        });

                        userDispatch({
                            type: 'SET_USER',
                            payload: { ...user, ...userProfile },
                        });
                    } else {
                        console.log(
                            'Профиль пользователя не найден. Ожидаем его создание.'
                        );
                        // Здесь можно добавить логику ожидания, например, через setInterval, чтобы
                        // повторить попытку загрузки через несколько секунд.
                    }
                } catch (error) {
                    console.error(
                        'Ошибка загрузки профиля пользователя:',
                        error.message
                    );
                }
            } else {
                dispatch({ type: 'LOGOUT' });

                // Очищаем состояние пользователя в UserContext
                userDispatch({ type: 'CLEAR_USER' });
            }
        });

        // Очистка подписки при размонтировании компонента
        return () => unsubscribe();
    }, [userDispatch]);

    // Функция для регистрации
    const register = async (data) => {
        try {
            // Регистрируем пользователя и получаем объект пользователя
            const user = await userService.registerUser(data);

            // Загружаем профиль пользователя из базы данных
            const userProfile = await userService.getUserProfile(user.uid);

            // Обновляем состояние аутентификации
            dispatch({ type: 'LOGIN', payload: { ...user, ...userProfile } });

            // Обновляем состояние в UserContext через dispatch
            userDispatch({
                type: 'SET_USER',
                payload: { ...user, ...userProfile },
            });

            // Сохраняем токен в localStorage
            localStorage.setItem('authToken', user.uid);
            localStorage.setItem('authEmail', user.email);

            console.log(
                'Пользователь успешно вошёл в систему после регистрации'
            );
        } catch (error) {
            console.error('Ошибка регистрации и входа:', error.message);
        }
    };

    // Функция для входа
    const login = async (email, password, isRememberUser) => {
        try {
            const user = await userService.loginUser({ email, password });

            // Загружаем профиль пользователя и обновляем состояние
            const userProfile = await userService.getUserProfile(user.uid);

            // Обновление состояния аутентификации
            dispatch({ type: 'LOGIN', payload: { ...user, ...userProfile } });

            // Обновляем состояние в UserContext через dispatch
            userDispatch({
                type: 'SET_USER',
                payload: { ...user, ...userProfile },
            });

            setError(''); // Сбрасываем ошибку при успешной аутентификации

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
            console.error('Ошибка входа:', error.message);

            switch (error.code) {
                case 'auth/wrong-password':
                    setError('Неверный email или пароль');
                    break;
                case 'auth/user-not-found':
                    setError('Пользователь с таким email не найден');
                    break;
                case 'auth/invalid-email':
                    setError('Неверный email');
                    break;
                default:
                    setError('Ошибка входа.');
                    break;
            }
        }
    };

    // Функция для выхода
    const logout = async () => {
        try {
            await userService.logoutUser();

            // Обновление состояния аутентификации
            dispatch({ type: 'LOGOUT' });

            // Очищаем UserContext через dispatch
            userDispatch({ type: 'CLEAR_USER' });

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
                user: state.user, // Данные пользователя
                isAuthenticated: !!state.user, // true, если пользователь авторизован
                register, // Функция регистрации
                login, // Функция входа
                logout, // Функция выхода
                error, // Информация об ошибке при login
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
