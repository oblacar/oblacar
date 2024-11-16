import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './Authorization/AuthContext';
import TransportationService from '../services/TransportationService';

import AdTransportationRequest from '../entities/Transportation/AdTransportationRequest';

const TransportationContext = createContext();

export const TransportationProvider = ({ children }) => {
    const { userId, isAuthenticated } = useContext(AuthContext); // Получаем текущего пользователя из AuthContext
    const [adsTransportationRequests, setAdsTransportationRequests] = useState(
        []
    );
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
            const newAdTransportationRequest = new AdTransportationRequest({
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
                    dateSent: request.dateSent,
                    status: request.status,
                    description: request.description,//TODO добавляем. пока не отлажено
                },
            });

            // Добавляем новый объект в локальный стейт
            setAdTransportationRequests((prevRequests) => [
                ...prevRequests,
                newAdTransportationRequest,
            ]);

            console.log('Request sent and added to local state successfully!');
            return requestId;
        } catch (error) {
            console.error('Error sending transportation request:', error);
            throw error;
        }
    };

    /**
     * Получает объект AdTransportationRequest по ID объявления.
     * @param {string} adId - ID объявления.
     * @returns {AdTransportationRequest | null} Объект AdTransportationRequest или null, если не найден.
     */
    const getAdTransportationRequestByAdId = (adId) => {
        const request = adTransportationRequests.find(
            (item) => item.adId === adId
        );
        return request || null;
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
            }}
        >
            {children}
        </TransportationContext.Provider>
    );
};

export default TransportationContext;
