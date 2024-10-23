// src/pages/Home/Home.js
import React, { useContext } from 'react';
import styles from './Home.module.css'; // Подключаем стили

import TransportAdContext from '../../hooks/TransportAdContext';

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

function Home() {
    const { ads } = useContext(TransportAdContext);

    const uploadPhoto = async (file) => {
        if (!file) return;

        const photoRef = storageRef(storage, `truckPhotos/${file.name}`); // создаем уникальную ссылку для фото

        await uploadBytes(photoRef, file); // загружаем фото

        const photoUrl = await getDownloadURL(photoRef); // получаем ссылку на загруженное фото
        return photoUrl; // возвращаем ссылку
    };

    const handleUploadAds = async () => {
        try {
            //    console.log('before');

            // Создаем ссылку на коллекцию "ads" в Firebase
            const dbRef = ref(db, 'transportAds'); // Создаем ссылку на узел "transportAds"
            //    console.log('after');

            // Очистка предыдущих данных (если нужно)
            await set(dbRef, null); // Очищаем узел перед загрузкой новых данных

            // Проходимся по всем объявлениям из контекста
            const adsToUpload = ads.map(async (ad) => {
                const newAdRef = push(dbRef); // Создаем уникальный ключ для нового объявления

                // Сохраняем объявление с пустым полем для ссылки на фото
                await set(newAdRef, {
                    adId: newAdRef.key,
                    ownerId: ad.ownerId,
                    availabilityDate: ad.availabilityDate,
                    departureCity: ad.departureCity,
                    destinationCity: ad.destinationCity,
                    price: ad.price,
                    paymentUnit: ad.paymentUnit,
                    readyToNegotiate: ad.readyToNegotiate,
                    paymentOptions: ad.paymentOptions,
                    truckId: ad.truckId,
                    truckName: ad.truckName,
                    truckPhotoUrl: '', // Пустое поле для ссылки на фото
                    transportType: ad.transportType,
                    loadingTypes: ad.loadingTypes,
                    truckWeight: ad.truckWeight,
                    truckHeight: ad.truckHeight,
                    truckWidth: ad.truckWidth,
                    truckDepth: ad.truckDepth,
                });

                // Проверяем, есть ли файл в truckPhotoUrl
                if (ad.truckPhotoUrl && ad.truckPhotoUrl instanceof File) {
                    const photoUrl = await uploadPhoto(ad.truckPhotoUrl); // Загрузка фото и получение URL
                    await update(newAdRef, { truckPhotoUrl: photoUrl }); // Обновляем ссылку на фото в объявлении
                }

                return newAdRef.key; // Возвращаем id нового объявления, если нужно
            });

            await Promise.all(adsToUpload); // Ждем завершения загрузки всех объявлений
        } catch (error) {
            console.error('Error uploading ads:', error);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div>
                    {/* Другие элементы вашего компонента */}
                    <button onClick={handleUploadAds}>
                        Выгрузить объявления на Firebase
                    </button>
                </div>

                {/* <h2>Welcome to Oblacar</h2> */}
                <p>
                    {/* Your reliable platform for finding transportation services. */}
                    {/* <button onClick={addTransportAds}>
                        загрузить тестовую базу
                    </button> */}
                </p>
                {/* <CreateTransportAd /> */}
                {/* <SearchTransport /> */}
                {/* <p>
                    1. добавить раздел: фото водителя и рейтинг, проверенный ли
                    водитель, проверенная ли машшина. 2. возле цены можно
                    заместить важную инфомрацию по оплате, кроме цены
                </p> */}
                <TransportAdsList />
            </div>
        </>
    );
}

export default Home;
