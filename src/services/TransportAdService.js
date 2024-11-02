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

import {
    base64ToFile,
    uploadPhoto as uploadPhotoFromHelper,
} from '../utils/helper';
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
    // createAd: async (adData) => {
    //     try {
    //         // Создаем ссылку на новый узел в базе данных и добавляем данные с уникальным ключом
    //         const newAdRef = push(databaseRef(db, 'transportAds'));
    //         const adId = newAdRef.key; // Получаем уникальный ID

    //         // Добавляем adId в объект объявления
    //         const adWithId = { ...adData, adId };

    //         // Сохраняем объявление в базе данных по сгенерированному Firebase ID
    //         await set(newAdRef, adWithId);

    //         // console.log('Объявление успешно создано с ID:', adId);
    //         return adWithId; // Возвращаем обновленное объявление с ID
    //     } catch (error) {
    //         console.error('Ошибка при создании объявления:', error);
    //         throw error;
    //     }
    // },

    createAd: async (adData) => {
        try {
            // Проверяем, есть ли массив фото и загружаем каждое
            if (adData.truckPhotoUrls && adData.truckPhotoUrls.length > 0) {
                const photoUrls = await Promise.all(
                    adData.truckPhotoUrls.map((file) =>
                        TransportAdService.uploadPhoto(file)
                    ) // TODO зачем-то берет файл из helper?
                );
                // Обновляем массив `truckPhotoUrls` ссылками на загруженные фото
                adData.truckPhotoUrls = photoUrls;

                if (adData.truckPhotoUrls.length === 0) {
                    console.error('Не удалось загрузить ни одного фото.');
                    throw new Error('Загрузка фото не удалась.');
                }
            }

            console.log('Из сериса: ', adData);

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

            const normalizeReceivedData = (data) => ({
                ...data,
                // truckPhotoUrls: Array.isArray(data.truckPhotoUrls)
                //     ? data.truckPhotoUrls
                //     : data.truckPhotoUrls
                //     ? [data.truckPhotoUrls]
                //     : [],
                truckPhotoUrls:
                    data.truckPhotoUrls === '' ? [] : data.truckPhotoUrls,

                loadingTypes: data.loadingTypes === '' ? [] : data.loadingTypes,

                paymentOptions:
                    data.paymentOptions === '' ? [] : data.paymentOptions,
                // обработка других полей...
            });

            // snapshot.forEach((childSnapshot) => {
            //     ads.push({
            //         id: childSnapshot.key, //TODO нужно проверить, где мы используем id
            //         ...normalizeReceivedData(childSnapshot.val()),
            //     }); // Добавляем каждое объявление в массив
            // });

            // не скачиваем Удаленные объявления
            snapshot.forEach((childSnapshot) => {
                const adData = normalizeReceivedData(childSnapshot.val());
                // Пропускаем объявления со статусом 'deleted'
                if (adData.status !== 'deleted') {
                    ads.push({
                        // id: childSnapshot.key,
                        ...adData,
                    });
                }
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
        try {
            const adRef = databaseRef(db, `transportAds/${adId}`);
            const snapshot = await get(adRef);

            if (snapshot.exists()) {
                return snapshot.val(); // Возвращаем данные объявления, если оно существует
            } else {
                console.log(`Объявление с id ${adId} не найдено.`);
                return null; // Возвращаем null, если объявление не найдено
            }
        } catch (error) {
            console.error(
                `Ошибка при получении объявления с id ${adId}:`,
                error
            );
            throw new Error(
                `Не удалось загрузить объявление. Попробуйте еще раз.`
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

    //Метод загрузки одного фото в storage на firebase. Возвращает ссылку
    // Обновленный метод uploadPhoto для обработки base64
    uploadPhoto: async (file) => {
        try {
            // Проверяем, является ли file строкой base64 и конвертируем в File, если это так
            if (typeof file === 'string' && file.startsWith('data:image')) {
                file = base64ToFile(file, `truck_${Date.now()}.jpg`);
            } else if (!(file instanceof File)) {
                console.error('Неверный тип файла:', file);
                return null;
            }

            // создаем уникальную ссылку для фото
            const photoRef = storageRef(storage, `truckPhotos/${file.name}`);

            // загружаем фото
            await uploadBytes(photoRef, file);

            // получаем ссылку на загруженное фото
            const photoUrl = await getDownloadURL(photoRef);

            return photoUrl; // возвращаем ссылку
        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
            return null; // Вернем null, чтобы обработать ошибку
        }
    },

    //Изменение структуры всей базы объявлений. Добавили поле status. Назначили всем active
    // Приходит в 4 этапа: все выгрузили, очистили, изменили и загрузили новую базу----->>>>
    uploadAdsToFirebase: async (ads) => {
        try {
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
                    truckPhotoUrls: ad.truckPhotoUrls,
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
                if (
                    ad.truckPhotoUrls &&
                    ad.truckPhotoUrls[0] &&
                    ad.truckPhotoUrls[0] instanceof File
                ) {
                    const photoUrl = await uploadPhotoFromHelper(
                        'truckPhotos',
                        ad.truckPhotoUrls[0]
                    ); // Загрузка фото и получение URL
                    await update(newAdRef, { truckPhotoUrls: photoUrl }); // TODO неправильное обновление. Нужно отладитьОбновляем ссылку на фото в объявлении
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
        const userReviewAdsRef = databaseRef(
            db,
            `userReviewAds/${userId}/reviewAds`
        );

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
        const userReviewAdsRef = databaseRef(
            db,
            `userReviewAds/${userId}/reviewAds`
        );

        await userReviewAdsRef.transaction((currentAds) => {
            if (currentAds) {
                // Удаляем adId из массива
                return currentAds.filter((id) => id !== adId);
            }
            return [];
        });
    },

    getReviewAds: async (userId) => {
        try {
            const reviewAdsRef = databaseRef(
                db,
                `userReviewAds/${userId}/reviewAds`
            ); // Обращаемся к нужному пути

            const snapshot = await get(reviewAdsRef);
            if (snapshot.exists()) {
                return snapshot.val(); // Вернет массив ID объявлений из базы
            } else {
                return []; // Если данных нет, возвращаем пустой массив
            }
        } catch (error) {
            console.error('Ошибка при получении userReviewAds:', error);
            throw error;
        }
    },
    //<<<---

    //Метод для загрузки фото группой, возвращает массив ссылок, которые будет передавать объекту--->>>
    uploadPhotoSet: async (selectedPhotos) => {
        const photoUrls = [];
        for (let photo of selectedPhotos) {
            const photoRef = storageRef(storage, `truckPhotos/${photo.name}`);
            await uploadBytes(photoRef, photo);
            const url = await getDownloadURL(photoRef);
            photoUrls.push(url);
        }
        return photoUrls;
    },
    //<<<---
};

export default TransportAdService;
