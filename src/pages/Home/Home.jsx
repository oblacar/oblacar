// src/pages/Home/Home.js
import React from 'react';
import styles from './Home.module.css'; // Подключаем стили

import { addTransportAds } from '../../scripts/addTransportAds';

import TransportAdsList from '../../components/TransportAds/TransportAdsList';

function Home() {
    return (
        <>
            <div className={styles.container}>
                {/* <h2>Welcome to Oblacar</h2> */}
                <p>
                    {/* Your reliable platform for finding transportation services. */}
                    {/* <button onClick={addTransportAds}>
                        загрузить тестовую базу
                    </button> */}
                </p>
                <TransportAdsList />
            </div>
        </>
    );
}

export default Home;
