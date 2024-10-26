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

import { uploadPhoto } from '../utils/helper';
import testAds from '../constants/testData.json'; // Импортируйте тестовые данные

const transportAdsRef = databaseRef(db, 'transportAds'); // Ссылка на раздел transportAds в Realtime Database

const TransportAdService = {
    //В режиме разработки не отправляем данные в базу
    // createAd: async (adData) => {
    //     // Здесь можно добавить логику для отправки данных в базу данных
    //     console.log('Создание нового объявления о транспорте:', adData);

    //     // Пример имитации задержки TODO нужно будет убрать
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve('Объявление успешно создано!');
    //         }, 1000);
    //     });
    // },

    // Метод для создания объявления с использованием ID от Firebase
    createAd: async (adData) => {
        try {
            // Создаем ссылку на новый узел в базе данных и добавляем данные с уникальным ключом
            const newAdRef = push(databaseRef(db, 'transportAds'));
            const adId = newAdRef.key; // Получаем уникальный ID

            // Добавляем adId в объект объявления
            const adWithId = { ...adData, adId };

            // Сохраняем объявление в базе данных по сгенерированному Firebase ID
            await set(newAdRef, adWithId);

            // console.log('Объявление успешно создано с ID:', adId);
            return adWithId; // Возвращаем обновленное объявление с ID
        } catch (error) {
            console.error('Ошибка при создании объявления:', error);
            throw error;
        }
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

    //Изменение структуры все базы объявлений. Добавили поле status. Назначили всем active
    // Приходит в 4 этапа: все выгрузили, очистили, изменили и загрузили новую базу----->>>>
    uploadAdsToFirebase: async (ads) => {
        try {
            // const adsWithStatus = ads.map((ad) => ({
            //     ...ad,
            //     // Add new fields:
            //     ownerName: '',
            //     ownerPhotoUrl: '',
            //     ownerRating: 0,
            // }));

            const dbRef = databaseRef(db, 'transportAds'); // Создаем ссылку на узел "transportAds"

            // Очистка предыдущих данных (если нужно)
            await set(dbRef, null); // Очищаем узел перед загрузкой новых данных

            // const adsToUpload = adsWithStatus.map(async (ad) => {
            const adsToUpload = ads.map(async (ad) => {
                const newAdRef = push(dbRef); // Создаем уникальный ключ для нового объявления - если загружаем новое объявление, которого пока нет в базе

                // Сохраняем объявление с новыми полями
                await set(newAdRef, {
                    // await set(ad.adId, {
                    adId: ad.adId,
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
                    truckPhotoUrl: ad.truckPhotoUrl,
                    transportType: ad.transportType,
                    loadingTypes: ad.loadingTypes,
                    truckWeight: ad.truckWeight,
                    truckHeight: ad.truckHeight,
                    truckWidth: ad.truckWidth,
                    truckDepth: ad.truckDepth,
                    status: ad.status,
                    // Новые поля:
                    ownerName: ad.ownerName,
                    ownerPhotoUrl: ad.ownerPhotoUrl,
                    ownerRating: ad.ownerRating,
                });

                //!!! TODO Тужно быть аккуратней, кажется, что блок с фото удаляет ссылки. Проверяем, есть ли файл в truckPhotoUrl
                if (ad.truckPhotoUrl && ad.truckPhotoUrl instanceof File) {
                    const photoUrl = await uploadPhoto(
                        'truckPhotos',
                        ad.truckPhotoUrl
                    ); // Загрузка фото и получение URL
                    await update(newAdRef, { truckPhotoUrl: photoUrl }); // Обновляем ссылку на фото в объявлении
                }

                return newAdRef.key; // Возвращаем id нового объявления, если нужно
            });

            await Promise.all(adsToUpload); // Ждем завершения загрузки всех объявлений

            console.log('База обновлена');
        } catch (error) {
            console.error('Error uploading ads:', error);
        }
    },
    //<<<----------------

    //ReviewAds methods--->>>
    addReviewAd: async (userId, adId) => {
        const userReviewAdsRef = db.ref(`userReviewAds/${userId}/ads`);
        await userReviewAdsRef.transaction((currentAds) => {
            if (currentAds) {
                // Если объявления уже есть, добавляем новый adId
                if (!currentAds.includes(adId)) {
                    return [...currentAds, adId];
                }
            } else {
                // Если нет, создаем новый массив
                return [adId];
            }
            return currentAds;
        });
    },

    removeReviewAd: async (userId, adId) => {
        const userReviewAdsRef = db.ref(`userReviewAds/${userId}/ads`);
        await userReviewAdsRef.transaction((currentAds) => {
            if (currentAds) {
                // Удаляем adId из массива
                return currentAds.filter((id) => id !== adId);
            }
            return [];
        });
    },

    //<<<---
};

export default TransportAdService;
