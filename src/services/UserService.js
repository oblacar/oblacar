// src/services/UserService.js

import User from '../entities/User/User';
import { auth } from '../firebase'; // Импортируйте объект аутентификации
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth'; // Явный импорт методов аутентификации

class UserService {
    async registerUser(data) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );
            const user = userCredential.user;

            console.log('Пользователь зарегистрирован:', user);

            return new User(
                user.uid,
                data.firstName,
                data.lastName,
                data.email,
                data.password, // Не храните пароли в открытом виде
                data.role,
                new Date().toISOString(),
                data.profilePicture,
                data.additionalInfo
            );
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            throw error; // Перебрасываем ошибку для обработки в компоненте
        }
    }

    async loginUser(credentials) {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );

            return userCredential.user;
        } catch (error) {
            console.error('Ошибка входа:', error);
            throw error; // Перебрасываем ошибку для обработки в компоненте
        }
    }

    async logoutUser() {
        return auth.signOut().then(() => {
            console.log('Пользователь вышел из системы');
        });
    }

    async getUserProfile() {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        return user; // Возвращаем профиль пользователя
    }
}

// Именованный экспорт экземпляра UserService
export const userService = new UserService(); // Экспортируйте экземпляр
