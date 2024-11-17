import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './Authorization/AuthContext';
import TransportationService from '../services/TransportationService';

import AdTransportationRequest from '../entities/Transportation/AdTransportationRequest';

const TransportationContext = createContext();

export const TransportationProvider = ({ children }) => {
    const { userId, isAuthenticated } = useContext(AuthContext); // Получаем текущего пользователя из AuthContext

    // Запросы к пользователю по всем его объявлениям
    const [adsTransportationRequests, setAdsTransportationRequests] = useState(
        []
    );

    //TODO запоментировать, что точно этим переменные хранят
    const [adTransportationRequests, setAdTransportationRequests] = useState(
        []
    );
    const [sentRequestsStatuses, setSentRequestsStatuses] = useState([]); // Статусы отправленных запросов

    useEffect(() => {
        const loadSentRequestsStatuses = async () => {
            if (isAuthenticated && userId) {
                try {
                    const statuses =
                        await TransportationService.getSentRequestsStatuses(
                            userId
                        );
                    setSentRequestsStatuses(statuses);
                } catch (error) {
                    console.error(
                        'Error loading sent requests statuses:',
                        error
                    );
                }
            }
        };

        const clearSentRequestsStatuses = () => {
            setSentRequestsStatuses([]);
        };

        const loadUserTransportationRequests = async () => {
            if (isAuthenticated && userId) {
                try {
                    const requests =
                        await TransportationService.getRequestsByUserId(userId);
                    setAdsTransportationRequests(requests);
                } catch (error) {
                    console.error(
                        'Error loading transportation requests:',
                        error
                    );
                }
            }
        };

        const clearTransportationRequests = () => {
            setAdsTransportationRequests([]);
        };

        const loadAdTransportationRequests = async () => {
            if (isAuthenticated && userId) {
                try {
                    const adRequests =
                        await TransportationService.getAdTransportationRequests(
                            userId
                        );
                    setAdTransportationRequests(adRequests); // Новый стейт для AdTransportationRequest
                } catch (error) {
                    console.error(
                        'Error loading AdTransportationRequests:',
                        error
                    );
                }
            }
        };

        const clearAdTransportationRequests = () => {
            setAdTransportationRequests([]);
        };

        // Загрузка данных
        loadUserTransportationRequests();
        loadSentRequestsStatuses();
        loadAdTransportationRequests();

        return () => {
            clearTransportationRequests(); // Очищаем данные объявлений
            clearSentRequestsStatuses(); // Очищаем статусы запросов
            clearAdTransportationRequests(); // Очищаем данные AdTransportationRequests
        };
    }, [userId, isAuthenticated]);

    /**
     * Возвращает статус отправленного запроса по ID объявления.
     * @param {string} adId - ID объявления.
     * @returns {string} Статус запроса ('pending', 'accepted', 'none' и т.д.).
     */
    const getRequestStatusByAdId = (adId) => {
        const found = sentRequestsStatuses.find(
            (request) => request.adId === adId
        );
        return found ? found.status : 'none';
    };

    /**
     * Отправляет запрос на перевозку. Возвращаем id запроса (requestId)
     * @param {TransportationRequestMainData} mainData - Заголовок.
     * @param {TransportationRequest} request - Объект запроса.
     * @returns {Promise<void>}
     */
    const sendTransportationRequest = async (mainData, request) => {
        try {
            // Отправляем запрос через сервис
            const requestId =
                await TransportationService.addTransportationRequest(
                    mainData,
                    request
                );

            // Создаем новый объект AdTransportationRequest
            const updatedAdTransportationRequest = new AdTransportationRequest({
                adId: mainData.adId,
                adData: {
                    locationFrom: mainData.locationFrom,
                    locationTo: mainData.locationTo,
                    date: mainData.date,
                    price: mainData.price,
                    paymentUnit: mainData.paymentUnit,
                    owner: mainData.owner,
                },
                requestData: {
                    requestId,
                    sender: request.sender,
                    dateSent: request.dateSent || new Date().toISOString(),
                    status: request.status,
                    description: request.description, // TODO добавляем. пока не отлажено
                },
            });

            // Обновляем локальный стейт
            setAdTransportationRequests((prevRequests) => {
                const existingRequestIndex = prevRequests.findIndex(
                    (req) => req.adId === mainData.adId
                );

                if (existingRequestIndex !== -1) {
                    // Если запрос существует, обновляем его
                    const updatedRequests = [...prevRequests];
                    updatedRequests[existingRequestIndex] =
                        updatedAdTransportationRequest;
                    return updatedRequests;
                }

                // Если запрос не существует, добавляем новый
                return [...prevRequests, updatedAdTransportationRequest];
            });

            console.log(
                'Request sent and updated in local state successfully!'
            );
            return requestId;
        } catch (error) {
            console.error('Error sending transportation request:', error);
            throw error;
        }
    };

    /**
     * Получает объект AdTransportationRequest cо списком всех запросов по ID объявления.
     * @param {string} adId - ID объявления.
     * @returns {AdTransportationRequest | null} Объект AdTransportationRequest или null, если не найден.
     */
    const getAdTransportationRequestsByAdId = (adId) => {
        const request = adsTransportationRequests.find(
            (item) => item.mainData.adId === adId
        );
        return request || null;
    };

    /**
     * Получает объект AdTransportationRequest по ID объявления.
     * @param {string} adId - ID объявления.
     * @returns {AdTransportationRequest | null} Объект AdTransportationRequest или null, если не найден.
     */
    const getAdTransportationRequestByAdId = (adId) => {
        console.log(
            'в Контексте adTransportationRequests: ',
            adTransportationRequests
        );

        const request = adTransportationRequests.find(
            (item) => item.adId === adId
        );
        return request || null;
    };

    const cancelTransportationRequest = async (
        adId,
        userId,
        ownerId,
        requestId
    ) => {
        try {
            // // Находим данные для отмены
            // const adRequest = getAdTransportationRequestByAdId(adId);
            // if (!adRequest) {
            //     console.error('No request found for the given adId.');
            //     return;
            // }

            // const { requestId } = adRequest.requestData;
            // const { id: ownerId } = adRequest.adData.owner;

            // Вызываем метод отмены в сервисе

            console.log('в контексте номер об: ', adId); // передается не номер объявления

            await TransportationService.cancelTransportationRequest(
                adId,
                userId,
                ownerId,
                requestId
            );

            // Обновляем локальный стейт
            setAdTransportationRequests((prevRequests) =>
                prevRequests.map((request) => {
                    console.log('объекты в запросах: ', request);

                    if (request.adId === adId) {
                        console.log('В контексте: ', request);

                        return {
                            ...request,
                            requestData: {
                                ...request.requestData,
                                status: 'cancelled',
                            },
                        };
                    }
                    return request;
                })
            );

            console.log('Request cancelled and removed from local state.');
        } catch (error) {
            console.error('Error cancelling request:', error);
        }
    };

    /**
     * Перезапускает запрос, устанавливая его статус на 'none'.
     * @param {string} adId - ID объявления.
     * @param {string} senderId - ID отправителя запроса.
     * @param {string} ownerId - ID владельца объявления.
     * @param {string} requestId - ID запроса.
     * @returns {Promise<void>}
     */
    const restartTransportationRequest = async (
        adId,
        senderId,
        ownerId,
        requestId
    ) => {
        try {
            // Вызываем метод перезапуска в сервисе
            await TransportationService.restartTransportationRequest(
                adId,
                senderId,
                ownerId,
                requestId
            );

            // Обновляем локальный стейт
            setAdTransportationRequests((prevRequests) =>
                prevRequests.map((request) => {
                    if (request.adId === adId) {
                        return {
                            ...request,
                            requestData: {
                                ...request.requestData,
                                status: 'none',
                            },
                        };
                    }
                    return request;
                })
            );

            console.log('Request restarted and updated in local state.');
        } catch (error) {
            console.error('Error restarting request:', error);
        }
    };

    return (
        <TransportationContext.Provider
            value={{
                adsTransportationRequests,
                sendTransportationRequest,
                getRequestStatusByAdId,

                //объявления по которым отправлены запросы
                adTransportationRequests,
                getAdTransportationRequestByAdId,
                cancelTransportationRequest,
                restartTransportationRequest,
                getAdTransportationRequestsByAdId,
            }}
        >
            {children}
        </TransportationContext.Provider>
    );
};

export default TransportationContext;
