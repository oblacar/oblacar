// src/services/TransportAdService.js
import { db } from '../firebase'; // Импортируйте ваш экземпляр Firebase
import {
    ref,
    set,
    get,
    query,
    limitToFirst,
    child,
    push,
} from 'firebase/database';

const transportAdsRef = ref(db, 'transportAds'); // Ссылка на раздел transportAds в Realtime Database

const TransportAdService = {
    // Метод для добавления нового объявления
    createAd: async (adData) => {
        try {
            const newAdRef = push(transportAdsRef); // Создает уникальный ключ для нового объявления
            await set(newAdRef, adData); // Сохраняет данные в базе
            return { id: newAdRef.key, ...adData }; // Возвращает объявление с ID
        } catch (error) {
            console.error('Ошибка при добавлении объявления: ', error);
            throw new Error(
                'Не удалось создать объявление. Попробуйте еще раз.'
            );
        }
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
        const adRef = ref(db, `transportAds/${adId}`); // Ссылка на конкретное объявление

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
};

export default TransportAdService;
