// src/pages/Home/Home.js
import React from 'react';
import styles from './Home.module.css'; // Подключаем стили

import { addTransportAds } from '../../scripts/addTransportAds';
import TransportAdService from '../../services/TransportAdService';

function Home() {
    const testGetAdById = async () => {
        const adId = '-O9AMqcRKUPOrDzh-5l8'; // Замените на фактический ID объявления для тестирования
        try {
            const ad = await TransportAdService.getAdById(adId);
            console.log('Полученное объявление:', ad);
        } catch (error) {
            console.error('Ошибка при получении объявления:', error);
        }
    };

    const testGetAllAds = async () => {
        try {
            const ads = await TransportAdService.getAllAds(); // Получаем все объявления
            console.log('Полученные объявления:', ads);
        } catch (error) {
            console.error('Ошибка при получении объявлений:', error);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <h2>Welcome to Oblacar</h2>
                <p>
                    Your reliable platform for finding transportation services.
                    {/* <button onClick={addTransportAds}>
                        Загрузить базу из скрипта
                    </button>
                    <button onClick={testGetAdById}>
                        выгружаем один объект
                    </button>
                    <button onClick={testGetAllAds}>
                        выгружаем все объекты
                    </button> */}
                </p>
            </div>
        </>
    );
}

export default Home;
