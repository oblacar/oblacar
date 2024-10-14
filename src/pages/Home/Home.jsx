// src/pages/Home/Home.js
import React from 'react';
import styles from './Home.module.css'; // Подключаем стили

import { addTransportAds } from '../../scripts/addTransportAds';

function Home() {
    return (
        <>
            <div className={styles.container}>
                <h2>Welcome to Oblacar</h2>
                <p>
                    Your reliable platform for finding transportation services.
                    <button onClick={addTransportAds}>
                        Загрузить базу из скрипта
                    </button>
                </p>
            </div>
        </>
    );
}

export default Home;
