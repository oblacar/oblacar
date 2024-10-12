// src/components/UserProfile/PersonalInfo.js

import React, { useState, useContext, useEffect, useRef } from 'react';
import './UserProfileSections.css'; // Импортируйте стили
import Button from '../../common/Button/Button';
import UpdatePassword from '../UpdatePassword/UpdatePassword';

import UserContext from '../../../hooks/UserContext';

import { userService } from '../../../services/UserService';

const PersonalInfo = () => {
    const { state, dispatch } = useContext(UserContext); // Получаем данные пользователя из контекста
    const { user } = state; // Извлекаем пользователя из состояния

    const [userData, setUserData] = useState(user || {}); // Используем одно состояние для всех данных пользователя

    const [isEditing, setIsEditing] = useState(false); // Состояние для редактирования
    const [isPasswordEditing, setPasswordEditing] = useState(false); // Состояние для редактирования password

    const [selectedPhoto, setSelectedPhoto] = useState(null); // Для хранения выбранного фото
    const [previewPhoto, setPreviewPhoto] = useState(null); // Для хранения превью

    const fileInputRef = useRef(null); // Создаём реф для input - используем в для загрузки фото

    const handleEditToggle = () => {
        setIsEditing(!isEditing); // Переключаем режим редактирования

        if (!isEditing) {
            setPreviewPhoto(userData.userPhoto); // При входе в режим редактирования показываем старую фото
            setSelectedPhoto(null); // Очищаем выбранное фото
        }
    };

    const handleSave = async () => {
        let downloadURL = userData.userPhoto; // По умолчанию используем старую ссылку

        // Если выбрано новое фото, загружаем его в Firebase
        if (selectedPhoto) {
            try {
                downloadURL = await userService.uploadUserPhoto(
                    user.userId,
                    selectedPhoto
                ); // Загружаем оригинальный файл
            } catch (error) {
                console.error('Ошибка загрузки фото:', error.message);
                return; // Прерываем сохранение, если произошла ошибка при загрузке фото
            }
        }

        console.log(downloadURL);

        const updatedUser = {
            userPhoto: downloadURL || '',
            userName: userData.userName || '',
            // userEmail: userData.userEmail,
            userPhone: userData.userPhone || '',
            userAbout: userData.userAbout || '',
            // Добавь сюда только те поля, которые должны быть сохранены
        };

        console.log('Обновляемый профиль:', updatedUser);

        // Сохраняем обновленные данные в контексте
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });

        // Сохраняем обновленные данные в Firebase
        try {
            await userService.updateUserProfile(user.userId, updatedUser); // Обновляем данные в Firebase
            console.log('Данные профиля успешно обновлены в Firebase');
        } catch (error) {
            console.error(
                'Ошибка обновления данных в Firebase:',
                error.message
            );
        }

        setIsEditing(false); // Выходим из режима редактирования
    };

    const handleDontSave = () => {
        // Возвращаем данные пользователя в исходное состояние
        setUserData(user);

        setPreviewPhoto(user.userPhoto); // Сбрасываем превью на старую фото
        setSelectedPhoto(null); // Сбрасываем выбранное фото

        setIsEditing(false); // Выходим из режима редактирования
    };

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    const handleInputChange = (field) => (e) => {
        setUserData({
            ...userData,
            [field]: e.target.value,
        });
    };

    //метод загрузки фото в превью
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];

        console.log('Выбранный файл:', file); // Проверка файла

        if (file) {
            const previewUrl = URL.createObjectURL(file); // Создаём временный URL
            setSelectedPhoto(file); // / Сохраняем оригинальный файл для дальнейшей загрузки в Firebase
            setPreviewPhoto(previewUrl); // Обновляем превью
        }
    };

    // Открытие диалога для выбора файла при клике на изображение
    const handlePhotoClick = () => {
        fileInputRef.current.click(); // Программно вызываем input для выбора файла
    };

    return (
        <>
            {!user ? (
                <div>Пользователь не аутентифицирован</div>
            ) : (
                <div className='personal-info-container'>
                    <h2>Личные данные</h2>
                    {!isEditing ? (
                        <div>
                            <img
                                className='personal-info-user-photo'
                                src={
                                    userData.userPhoto ||
                                    'https://via.placeholder.com/200'
                                }
                                alt='Фото пользователя'
                            />
                            <p className='personal-info-user-name'>
                                {userData.userName}
                            </p>
                            <div className='personal-info-user-email'>
                                {userData.userEmail}
                            </div>
                            <div className='personal-info-user-phone'>
                                {userData.userPhone}
                            </div>
                            <p className='personal-info-user-info'>
                                {userData.userAbout}
                            </p>

                            <Button
                                type='button'
                                size_height='medium'
                                children='Редактировать профиль'
                                onClick={handleEditToggle}
                            />
                        </div>
                    ) : (
                        <div>
                            <div>
                                <img
                                    className='personal-info-user-photo'
                                    src={
                                        previewPhoto ||
                                        userData.userPhoto ||
                                        'https://via.placeholder.com/200'
                                    }
                                    alt='Профиль пользователя'
                                    onClick={handlePhotoClick} // Открываем выбор файла при клике
                                    style={{ cursor: 'pointer' }} // Курсор указателя для индикации клика
                                />
                                {/* Скрытый input для загрузки фото */}
                                <input
                                    type='file'
                                    ref={fileInputRef} // Привязываем реф
                                    style={{ display: 'none' }} // Скрываем input
                                    accept='image/*'
                                    onChange={handlePhotoUpload} // Обработчик загрузки файла
                                />
                            </div>
                            <div>
                                <div>
                                    <label
                                        className='personal-info-user-item-title'
                                        htmlFor='userName'
                                    >
                                        Имя пользователя (отображается
                                        окружающим)
                                    </label>
                                    <input
                                        id='userName'
                                        type='text'
                                        value={userData.userName || ''}
                                        onChange={handleInputChange('userName')} // Обновляем состояние userName
                                    />
                                </div>
                            </div>
                            <div>
                                <div>
                                    <label
                                        className='personal-info-user-item-title'
                                        htmlFor='userEmail'
                                    >
                                        Электронная почта - это{' '}
                                        <span> Ваш логин </span>
                                        при входе
                                    </label>
                                    <input
                                        disabled
                                        id='userEmail'
                                        type='text'
                                        value={userData.userEmail || ''}
                                        // onChange={(e) => setUserEmail(e.target.value)} // Обновляем состояние userEmail. Пока комментим,
                                        // что бы пользователь не мог вносить изменения, т.к. это его логин.
                                        // Для смены почты нужно будет продумывать логику подтверждения через дополнительные верификации.
                                    />
                                </div>
                            </div>
                            <div>
                                <div>
                                    <label
                                        className='personal-info-user-item-title'
                                        htmlFor='userPhone'
                                    >
                                        Телефон
                                    </label>
                                    <input
                                        id='userPhone'
                                        type='text'
                                        value={userData.userPhone || ''}
                                        onChange={handleInputChange(
                                            'userPhone'
                                        )} // Обновляем состояние userPhone
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    className='personal-info-user-item-title'
                                    htmlFor='userAbout'
                                >
                                    О себе
                                </label>
                                <textarea
                                    className='user-about'
                                    maxLength='200'
                                    placeholder='Введите до 200 символов'
                                    id='userAbout'
                                    value={userData.userAbout || ''}
                                    onChange={handleInputChange('userAbout')} // Обновляем состояние дополнительных данных
                                />
                            </div>

                            <div className='button-container'>
                                <Button
                                    className='button-save-personal-data-correction'
                                    type='button'
                                    type_btn='yes'
                                    size_height='medium'
                                    children='Сохранить'
                                    onClick={handleSave}
                                />

                                <Button
                                    className='button-dont-save-personal-data-correction'
                                    type='button'
                                    type_btn='no'
                                    size_height='medium'
                                    children='Не сохранять'
                                    onClick={handleDontSave}
                                />
                            </div>
                        </div>
                    )}

                    {!isPasswordEditing ? (
                        <div>
                            <p className='personal-info-user-password'>
                                Пароль: ********
                            </p>
                            <Button
                                type='button'
                                size_height='medium'
                                children='Изменить пароль'
                                onClick={() => setPasswordEditing(true)}
                            />
                        </div>
                    ) : (
                        <UpdatePassword
                            onCancel={() => setPasswordEditing(false)}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default PersonalInfo;
