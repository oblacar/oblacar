// src/services/TransportAdService.js
import { db, storage } from '../firebase'; // Измените путь, если необходимо

import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';

import {
    ref as databaseRef,
    set,
    get,
    update,
    query,
    limitToFirst,
    child,
    push,
} from 'firebase/database';

import testAds from '../constants/testData.json'; // Импортируйте тестовые данные

const transportAdsRef = databaseRef(db, 'transportAds'); // Ссылка на раздел transportAds в Realtime Database

const TransportAdService = {
    // Метод для добавления нового объявления
    // createAd: async (adData) => {
    //     try {
    //         const newAdRef = push(transportAdsRef); // Создает уникальный ключ для нового объявления
    //         await set(newAdRef, adData); // Сохраняет данные в базе
    //         return { id: newAdRef.key, ...adData }; // Возвращает объявление с ID
    //     } catch (error) {
    //         console.error('Ошибка при добавлении объявления: ', error);
    //         throw new Error(
    //             'Не удалось создать объявление. Попробуйте еще раз.'
    //         );
    //     }
    // },
    //В режиме разработки не отправляем данные в базу
    createAd: async (adData) => {
        // Здесь можно добавить логику для отправки данных в базу данных
        console.log('Создание нового объявления о транспорте:', adData);

        // Пример имитации задержки
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('Объявление успешно создано!');
            }, 1000);
        });
    },
    // В будущем можно добавить больше методов, таких как:
    // fetchTransports, updateTransportAd и т.д.

    getTestAds: async () => {
        // Например, если вы хотите использовать тестовые данные
        return new Promise((resolve) => {
            setTimeout(() => {
                // console.log(testAds); // Выводим объект в консоль

                resolve(testAds);
            }, 1000); // Задержка для имитации асинхронной загрузки
        });
    },

    // Метод для получения всех объявлений
    getAllAds: async () => {
        try {
            const snapshot = await get(transportAdsRef);

            console.log();

            if (!snapshot.exists()) {
                console.log('Нет данных в transportAds');

                return [];
            }

            const ads = [];

            snapshot.forEach((childSnapshot) => {
                ads.push({ id: childSnapshot.key, ...childSnapshot.val() }); // Добавляем каждое объявление в массив
            });

            return ads; // Возвращаем массив объявлений
        } catch (error) {
            console.error('Ошибка при получении объявлений: ', error);
            throw new Error(
                'Не удалось загрузить объявления. Попробуйте еще раз.'
            );
        }
    },

    // Метод для получения одного объявления по ID
    getAdById: async (adId) => {
        const adRef = databaseRef(db, `transportAds/${adId}`); // Ссылка на конкретное объявление

        try {
            const snapshot = await get(adRef);
            if (!snapshot.exists()) {
                console.log('Нет данных для данного объявления');
                return null; // Или возвращаем что-то другое, если данных нет
            }
            const adData = { id: snapshot.key, ...snapshot.val() };
            return adData; // Возвращаем данные объявления
        } catch (error) {
            console.error('Ошибка при получении объявления: ', error);
            throw new Error(
                'Не удалось загрузить объявление. Попробуйте еще раз.'
            );
        }
    },

    // Метод для поиска объявлений по ownerId
    searchAdsByOwnerId: async (ownerId) => {
        try {
            const snapshot = await get(transportAdsRef);
            if (!snapshot.exists()) {
                return [];
            }
            const ads = [];
            snapshot.forEach((childSnapshot) => {
                const adData = childSnapshot.val();
                if (adData.ownerId === ownerId) {
                    ads.push({ id: childSnapshot.key, ...adData }); // Добавляем каждое объявление в массив
                }
            });
            return ads; // Возвращаем отфильтрованные объявления
        } catch (error) {
            console.error('Ошибка при поиске объявлений: ', error);
            throw new Error('Не удалось выполнить поиск. Попробуйте еще раз.');
        }
    },

    uploadPhoto: async (file) => {
        if (!file) return;

        const photoRef = storageRef(storage, `truckPhotos/${file.name}`); // создаем уникальную ссылку для фото
        await uploadBytes(photoRef, file); // загружаем фото
        const photoUrl = await getDownloadURL(photoRef); // получаем ссылку на загруженное фото
        return photoUrl; // возвращаем ссылку
    },

    uploadAdsToFirebase: async (ads) => {
        try {
            const dbRef = databaseRef(db, 'transportAds'); // Создаем ссылку на узел "transportAds"

            // Очистка предыдущих данных (если нужно)
            await set(dbRef, null); // Очищаем узел перед загрузкой новых данных

            const adsToUpload = ads.map(async (ad) => {
                const newAdRef = push(dbRef); // Создаем уникальный ключ для нового объявления

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
                    const photoUrl = await TransportAdService.uploadPhoto(
                        ad.truckPhotoUrl
                    ); // Загрузка фото и получение URL
                    await update(newAdRef, { truckPhotoUrl: photoUrl }); // Обновляем ссылку на фото в объявлении
                }

                return newAdRef.key; // Возвращаем id нового объявления, если нужно
            });

            await Promise.all(adsToUpload); // Ждем завершения загрузки всех объявлений
        } catch (error) {
            console.error('Error uploading ads:', error);
        }
    },
};

export default TransportAdService;
