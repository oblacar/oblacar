// src/services/TransportAdService.js
import { db } from '../firebase'; // Импортируйте ваш экземпляр Firebase
import { ref, set, get, child, push } from 'firebase/database';

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
            if (!snapshot.exists()) {
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
