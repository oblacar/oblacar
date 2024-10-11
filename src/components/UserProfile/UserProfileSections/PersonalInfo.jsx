// src/components/UserProfile/PersonalInfo.js

import React, { useState, useContext, useEffect } from 'react';
import './UserProfileSections.css'; // Импортируйте стили
import Button from '../../common/Button/Button';

import UserContext from '../../../hooks/UserContext';

import { userService } from '../../../services/UserService';

const PersonalInfo = () => {
    const { state, dispatch } = useContext(UserContext); // Получаем данные пользователя из контекста
    const { user } = state; // Извлекаем пользователя из состояния

    // Инициализируем состояние для пользователя
    const [userData, setUserData] = useState(user || {}); // Используем одно состояние для всех данных пользователя

    // Инициализируем состояния для редактирования
    const [isEditing, setIsEditing] = useState(false); // Состояние для редактирования
    // https://i.postimg.cc/HndzPNv7/fotor-ai-20241008122453.jpg

    const handleEditToggle = () => {
        setIsEditing(!isEditing); // Переключаем режим редактирования
    };

    const handleSave = async () => {
        const updatedUser = {
            userPhoto: userData.userPhoto || '',
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

        // dispatch({ type: 'UPDATE_USER', payload: userData }); // Сохраняем обновленного пользователя в контекст

        // setIsEditing(false); // Переключаем обратно на режим просмотра
    };

    const handleDontSave = () => {
        // Возвращаем данные пользователя в исходное состояние
        setUserData(user);
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

    return (
        <>
            {!user ? (
                <div>Пользователь не аутентифицирован</div>
            ) : (
                <div className='personal-info-container'>
                    <h2>Личные данные</h2>
                    <img
                        className='personal-info-user-photo'
                        src='https://via.placeholder.com/200'
                        alt='Профиль'
                    />
                    {!isEditing ? (
                        <div>
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
                            {/* <div className='seporator-line'></div> */}
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
                    <div>
                        <p className='personal-info-user-password'>
                            Пароль: ********
                        </p>
                        <Button
                            type='button'
                            size_height='medium'
                            children='Изменить пароль'
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PersonalInfo;