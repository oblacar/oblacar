// src/components/ButtonMenuList/ButtonMenuList.js

import React from 'react';
import ProfileMenuList from './MenuLists/ProfileMenuList';
import TruckMenuList from './MenuLists/TruckMenuList';
import styles from './ButtonMenuList.module.css';

const ButtonMenuList = () => {
    return (
        <div className={styles.buttonMenuList}>
            <ProfileMenuList />
            <TruckMenuList />
            {/* Здесь можно добавить другие меню */}
        </div>
    );
};

export default ButtonMenuList;
