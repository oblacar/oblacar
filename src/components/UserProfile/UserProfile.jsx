// src/components/UserProfile/UserProfile.js

import React, { useState, useContext } from 'react';
import UserContext from '../../hooks/UserContext';
import './UserProfile.css'; // Импортируйте стили

const UserProfile = () => {
    const { state, dispatch } = useContext(UserContext); // Получаем данные пользователя из контекста
    const { user } = state; // Извлекаем пользователя из состояния

    // Инициализируем состояния для редактирования
    const [isEditing, setIsEditing] = useState(false); // Состояние для редактирования
    const [firstName, setFirstName] = useState(user.firstName); // Состояние для имени
    const [lastName, setLastName] = useState(user.lastName); // Состояние для фамилии
    const [email, setEmail] = useState(user.email); // Состояние для email
    const [role, setRole] = useState(user.role); // Состояние для роли
    const [registrationDate, setRegistrationDate] = useState(
        user.registrationDate
    ); // Состояние для даты регистрации
    const [profilePicture, setProfilePicture] = useState(user.profilePicture); // Состояние для фото профиля
    const [additionalInfo, setAdditionalInfo] = useState(user.additionalInfo); // Состояние для дополнительных данных

    const handleEditToggle = () => {
        setIsEditing(!isEditing); // Переключаем режим редактирования
    };

    const handleSave = () => {
        const updatedUser = {
            ...user,
            firstName,
            lastName,
            email,
            role,
            registrationDate,
            profilePicture,
            additionalInfo,
        };

        dispatch({ type: 'SET_USER', payload: updatedUser }); // Сохраняем обновленного пользователя в контекст
        console.log('Сохраненные данные:', updatedUser);
        setIsEditing(false); // Переключаем обратно на режим просмотра
    };

    return (
        <div className='user-profile'>
            <h1>Профиль пользователя</h1>
            {isEditing ? (
                <div>
                    <div>
                        <label htmlFor='firstName'>Имя</label>
                        <input
                            id='firstName'
                            type='text'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)} // Обновляем состояние имени
                        />
                    </div>
                    <div>
                        <label htmlFor='lastName'>Фамилия</label>
                        <input
                            id='lastName'
                            type='text'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)} // Обновляем состояние фамилии
                        />
                    </div>
                    <div>
                        <label htmlFor='email'>Электронная почта</label>
                        <input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Обновляем состояние email
                        />
                    </div>
                    <div>
                        <label htmlFor='role'>Роль</label>
                        <input
                            id='role'
                            type='text'
                            value={role}
                            onChange={(e) => setRole(e.target.value)} // Обновляем состояние роли
                        />
                    </div>
                    <div>
                        <label htmlFor='registrationDate'>
                            Дата регистрации
                        </label>
                        <input
                            id='registrationDate'
                            type='date'
                            value={registrationDate}
                            onChange={(e) =>
                                setRegistrationDate(e.target.value)
                            } // Обновляем состояние даты регистрации
                        />
                    </div>
                    <div>
                        <label htmlFor='profilePicture'>
                            Фото профиля (URL)
                        </label>
                        <input
                            id='profilePicture'
                            type='text'
                            value={profilePicture}
                            onChange={(e) => setProfilePicture(e.target.value)} // Обновляем состояние URL фото профиля
                        />
                    </div>
                    <div>
                        <label htmlFor='additionalInfo'>
                            Дополнительная информация
                        </label>
                        <textarea
                            id='additionalInfo'
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)} // Обновляем состояние дополнительных данных
                        />
                    </div>
                    <button onClick={handleSave}>Сохранить</button>
                    <button onClick={handleEditToggle}>Отмена</button>
                </div>
            ) : (
                <div>
                    <p>Имя: {user.firstName}</p>
                    <p>Фамилия: {user.lastName}</p>
                    <p>Электронная почта: {user.email}</p>
                    <p>Роль: {user.role}</p>
                    <p>Дата регистрации: {user.registrationDate}</p>
                    <p>
                        Фото профиля:{' '}
                        <img
                            src={user.profilePicture}
                            alt='Профиль'
                        />
                    </p>
                    <p>Дополнительная информация: {user.additionalInfo}</p>
                    <button onClick={handleEditToggle}>
                        Редактировать профиль
                    </button>
                </div>
            )}
            {/* <button onClick={logout}>Выйти</button> Кнопка выхода */}
        </div>
    );
};

export default UserProfile;
