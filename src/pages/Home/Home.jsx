// src/pages/Home/Home.js
import React, { useContext, useState } from 'react';
import styles from './Home.module.css'; // Подключаем стили

import TransportAdContext from '../../hooks/TransportAdContext';

import TransportAdService from '../../services/TransportAdService';
import { db, storage } from '../../firebase'; // Измените импорт
import { ref, set, push, update } from 'firebase/database'; // Импортируйте необходимые функции
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage'; // Импортируйте необходимые функции

import { addTransportAds } from '../../scripts/addTransportAds';

import CreateTransportAd from '../../components/CreateTransportAd/CreateTransportAd';

import SearchTransport from '../../components/SearchTransport/SearchTransport';
import TransportAdsList from '../../components/TransportAds/TransportAdsList';

import {
    TruckIcon,
    CubeIcon,
    XMarkIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

import AdProfile from '../../components/AdProfile/AdProfile';
import MultiPhotoUploader from '../../components/MultiPhotoUploader/MultiPhotoUploader';

import ChatInterface from '../../components/ChatInterface/ChatInterface';

import TransportationTest from './TransportationTest';
import './testcss.css';
import { FaTruck, FaBox } from 'react-icons/fa';
import ToggleSearchMode from '../../components/common/ToggleSearchMode/ToggleSearchMode';
function Home() {
    const { ads } = useContext(TransportAdContext);
    const [isCarSearch, setIsCarSearch] = useState(true);

    const [isSelectFirst, setIsSelectFirst] = useState(true);

    const handleToggle = (isFirstSelected) => {
        setIsSelectFirst(isFirstSelected);
    };

    const handleUploadAds = async () => {
        await TransportAdService.uploadAdsToFirebase(ads); // Вызываем функцию загрузки из сервиса

        // await TransportAdService.uploadAdsToFirebase(ads); // Вызываем функцию загрузки из сервиса
    };

    return (
        <>
            <div style={{ padding: '20px' }}>
                <ToggleSearchMode
                    firstOption={{
                        icon: <TruckIcon />,
                        label: 'Найти машину',
                    }}
                    secondOption={{
                        icon: <CubeIcon />,
                        label: 'Найти груз',
                    }}
                    isSelectFirst={isSelectFirst}
                    onToggle={handleToggle}
                />
            </div>


            {/* <ChatInterface /> */}
            <div className={styles.container}>
                {/* <div> */}
                {/* Другие элементы вашего компонента */}
                {/* <button onClick={handleUploadAds}>
                        Выгрузить объявления на Firebase
                    </button> */}
                {/* </div> */}

                {/* <h2>Welcome to Oblacar</h2> */}
                <p>
                    {/* Your reliable platform for finding transportation services. */}
                    {/* <button onClick={addTransportAds}>
                        загрузить тестовую базу
                    </button> */}
                </p>
                {/* <CreateTransportAd /> */}
                <SearchTransport />
                {/* <p>
                    1. добавить раздел: фото водителя и рейтинг, проверенный ли
                    водитель, проверенная ли машшина. 2. возле цены можно
                    заместить важную инфомрацию по оплате, кроме цены
                </p> */}

                {/* <button onClick={handleUploadAds}>
                    Add ACTIVE for all ads
                </button> */}

                {/* <MultiPhotoUploader /> */}

                {/* <AdProfile
                    onSendRequest={handleSendRequest}
                    onMessage={handleMessage}
                    userType='cargoOwner' // или "transportOwner"
                    ad={ads.length > 0 ? ads[0].ad : null}
                /> */}
                {/* <TransportationTest /> */}
                <TransportAdsList />
            </div>
        </>
    );
}

export default Home;
