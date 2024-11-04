import React, { createContext, useReducer, useEffect } from 'react';
import authReducer from './authReducer';
import { userService } from '../../services/UserService'; // Импорт UserService для взаимодействия с Firebase
// import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Импорт аутентификации Firebase

// import UserContext from '../UserContext'; //TODO закоментил при переходе на ЮзерКонтекст

// Создание контекста
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // const [state, dispatch] = useReducer(authReducer, { user: null });//TODO перевозим пользователя в ЮзерКонтекст
    const [state, dispatch] = useReducer(authReducer, {
        userId: null,
        isAuthenticated: false,
    });

    // const auth = getAuth();
    // const { dispatch: userDispatch } = useContext(UserContext); //TODO закоментил при переходе на ЮзерКонтекст
    // const [erMessage, setErMessage] = useState(''); // Состояние для ошибок

    // Эффект для проверки состояния пользователя при загрузке
    useEffect(() => {
        const token = localStorage.getItem('authToken');

        // Если токена нет, делаем принудительный выход
        if (!token) {
            // auth.signOut();
            userService.logoutUser();
            dispatch({ type: 'LOGOUT' });
            // userDispatch({ type: 'CLEAR_USER' });//TODO закоментил при переходе на ЮзерКонтекст
            return; // Останавливаем выполнение, если токен отсутствует
        }

        // Отслеживаем изменения аутентификации
        const unsubscribe = userService.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    //TODO вставили корткий вариант вместо закоменченого
                    dispatch({ type: 'LOGIN', payload: { userId: user.uid } });

                    console.log(
                        'Пользователь аутентифицирован, UID:',
                        user.uid
                    );

                    //TODO закоменчиваем блок для переноса логики в ЮрезКонтекст
                    // // Если пользователь авторизован, подтягиваем его профиль из базы данных
                    // const userProfile = await userService.getUserProfile(
                    //     user.uid
                    // );

                    // if (userProfile) {
                    //     console.log(
                    //         'Загружен профиль пользователя:',
                    //         userProfile
                    //     );

                    //     dispatch({
                    //         type: 'LOGIN',
                    //         payload: { ...user, ...userProfile },
                    //     });

                    //     // userDispatch({
                    //     //     type: 'SET_USER',
                    //     //     payload: { ...user, ...userProfile },
                    //     // });//TODO закоментил при переходе на ЮзерКонтекст
                    // } else {
                    //     console.error(
                    //         'Профиль пользователя не найден. Ожидаем его создание.'
                    //     );
                    //     // Здесь можно добавить логику ожидания, например, через setInterval, чтобы
                    //     // повторить попытку загрузки через несколько секунд.
                    // }
                } catch (error) {
                    console.error(
                        'Ошибка загрузки профиля пользователя:',
                        error.message
                    );
                }
            } else {
                dispatch({ type: 'LOGOUT' });

                // Очищаем состояние пользователя в UserContext
                // userDispatch({ type: 'CLEAR_USER' });//TODO закоментил при переходе на ЮзерКонтекст
            }
        });

        // Очистка подписки при размонтировании компонента
        return () => unsubscribe();
        // }, [userDispatch]);//TODO for relocating in UserContext
    }, []);

    // Функция для регистрации
    const register = async (data) => {
        try {
            // Регистрируем пользователя и получаем объект пользователя
            const user = await userService.registerUser(data);

            // Загружаем профиль пользователя из базы данных
            // const userProfile = await userService.getUserProfile(user.uid);//TODO переводим Юзера в ЮзерКонтекст

            // Обновляем состояние аутентификации
            // dispatch({ type: 'LOGIN', payload: { ...user, ...userProfile } });
            dispatch({ type: 'LOGIN', payload: { userId: user.uid } });

            // Обновляем состояние в UserContext через dispatch
            // userDispatch({
            //     type: 'SET_USER',
            //     payload: { ...user, ...userProfile },
            // });//TODO закоментил при переходе на ЮзерКонтекст

            // Сохраняем токен в localStorage
            localStorage.setItem('authToken', user.uid);
            localStorage.setItem('authEmail', user.email);

            console.log(
                'Пользователь успешно вошёл в систему после регистрации'
            );

            return user; //TODO пока нигде не используется вроде бы. Нужно проверять.
        } catch (error) {
            // console.error('Ошибка регистрации и входа:', error.message);

            // setErMessage(error.message); // Устанавливаем сообщение об ошибке

            // Выбросываем ошибку
            throw new Error(error.message); // Пробрасываем ошибку дальше
        }
    };

    // Функция для входа
    const login = async (email, password, isRememberUser) => {
        try {
            const user = await userService.loginUser({ email, password });

            // Загружаем профиль пользователя и обновляем состояние
            // const userProfile = await userService.getUserProfile(user.uid);//TODO переводим Юзера в ЮзерКонтекст

            // Обновление состояния аутентификации
            // dispatch({ type: 'LOGIN', payload: { ...user, ...userProfile } });//TODO переводим Юзера в ЮзерКонтекст
            dispatch({ type: 'LOGIN', payload: { userId: user.uid } });

            // Обновляем состояние в UserContext через dispatch
            // userDispatch({
            //     type: 'SET_USER',
            //     payload: { ...user, ...userProfile },
            // });//TODO закоментил при переходе на ЮзерКонтекст

            // setErMessage(''); // Сбрасываем ошибку при успешной аутентификации

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

            // Очищаем UserContext через dispatch
            // userDispatch({ type: 'CLEAR_USER' });//TODO закоментил при переходе на ЮзерКонтекст

            // Очищаем localStorage при выходе
            localStorage.removeItem('authToken');
            localStorage.removeItem('authEmail');
        } catch (error) {
            console.error('Ошибка выхода:', error.message);
        }
    };

    // Передаем функцию обновления пользователя, которая вызовет dispatch в authReducer
    const updateAuthUser = (updatedUser) => {
        dispatch({ type: 'SET_USER', payload: updatedUser });
    };

    // Возвращаем контекст с необходимыми параметрами
    return (
        <AuthContext.Provider
            value={{
                // user: state.user, // Данные пользователя
                // isAuthenticated: !!state.user, // true, если пользователь авторизован
                // register, // Функция регистрации
                // login, // Функция входа
                // logout, // Функция выхода
                // // erMessage, // Информация об ошибке при login
                // // resetError, // Обнуляем ошибку
                // updateAuthUser, // метод для обновления user из UserContext

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
