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

import DevVehicleQuickTest from './DevVehicleQuickTest';

import CargoAdCard from '../../components/CargoAds/CargoAdCard/CargoAdCard';
import CargoAdMiniCard from '../../components/CargoAds/CargoAdMiniCard';
import SeedCargoAdsButton from '../../dev/SeedCargoAdsButton';
import CargoAdLisT from '../../components/CargoAds/CargoAdsList';

import AdminCargoSeeder from "../../seed/AdminCargoSeeder";

// тестовые объявления о Грузе------------------>
// Простой полноценный пример
export const myCargoAdObject = {
    adId: 'CARGO-1737',
    createdAt: new Date().toISOString(),
    route: { from: 'Москва', to: 'Санкт-Петербург' },
    dates: { pickupDate: '2025-09-20', deliveryDate: '2025-09-22' },
    cargo: {
        name: 'Электроника',
        type: 'Паллеты',
        weightTons: 4.8,
        dims: { h: 1.8, w: 2.2, d: 6.0 },
        fragile: true,
        temperature: '0…+5°C',
    },
    loadingTypes: ['задняя', 'боковая'],
    price: { value: 125000, unit: 'руб', readyToNegotiate: true },
};

// Вариант с объектом loadingTypes и без габаритов (проверка «заглушек»)
export const myCargoAdObject2 = {
    adId: 'CARGO-1738',
    date: '2025-09-10',
    route: { from: 'Казань', to: 'Нижний Новгород' },
    availabilityDate: '2025-09-12',
    cargo: {
        name: 'Мебель',
        weightTons: 10,
        // dims опущены
    },
    loadingTypes: { верхняя: true, задняя: true },
    price: { value: 80000, unit: 'руб', readyToNegotiate: false },
};

// Вариант без цены (покажет «Цена не указана»)
export const myCargoAdObject3 = {
    adId: 'CARGO-1739',
    createdAt: '2025-09-05',
    route: { from: 'Екатеринбург', to: 'Челябинск' },
    dates: { pickupDate: '2025-09-18' },
    cargo: {
        name: 'Металлопрокат',
        type: 'Длинномер',
        weightTons: 18.2,
        dims: { h: 2.5, w: 2.4, d: 13.6 },
    },
    loadingTypes: ['верхняя'],
    // price отсутствует
};

// Тот же первый объект, но в «расширенной» обёртке (как в твоих контекстах)
export const myCargoAdExt = {
    ad: myCargoAdObject,
    isInReviewAds: false,
};



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
            {/* <div>
                <DevVehicleQuickTest />
            </div> */}
            {/* <SeedCargoAdsButton /> */}
            {/* <div>
                <CargoAdMiniCard ad={myCargoAdObject} />
                </div>
                
                <div>
                <CargoAdCard ad={myCargoAdObject} className="card-wrap" />
                </div> */}

            {/* <div style={{ padding: 24 }}>
                <h2>Админ-инструменты</h2>
                <AdminCargoSeeder />
            </div> */}

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
                <SearchTransport />
                {isSelectFirst ? <TransportAdsList /> : <CargoAdLisT />}
            </div>
        </>
    );
}

export default Home;
