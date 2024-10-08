// src/components/UserProfile/PersonalInfo.js

import React from 'react';
import './UserProfileSections.css'; // Импортируйте стили
import Button from '../../../common/Button/Button';

const PersonalInfo = () => {
    return (
        <div className='personal-info-container'>
            <h2>Личные данные</h2>
            <img
                className='personal-info-user-photo'
                src='https://via.placeholder.com/200'
                alt='Профиль'
            />
            <p className='personal-info-user-name'>Иван</p>
            <div className='personal-info-user-email'>ivan123@gmail.com</div>
            <div className='personal-info-user-phone'>+1234567890</div>
            <p className='personal-info-user-info'>
                Перевожу грузы. Своя машина.Перевожу грузы. Своя машина.Перевожу
                грузы. Своя машина.Перевожу грузы. Своя машина.
            </p>
            {/* <div className='seporator-line'></div> */}
            <Button
                type='button'
                size_width='wide'
                size_height='medium'
                children='Редактировать профиль'
            />
            <p className='personal-info-user-password'>Пароль: ********</p>
            <Button
                type='button'
                size_width='middle'
                size_height='low'
                children='Изменить пароль'
            />
        </div>
    );
};

export default PersonalInfo;
