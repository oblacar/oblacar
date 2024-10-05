// src/components/Layout.js

import React from 'react';
import { Outlet } from 'react-router-dom'; // Используем Outlet для рендеринга вложенных маршрутов
import Header from './Header/Header';
import Footer from './Footer/Footer';
import styles from '../styles/Layout.module.css';

const Layout = () => {
    return (
        <div className={styles.layout}>
            <Header />
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    {' '}
                    {/* Боковая панель слева */}
                    <h3>Фильтры</h3>
                    <p>Форма для фильтров поиска</p>
                </div>
                <div className={styles.content}>
                    <Outlet />{' '}
                    {/* Здесь будут рендериться дочерние компоненты */}
                </div>
                <div className={styles.sidebar}>
                    {' '}
                    {/* Боковая панель справа */}
                    <h3>Дополнительные параметры</h3>
                    <p>Дополнительная информация или формы</p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
