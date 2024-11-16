// src/services/TransportationService.js
import { db } from '../firebase'; // Подключаем Firebase
import { ref as databaseRef, set, get, update, push } from 'firebase/database';

import Transportation from '../entities/Transportation/Transportation'; // Импортируем сущность Transportation
import AdTransportationRequests from '../entities/Transportation/AdTransportationRequests';
import TransportationRequestMainData from '../entities/Transportation/TransportationRequestMainData';
import TransportationRequest from '../entities/Transportation/TransportationRequest';

class TransportationService {
    // Сервис для отслеживанияя Транспортировки - основная логика перевозки==>>

    /**
     * Добавляет новую транспортировку в базу данных.
     * @param {Object} transportation - Объект транспортировки.
     * @returns {Promise<void>}
     */
    static async addTransportation(transportation) {
        try {
            // Генерируем уникальный ключ в Firebase
            const transportationRef = push(databaseRef(db, 'transportations'));
            const transportationId = transportationRef.key;

            // Добавляем уникальный ключ в объект транспортировки
            transportation.transportationId = transportationId;

            // Сохраняем транспортировку в базу
            await set(transportationRef, transportation);
            console.log(
                'Transportation added successfully with ID:',
                transportationId
            );
        } catch (error) {
            console.error('Error adding transportation:', error);
            throw new Error('Failed to add transportation');
        }
    }

    /**
     * Получает транспортировку по ID.
     * @param {string} transportationId - ID транспортировки.
     * @returns {Promise<Object>}
     */
    static async getTransportationById(transportationId) {
        try {
            const transportationRef = databaseRef(
                db,
                `transportations/${transportationId}`
            );
            const snapshot = await get(transportationRef);

            if (snapshot.exists()) {
                // const data = snapshot.val();
                const data = snapshot.exists() ? snapshot.val() : null;
                if (!data) {
                    console.warn('No data found for ID:', transportationId);
                    return null; // Или обработайте отсутствие данных
                } else {
                    console.log('data: ', data);
                }

                // Убедимся, что поля фотографий существуют как объекты
                data.pickupPhotos = data.pickupPhotos || {};
                data.deliveryPhotos = data.deliveryPhotos || {};

                // Возвращаем экземпляр сущности Transportation
                return new Transportation(data);
            } else {
                console.warn(
                    'No transportation found for ID:',
                    transportationId
                );
                return null;
            }
        } catch (error) {
            console.error('Error fetching transportation:', error);
            throw new Error('Failed to fetch transportation');
        }
    }

    /**
     * Обновляет транспортировку в базе данных.
     * @param {string} transportationId - ID транспортировки.
     * @param {Object} updates - Объект с обновлениями.
     * @returns {Promise<void>}
     */
    static async updateTransportation(transportationId, updates) {
        try {
            const transportationRef = databaseRef(
                db,
                `transportations/${transportationId}`
            );
            await update(transportationRef, updates);
            console.log('Transportation updated successfully');
        } catch (error) {
            console.error('Error updating transportation:', error);
            throw new Error('Failed to update transportation');
        }
    }
    //<<==
    // Работа с запросами на транспортировку ==>>
    /**
     * Добавляет заголовок и запрос в коллекцию transportationRequests.
     * @param {TransportationRequestMainData} mainData - Заголовок.
     * @param {TransportationRequest} request - Объект запроса.
     * @returns {Promise<void>}
     */
    static async addTransportationRequest(mainData, request) {
        try {
            const userId = mainData.owner.id; // ID пользователя-владельца объявления
            const adId = mainData.adId; // ID объявления

            // Ссылка на данные пользователя и объявления
            const userAdRef = databaseRef(
                db,
                `transportationRequests/${userId}/${adId}`
            );

            // Проверяем, существует ли заголовок
            const snapshot = await get(userAdRef);
            if (!snapshot.exists()) {
                // Если заголовка нет, создаем его с пустым объектом requests
                await set(userAdRef, {
                    ...mainData,
                    requests: {},
                });
            }

            // Добавляем запрос в объект requests
            const requestId =
                request.requestId ||
                push(
                    databaseRef(
                        db,
                        `transportationRequests/${userId}/${adId}/requests`
                    )
                ).key;
            request.requestId = requestId;

            const requestRef = databaseRef(
                db,
                `transportationRequests/${userId}/${adId}/requests/${requestId}`
            );
            await set(requestRef, request);

            console.log('Transportation request added successfully.');
        } catch (error) {
            console.error('Error adding transportation request:', error);
            throw new Error('Failed to add transportation request.');
        }
    }

    /**
     * Получает запросы пользователя и возвращает массив AdTransportationRequests.
     * @param {string} userId - ID пользователя.
     * @returns {Promise<AdTransportationRequests[]>} Массив запросов.
     */
    static async getRequestsByUserId(userId) {
        try {
            const userRequestsRef = databaseRef(
                db,
                `transportationRequests/${userId}`
            );
            const snapshot = await get(userRequestsRef);

            if (!snapshot.exists()) {
                console.warn('No requests found for user ID:', userId);
                return [];
            }

            const data = snapshot.val();
            console.log('Fetched data for user:', data);

            const requestsArray = [];

            for (const adId in data) {
                const adData = data[adId];

                if (!adData || !adData.requests) {
                    console.warn(`Invalid structure for adId: ${adId}`, adData);
                    continue;
                }

                // Создаем TransportationRequestMainData
                const mainData = new TransportationRequestMainData({
                    adId: adData.adId,
                    locationFrom: adData.locationFrom,
                    locationTo: adData.locationTo,
                    date: adData.date,
                    price: adData.price,
                    paymentUnit: adData.paymentUnit,
                    owner: adData.owner,
                });

                // Создаем массив запросов
                const requests = [];
                for (const requestId in adData.requests) {
                    const requestData = adData.requests[requestId];
                    requests.push(new TransportationRequest(requestData));
                }

                // Создаем AdTransportationRequests и добавляем в массив
                requestsArray.push(
                    new AdTransportationRequests({ mainData, requests })
                );
            }

            return requestsArray;
        } catch (error) {
            console.error('Error fetching requests by user ID:', error);
            throw new Error('Failed to fetch transportation requests.');
        }
    }

    //Методы для работы с коллекцией transportationRequestsSent
    /**
     * Добавляет запись в коллекцию transportationRequestsSent.
     * @param {string} senderId - ID отправителя.
     * @param {string} requestId - ID запроса.
     * @param {Object} data - Данные запроса (ownerId, adId, requestId).
     * @returns {Promise<void>}
     */
    static async addSentRequest(senderId, requestId, data) {
        try {
            const sentRequestRef = databaseRef(
                db,
                `transportationRequestsSent/${senderId}/${requestId}`
            );
            await set(sentRequestRef, data);
            console.log(
                'Request added to transportationRequestsSent successfully.'
            );
        } catch (error) {
            console.error('Error adding to transportationRequestsSent:', error);
            throw new Error('Failed to add to transportationRequestsSent.');
        }
    }
    
    //Запросы на перевозку от лица сделавшего запрос-->
    /**
     * Получает все отправленные запросы для пользователя.
     * @param {string} senderId - ID отправителя.
     * @returns {Promise<Object>} - Объект с отправленными запросами.
     */
    static async getSentRequests(senderId) {
        try {
            const sentRequestsRef = databaseRef(
                db,
                `transportationRequestsSent/${senderId}`
            );
            const snapshot = await get(sentRequestsRef);

            if (!snapshot.exists()) {
                console.warn('No sent requests found for sender ID:', senderId);
                return {};
            }

            return snapshot.val();
        } catch (error) {
            console.error('Error fetching sent requests:', error);
            throw new Error('Failed to fetch sent requests.');
        }
    }
    //<--
    //<<==
    //
    static async testRead() {
        const userId = 'user001'; // Укажите существующий userId
        const adId = 'ad123'; // Укажите существующий adId
        const ref = databaseRef(db, `transportationRequests/${userId}/${adId}`);
        try {
            const snapshot = await get(ref);
            if (snapshot.exists()) {
                console.log('Data:', snapshot.val());
            } else {
                console.log('No data found');
            }
        } catch (error) {
            console.error('Error reading data:', error);
        }
    }
}

export default TransportationService;
