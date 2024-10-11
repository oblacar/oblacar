import User from '../entities/User/User';
import { auth, db, storage } from '../firebase'; // Импорт аутентификации, базы данных и хранилища
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { ref as databaseRef, set, get, update } from 'firebase/database';
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';

class UserService {
    // Регистрация пользователя с созданием профиля в базе данных
    async registerUser(data) {
        try {
            // Создаем нового пользователя через аутентификацию Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );
            const user = userCredential.user;

            console.log('Пользователь зарегистрирован:', user);

            // Загружаем фото профиля, если оно есть
            let profilePictureURL = '';
            if (data.profilePicture) {
                profilePictureURL = await this.uploadProfilePicture(
                    user.uid,
                    data.profilePicture
                );
            }

            // Создаем профиль пользователя в Realtime Database
            const userData = {
                userId: user.uid,
                userPhoto: profilePictureURL,
                userName: `${data.firstName}`,
                userEmail: data.email,
                userPhone: data.phone || '',
                userAbout: data.additionalInfo || '',
                registrationDate: new Date().toISOString(),
                firebaseToken: user.stsTokenManager.accessToken,
            };

            console.log('Данные для записи в базу данных:', userData);

            // Сохраняем профиль пользователя в базе данных
            await set(databaseRef(db, 'users/' + user.uid), userData);

            console.log('Данные успешно сохранены в Realtime Database');

            // Возвращаем созданного пользователя
            return new User(
                user.uid,
                profilePictureURL,
                `${data.firstName} ${data.lastName}`,
                data.email,
                data.phone || '',
                data.additionalInfo || '',
                data.password, // Пароль лучше хранить зашифрованным
                new Date().toISOString(),
                user.stsTokenManager.accessToken
            );
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            throw error;
        }
    }

    // Вход пользователя
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
            throw error;
        }
    }

    // Выход пользователя
    async logoutUser() {
        try {
            await auth.signOut();
            console.log('Пользователь вышел из системы');
        } catch (error) {
            console.error('Ошибка выхода:', error);
            throw error;
        }
    }

    // Получение профиля пользователя из базы данных
    async getUserProfile(userId = auth.currentUser?.uid) {
        if (!userId) {
            throw new Error('Пользователь не найден');
        }

        try {
            console.log('Получаем данные пользователя с userId:', userId);

            const snapshot = await get(databaseRef(db, 'users/' + userId));
            if (snapshot.exists()) {
                console.log('Профиль найден:', snapshot.val());
                return snapshot.val(); // Возвращаем данные профиля
            } else {
                throw new Error('Профиль пользователя не найден');
            }
        } catch (error) {
            console.error('Ошибка получения профиля пользователя:', error);
            throw error;
        }
    }

    // Обновление профиля пользователя
    // async updateUserProfile(updatedData) {
    //     const user = auth.currentUser;
    //     if (!user) {
    //         throw new Error('Пользователь не найден');
    //     }

    //     let photoURL = updatedData.userPhoto;

    //     // Если есть новое фото, загружаем его
    //     if (updatedData.profilePicture) {
    //         photoURL = await this.uploadProfilePicture(
    //             user.uid,
    //             updatedData.profilePicture
    //         );
    //     }

    async updateUserProfile(userId, updatedData) {
        const userRef = databaseRef(db, 'users/' + userId); // Ссылка на пользователя в базе
        try {
            await update(userRef, updatedData); // Обновляем только измененные данные
            console.log('Профиль пользователя успешно обновлен');
        } catch (error) {
            console.error(
                'Ошибка обновления профиля пользователя:',
                error.message
            );
        }
    }

    // Метод для загрузки фото в Firebase Storage и получения URL
    async uploadUserPhoto(userId, file) {
        try {
            const storageReference = storageRef(
                storage,
                `profilePhotos/${userId}`
            );
            await uploadBytes(storageReference, file); // Загрузка файла
            const downloadURL = await getDownloadURL(storageReference); // Получение URL загруженного файла
            return downloadURL; // Возвращаем URL фото
        } catch (error) {
            console.error('Ошибка загрузки фото:', error.message);
            throw error; // Пробрасываем ошибку для обработки в компоненте
        }
    }

    //     // Обновляем данные пользователя в Realtime Database
    //     await update(databaseRef(db, 'users/' + user.uid), {
    //         userPhoto: photoURL,
    //         userName: updatedData.userName,
    //         userPhone: updatedData.userPhone,
    //         userAbout: updatedData.userAbout,
    //     });

    //     console.log('Профиль пользователя обновлен');
    // }

    // Загрузка фотографии профиля пользователя в Firebase Storage
    async uploadProfilePicture(userId, file) {
        const storageReference = storageRef(storage, 'profilePhotos/' + userId);
        try {
            // Загружаем файл в Firebase Storage
            const snapshot = await uploadBytes(storageReference, file);
            // Получаем URL загруженного файла
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Ошибка загрузки фотографии:', error);
            throw error;
        }
    }
}

// Экспортируем экземпляр UserService
export const userService = new UserService();
