// src/pages/Home/Home.js
import React from 'react';
import styles from './Home.module.css'; // Подключаем стили

import { addTransportAds } from '../../scripts/addTransportAds';

import SearchTransport from '../../components/SearchTransport/SearchTransport';
import TransportAdsList from '../../components/TransportAds/TransportAdsList';

import SingleRatingStar from '../../components/common/SingleRatingStar/SingleRatingStar';

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
                <div>
                    <SingleRatingStar rating={3} />
                </div>
                <SearchTransport />
                <p>
                    1. добавить раздел: фото водителя и рейтинг, проверенный ли
                    водитель, проверенная ли машшина. 2. возле цены можно
                    заместить важную инфомрацию по оплате, кроме цены
                </p>
                <TransportAdsList />
            </div>
        </>
    );
}

export default Home;
