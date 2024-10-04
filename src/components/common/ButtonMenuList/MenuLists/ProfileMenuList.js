// src/components/ButtonMenuList/MenuLists/ProfileMenuList.js

import React from 'react';
import IconText from './IconText.js'; // Импортируем компонент иконка+текст
import styles from './MenuLists.module.css';

const ProfileMenuList = () => {
    return (
        <div className={styles.profileMenuList}>
            <IconText
                icon='FaUser'
                label='Профиль'
            />
            <IconText
                icon='FaSignInAlt'
                label='Войти'
            />
            <IconText
                icon='FaUserPlus'
                label='Зарегистрироваться'
            />
        </div>
    );
};

export default ProfileMenuList;
