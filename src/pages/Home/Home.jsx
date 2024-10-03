// src/pages/Home/Home.js
import React from 'react';
import styles from './Home.module.css'; // Подключаем стили

function Home() {
    return (
        <div className={styles.container}>
            <h2>Welcome to Oblacar</h2>
            <p>Your reliable platform for finding transportation services.</p>
        </div>
    );
}

export default Home;
