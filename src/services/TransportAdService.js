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

// Удобный хелпер для текущего времени в мс
const nowTs = () => Date.now();

const TransportAdService = {
    /**
     * Создание объявления.
     * - загружает фото (если пришли File/base64), заменяет их на URL'ы
     * - генерирует adId
     * - проставляет createdAt и updatedAt одинаковыми (Date.now())
     * - сохраняет в RTDB
     * Возвращает объект объявления, сохранённый в БД.
     */
    createAd: async (adData) => {
        try {
            // 1) Загрузка фото в storage (если пришли File/base64)
            if (adData.truckPhotoUrls && adData.truckPhotoUrls.length > 0) {
                const photoUrls = await Promise.all(
                    adData.truckPhotoUrls.map((file) =>
                        TransportAdService.uploadPhoto(file)
                    )
                );

                // Обновляем массив ссылок (фильтруем возможные null)
                adData.truckPhotoUrls = photoUrls.filter(Boolean);

                if (adData.truckPhotoUrls.length === 0) {
                    console.error('Не удалось загрузить ни одного фото.');
                    throw new Error('Загрузка фото не удалась.');
                }
            }

            // 2) Создаём запись
            const newAdRef = push(databaseRef(db, 'transportAds'));
            const adId = newAdRef.key;

            // 3) Проставляем метки времени
            const ts = nowTs();
            const adWithId = {
                ...adData,
                adId,
                createdAt: ts, // дата создания
                updatedAt: ts, // на момент создания совпадает с createdAt
            };

            await set(newAdRef, adWithId);

            return adWithId;
        } catch (error) {
            console.error('Ошибка при создании объявления:', error);
            throw error;
        }
    },

    /**
     * Частичное обновление объявления.
     * - принимает patch-объект с изменяемыми полями
     * - автоматически проставляет updatedAt = Date.now()
     * - если приходит truckPhotoUrls как File/base64/массив смешанный — перезаливает и сохраняет URL'ы
     * Возвращает обновлённое объявление из БД.
     */
    updateAd: async (adId, patch = {}) => {
        if (!adId) throw new Error('updateAd: adId is required');

        try {
            const adRef = databaseRef(db, `transportAds/${adId}`);
            const dataToUpdate = { ...patch, updatedAt: nowTs() };

            // Поддержка перезаливки фото (если передали File/base64)
            if (patch.truckPhotoUrls) {
                const incoming = Array.isArray(patch.truckPhotoUrls)
                    ? patch.truckPhotoUrls
                    : [patch.truckPhotoUrls];

                const photoUrls = await Promise.all(
                    incoming.map((f) => TransportAdService.uploadPhoto(f))
                );

                dataToUpdate.truckPhotoUrls = photoUrls.filter(Boolean);
            }

            await update(adRef, dataToUpdate);

            // Вернём актуальные данные
            const snap = await get(adRef);
            return snap.exists() ? snap.val() : null;
        } catch (error) {
            console.error('Ошибка при обновлении объявления:', error);
            throw error;
        }
    },

    // В будущем можно добавить больше методов, таких как:
    // fetchTransports и т.д.

    getTestAds: async () => {
        // Например, если вы хотите использовать тестовые данные
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(testAds);
            }, 1000); // Задержка для имитации асинхронной загрузки
        });
    },

    /**
     * Получение всех объявлений.
     * Старые записи (если были без createdAt/updatedAt) здесь можно нормализовать при чтении
     * или мигрировать отдельно. Ниже — минимальная нормализация массивов.
     */
    getAllAds: async () => {
        try {
            const snapshot = await get(transportAdsRef);

            if (!snapshot.exists()) {
                console.log('Нет данных в transportAds');
                return [];
            }

            const ads = [];

            const normalizeReceivedData = (data) => ({
                ...data,
                // Приводим поля-массивы к массивам (пустая строка -> [])
                truckPhotoUrls:
                    data.truckPhotoUrls === '' ? [] : data.truckPhotoUrls,
                loadingTypes: data.loadingTypes === '' ? [] : data.loadingTypes,
                paymentOptions:
                    data.paymentOptions === '' ? [] : data.paymentOptions,
                // createdAt/updatedAt здесь не трогаем специально:
                // компоненты/контексты ожидают строгую модель; заполняем их на create/update.
            });

            // Не скачиваем удалённые объявления
            snapshot.forEach((childSnapshot) => {
                const adData = normalizeReceivedData(childSnapshot.val());
                if (adData.status !== 'deleted') {
                    ads.push({
                        ...adData,
                    });
                }
            });

            return ads;
        } catch (error) {
            console.error('Ошибка при получении объявлений: ', error);
            throw new Error(
                'Не удалось загрузить объявления. Попробуйте еще раз.'
            );
        }
    },

    /**
     * Получение одного объявления по ID.
     */
    getAdById: async (adId) => {
        try {
            const adRef = databaseRef(db, `transportAds/${adId}`);
            const snapshot = await get(adRef);

            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                console.log(`Объявление с id ${adId} не найдено.`);
                return null;
            }
        } catch (error) {
            console.error(
                `Ошибка при получении объявления с id ${adId}:`,
                error
            );
            throw new Error(
                'Не удалось загрузить объявление. Попробуйте еще раз.'
            );
        }
    },

    // Метод для поиска объявлений по ownerId (пример из прошлого варианта был закомментирован)
    // при необходимости можно вернуть и ускоренный через orderByChild/equalTo.

    /**
     * Загрузка одного фото в Firebase Storage.
     * Принимает File или base64-строку data:image/...
     * Возвращает публичный URL загруженного файла.
     */
    uploadPhoto: async (file) => {
        try {
            // Поддержка base64
            if (typeof file === 'string' && file.startsWith('data:image')) {
                file = base64ToFile(file, `truck_${Date.now()}.jpg`);
            } else if (typeof File !== 'undefined' && !(file instanceof File)) {
                console.error('Неверный тип файла:', file);
                return null;
            }

            const name = file?.name || `image_${Date.now()}.jpg`;
            const photoRef = storageRef(storage, `truckPhotos/${name}`);

            await uploadBytes(photoRef, file);
            const photoUrl = await getDownloadURL(photoRef);

            return photoUrl;
        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
            return null;
        }
    },

    /**
     * Массовая загрузка набора объявлений (миграция структуры).
     * Очищает узел и записывает все объявления заново.
     * Здесь также можно проставить createdAt/updatedAt, если их нет.
     */
    uploadAdsToFirebase: async (ads) => {
        try {
            const dbRef = databaseRef(db, 'transportAds');

            // Очистка предыдущих данных (если нужно)
            await set(dbRef, null);

            const adsToUpload = ads.map(async (ad) => {
                const newAdRef = push(dbRef);

                // Проставим метки времени, если их не было
                const created =
                    typeof ad.createdAt === 'number' ? ad.createdAt : nowTs();
                const updated =
                    typeof ad.updatedAt === 'number' ? ad.updatedAt : created;

                // Сохраняем объявление
                await set(newAdRef, {
                    adId: ad.adId ?? newAdRef.key,
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

                    // Метки времени:
                    createdAt: created,
                    updatedAt: updated,
                });

                // Осторожно с перезаливкой фото:
                if (
                    ad.truckPhotoUrls &&
                    ad.truckPhotoUrls[0] &&
                    typeof File !== 'undefined' &&
                    ad.truckPhotoUrls[0] instanceof File
                ) {
                    const photoUrl = await uploadPhotoFromHelper(
                        'truckPhotos',
                        ad.truckPhotoUrls[0]
                    );
                    await update(newAdRef, {
                        truckPhotoUrls: [photoUrl],
                        updatedAt: nowTs(), // апдейтим метку модификации
                    });
                }

                return newAdRef.key;
            });

            await Promise.all(adsToUpload);

            console.log('База обновлена');
        } catch (error) {
            console.error('Error uploading ads:', error);
        }
    },

    /**
     * Групповая загрузка фото — вернёт массив URL'ов.
     */
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

    /**
     * Массовое обновление фото пользователя во всех его объявлениях.
     * При обновлении также проставляем updatedAt.
     */
    async updateUserPhotoInAds(userId, newPhotoUrl) {
        try {
            const adsRef = databaseRef(db, 'transportAds');
            const snapshot = await get(adsRef);

            if (snapshot.exists()) {
                const updates = {};

                snapshot.forEach((childSnapshot) => {
                    const adData = childSnapshot.val();

                    if (adData.ownerId === userId) {
                        updates[
                            `transportAds/${childSnapshot.key}/ownerPhotoUrl`
                        ] = newPhotoUrl;
                        updates[`transportAds/${childSnapshot.key}/updatedAt`] =
                            nowTs();
                    }
                });

                if (Object.keys(updates).length > 0) {
                    await update(databaseRef(db), updates);
                }
            }
        } catch (error) {
            console.error('Ошибка при обновлении фото в объявлениях:', error);
            throw error;
        }
    },
};

export default TransportAdService;
