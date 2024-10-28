// src/hooks/TransportAd/TransportAdContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import TransportAdService from '../services/TransportAdService';
import UserReviewAdService from '../services/UserReviewAdService';

import AuthContext from './Authorization/AuthContext';

const TransportAdContext = createContext();

export const TransportAdProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [reviewAds, setReviewAds] = useState([]);

    // загрузка объявлений после получения базы отмеченных объявлений:
    //Оптимизированный метод сверки объявлений с отмеченными
    function markReviewAds(ads, reviewAds) {
        let remainingReviewAds = new Set(reviewAds); // Преобразуем в Set для быстрого поиска
        const enhancedAds = []; // Массив для расширенных объявлений

        for (let ad of ads) {
            let isInReviewAds = false;

            if (remainingReviewAds.size > 0) {
                isInReviewAds = remainingReviewAds.has(ad.adId);
            }

            // Добавляем расширенное объявление в массив
            enhancedAds.push({
                ad, // Само объявление
                isInReviewAds: isInReviewAds, // Флаг наличия в списке отмеченных
            });

            // Убираем найденное объявление из оставшихся
            if (isInReviewAds) {
                remainingReviewAds.delete(ad.adId);
            }
        }
        return enhancedAds; // Возвращаем массив расширенных объявлений
    }

    function processAds(ads, reviewAds) {
        let remainingReviewAds = new Set(reviewAds);
        const enhancedAds = []; // Массив для расширенных объявлений
        const foundAds = []; // Массив для найденных отмеченных объявлений

        const isAdsStructure = (ad) => {
            const requiredKeys = ['isInReviewAds']; // Здесь перечислите нужные ключи

            return requiredKeys.every((key) => ad.hasOwnProperty(key));
        };
        const isAdsExtended = isAdsStructure(ads[0]);

        console.log('isAdsExtended: ', isAdsExtended);

        for (let ad of ads) {
            let newExtAd;

            if (isAdsExtended) {
                newExtAd = ad;

                newExtAd = {
                    ...ad,
                    isInReviewAds: false,
                };
            } else {
                newExtAd = {
                    ad,
                    isInReviewAds: false,
                };
            }

            if (remainingReviewAds.size > 0) {
                const isInReviewAds = remainingReviewAds.has(newExtAd.ad.adId);

                if (isInReviewAds) {
                    newExtAd.isInReviewAds = true;

                    foundAds.push(newExtAd);
                    remainingReviewAds.delete(newExtAd.ad.adId);
                }
            }

            // Добавляем расширенное объявление
            enhancedAds.push(newExtAd);
        }

        return {
            enhancedAds,
            foundAds,
        };
    }

    useEffect(() => {
        if (
            !localStorage.getItem('authToken') &&
            !localStorage.getItem('authEmail')
        ) {
            // Обновляем все объявления, чтобы сбросить isInReviewAds
            setAds((ads) =>
                ads.map((ad) => ({
                    ...ad, // Копируем объявление
                    isInReviewAds: false, // Сбрасываем статус
                }))
            );

            // Очищаем список вариантов
            setReviewAds([]);
            return;
        }

        if (!user) return;

        const fetchInitialData = async () => {
            setLoading(true);

            try {
                // Загружаем reviewAds и сохраняем
                const initialReviewAds = await TransportAdService.getReviewAds(
                    user.userId
                );

                console.log(initialReviewAds);

                // Преобразуем initialReviewAds в массив ключей
                const reviewAdsArray = initialReviewAds
                    ? Object.keys(initialReviewAds)
                    : [];

                if (ads.length === 0) {
                    const adsData = await TransportAdService.getAllAds();

                    // Назначаем каждому объявлению статус isInReviewAds на основе reviewAds
                    // enhancedAds = markReviewAds(adsData, reviewAdsArray);
                    const { enhancedAds, foundAds } = processAds(
                        adsData,
                        reviewAdsArray
                    );

                    setAds(enhancedAds);
                    setReviewAds(foundAds);
                } else {
                    // enhancedAds = markReviewAds(ads, reviewAdsArray);
                    const { enhancedAds, foundAds } = processAds(
                        ads,
                        reviewAdsArray
                    );

                    console.log('without exit');

                    setAds(enhancedAds);
                    setReviewAds(foundAds);
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [user]);

    //Выгружаем всю база и оборачиваем при начале сессии
    useEffect(() => {
        if (
            !localStorage.getItem('authToken') &&
            !localStorage.getItem('authEmail')
        ) {
            const fetchAds = async () => {
                setLoading(true);

                try {
                    const data = await TransportAdService.getAllAds();

                    setAds(
                        data.map((ad) => ({
                            ad, // оригинальное объявление
                            isInReviewAds: false, // по умолчанию не в "Вариантах". Позже пропишем проверку, когда сделаем коллекции
                        }))
                    );
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchAds();
        }
    }, []);

    // Прямая выгрузка в объявление без расширения
    // useEffect(() => {
    //     const fetchAds = async () => {
    //         setLoading(true);

    //         try {
    //             const data = await TransportAdService.getAllAds();

    //             setAds(data);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchAds();
    // }, []);

    // выгрузка из тестового файла --->>>
    // useEffect(() => {
    //     const loadAds = async () => {
    //         try {
    //             const adsData = await TransportAdService.getTestAds(); // Получаем данные из сервиса
    //             setAds(adsData);
    //         } catch (err) {
    //             setError(err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     loadAds();
    // }, []);
    //<<<---

    // Функции для добавления, обновления и удаления объявлений
    const addAd = async (adData) => {
        try {
            const newAd = await TransportAdService.createAd(adData);
            setAds((prevAds) => [...prevAds, newAd]);
        } catch (err) {
            setError(err.message);
        }
    };

    const updateAd = async (adId, updatedData) => {
        // Реализуйте логику обновления
    };

    const deleteAd = async (adId) => {
        // Реализуйте логику удаления
    };

    //ReviewAds methods --->>>
    const loadReviewAds = async (userId) => {
        const ads = await UserReviewAdService.getUserReviewAds(userId);
        setReviewAds(ads);
    };

    const addReviewAd = async (extAd) => {
        try {
            // Проверяем, есть ли уже объявление в списке
            if (!reviewAds.some((ad) => ad.ad.adId === extAd.ad.adId)) {
                extAd.isInReviewAds = true;

                setReviewAds((prev) => [...prev, extAd]);

                // Обновляем данные в Firebase для текущего пользователя
                const adId = extAd.ad.adId;

                await UserReviewAdService.addReviewAd(user.userId, adId);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const removeReviewAd = async (extAd) => {
        try {
            extAd.isInReviewAds = false;

            setReviewAds((prev) =>
                prev.filter((ad) => ad.ad.adId !== extAd.ad.adId)
            );

            const adId = extAd.ad.adId;

            await UserReviewAdService.removeReviewAd(user.userId, adId);
        } catch (err) {
            setError(err.message);
        }
    };
    //<<<---

    return (
        <TransportAdContext.Provider
            value={{
                ads,
                loading,
                error,
                addAd,
                updateAd,
                deleteAd,

                reviewAds,
                loadReviewAds,
                addReviewAd,
                removeReviewAd,
            }}
        >
            {children}
        </TransportAdContext.Provider>
    );
};

// Экспортируем контекст
export const useTransportAdContext = () => {
    return useContext(TransportAdContext);
};

export default TransportAdContext;
