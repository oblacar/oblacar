// src/components/ButtonMenuList/MenuLists/TruckMenuList.js

import React from 'react';
import IconText from './IconText.js'; // Импортируем компонент иконка+текст
import styles from './MenuLists.module.css';

const TruckMenuList = () => {
    return (
        <div className={styles.truckMenuList}>
            <IconText
                icon='FaTruck'
                label='Мои Грузы'
            />
            <IconText
                icon='FaPlus'
                label='Добавить Груз'
            />
        </div>
    );
};

export default TruckMenuList;
