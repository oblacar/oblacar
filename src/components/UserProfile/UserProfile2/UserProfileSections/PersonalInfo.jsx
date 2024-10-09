// src/components/UserProfile/PersonalInfo.js

import React, { useState, useContext } from 'react';
import './UserProfileSections.css'; // Импортируйте стили
import Button from '../../../common/Button/Button';

import UserContext from '../../../../hooks/UserContext';

const PersonalInfo = () => {
    const { state, dispatch } = useContext(UserContext); // Получаем данные пользователя из контекста
    const { user } = state; // Извлекаем пользователя из состояния

    // Инициализируем состояния для редактирования
    const [isEditing, setIsEditing] = useState(false); // Состояние для редактирования

    const [userPhoto, setUserPhoto] = useState(user.userPhoto);
    const [userName, setUserName] = useState(user.userName);
    const [userEmail, setUserEmail] = useState(user.userEmail);
    const [userPhone, setUserPhone] = useState(user.userPhone);
    const [userAbout, setUserAbout] = useState(user.userAbout);
    const [userPassword, setUserPassword] = useState(user.userPassword);

    const handleEditToggle = () => {
        setIsEditing(!isEditing); // Переключаем режим редактирования
    };

    const handleSave = () => {
        const updatedUser = {
            ...user,

            userPhoto,
            userName,
            userEmail,
            userPhone,
            userAbout,
            userPassword,
        };

        dispatch({ type: 'UPDATE_USER', payload: updatedUser }); // Сохраняем обновленного пользователя в контекст
        console.log('Сохраненные данные:', updatedUser);
        setIsEditing(false); // Переключаем обратно на режим просмотра
        console.log(isEditing);
    };

    const handleDontSave = () => {
        setUserPhoto(user.userPhoto);
        setUserName(user.userName);
        setUserEmail(user.userEmail);
        setUserPhone(user.userPhone);
        setUserAbout(user.userAbout);

        setIsEditing(false); // Переключаем обратно на режим просмотра
    };

    return (
        <div className='personal-info-container'>
            <h2>Личные данные</h2>
            <img
                className='personal-info-user-photo'
                src='https://via.placeholder.com/200'
                alt='Профиль'
            />
            {!isEditing ? (
                <div>
                    <p className='personal-info-user-name'>{user.userName}</p>
                    <div className='personal-info-user-email'>
                        {user.userEmail}
                    </div>
                    <div className='personal-info-user-phone'>
                        {user.userPhone}
                    </div>
                    <p className='personal-info-user-info'>{user.userAbout}</p>
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
                                Имя пользователя (отображается окружающим)
                            </label>
                            <input
                                id='userName'
                                type='text'
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)} // Обновляем состояние userName
                            />
                        </div>
                    </div>
                    <div>
                        <div>
                            <label
                                className='personal-info-user-item-title'
                                htmlFor='userEmail'
                            >
                                Электронная почта - это <span> Ваш логин </span>
                                при входе
                            </label>
                            <input
                                disabled
                                id='userEmail'
                                type='text'
                                value={userEmail}
                                // onChange={(e) => setUserEmail(e.target.value)} // Обновляем состояние userEmail
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
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)} // Обновляем состояние userEmail
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
                            value={userAbout}
                            onChange={(e) => setUserAbout(e.target.value)} // Обновляем состояние дополнительных данных
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
                <p className='personal-info-user-password'>Пароль: ********</p>
                <Button
                    type='button'
                    size_height='medium'
                    children='Изменить пароль'
                />
            </div>
        </div>
    );
};

export default PersonalInfo;
