// src/components/UserProfile/UserProfile.js

import React, { useState, useContext } from 'react';
import UserContext from '../../hooks/UserContext';
import './UserProfile.css'; // Импортируйте стили
import Button from '../common/Button/Button';

import UserProfile2 from './UserProfile2/UserProfile2';

const UserProfile = () => {
    const { state, dispatch } = useContext(UserContext); // Получаем данные пользователя из контекста
    const { user } = state; // Извлекаем пользователя из состояния

    // Инициализируем состояния для редактирования
    const [isEditing, setIsEditing] = useState(false); // Состояние для редактирования

    // const [firstName, setFirstName] = useState(user.firstName); // Состояние для имени
    // const [lastName, setLastName] = useState(user.lastName); // Состояние для фамилии
    // const [email, setEmail] = useState(user.email); // Состояние для email
    // const [role, setRole] = useState(user.role); // Состояние для роли
    // const [registrationDate, setRegistrationDate] = useState(
    //     user.registrationDate
    // ); // Состояние для даты регистрации
    // const [profilePicture, setProfilePicture] = useState(user.profilePicture); // Состояние для фото профиля
    // const [additionalInfo, setAdditionalInfo] = useState(user.additionalInfo); // Состояние для дополнительных данных

    // Состояния данных пользователя
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

            // firstName,
            // lastName,
            // email,
            // role,
            // registrationDate,
            // profilePicture,
            // additionalInfo,
        };

        dispatch({ type: 'SET_USER', payload: updatedUser }); // Сохраняем обновленного пользователя в контекст
        console.log('Сохраненные данные:', updatedUser);
        setIsEditing(false); // Переключаем обратно на режим просмотра
    };

    return (
        <>
            <UserProfile2 />

            <div className='user-profile'>
                <h1>Профиль пользователя</h1>
                {isEditing ? (
                    <div>
                        <div>
                            <label htmlFor='profilePicture'>
                                Фото профиля (URL)
                            </label>
                            <input
                                id='userPhoto'
                                type='text'
                                value={userPhoto}
                                onChange={(e) => setUserPhoto(e.target.value)} // Обновляем состояние URL фото профиля
                            />
                        </div>
                        <div>
                            <label htmlFor='userName'>Имя</label>
                            <input
                                id='userName'
                                type='text'
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)} // Обновляем состояние имени
                            />
                        </div>
                        <div>
                            <label htmlFor='userEmail'>Электронная почта</label>
                            <input
                                id='userEmail'
                                type='email'
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)} // Обновляем состояние email
                            />
                        </div>
                        <div>
                            <label htmlFor='userPhone'>Электронная почта</label>
                            <input
                                id='userPhone'
                                type='text'
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)} // Обновляем состояние email
                            />
                        </div>
                        <div>
                            <label htmlFor='userAbout'>
                                Дополнительная информация
                            </label>
                            <textarea
                                id='userAbout'
                                value={userAbout}
                                onChange={(e) => setUserAbout(e.target.value)} // Обновляем состояние дополнительных данных
                            />
                        </div>
                        <button
                            className='button-user-profile'
                            onClick={handleSave}
                        >
                            Сохранить
                        </button>
                        <button
                            className='button-user-profile'
                            onClick={handleEditToggle}
                        >
                            Отмена
                        </button>
                    </div>
                ) : (
                    <div>
                        <p>
                            <img
                                src={user.userPhoto}
                                alt='Профиль'
                                className='profile-photo'
                            />
                        </p>
                        <p>
                            Имя:{' '}
                            <span className='user-option'>
                                {' '}
                                {user.userName}
                            </span>{' '}
                        </p>

                        <p>
                            Электронная почта:{' '}
                            <span className='user-option'>
                                {user.userEmail}
                            </span>
                        </p>
                        <p>
                            Телефон:{' '}
                            <span className='user-option'>
                                {user.userPhone}
                            </span>
                        </p>

                        <p>
                            Дополнительная информация:{' '}
                            <span className='user-option'>
                                {user.userAbout}
                            </span>
                        </p>
                        <Button
                            type='button'
                            size_width='large'
                            size_height='medium'
                            children='Редактировать профиль'
                            onClick={handleEditToggle}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default UserProfile;
