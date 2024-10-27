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

    useEffect(() => {
        if (user) {
            const fetchInitialData = async () => {
                setLoading(true);

                try {
                    // Загружаем reviewAds и сохраняем
                    const initialReviewAds =
                        await TransportAdService.getReviewAds(user.userId);

                    // Преобразуем initialReviewAds в массив ключей
                    const reviewAdsArray = initialReviewAds
                        ? Object.keys(initialReviewAds)
                        : [];

                    // Загружаем объявления
                    let enhancedAds;

                    if (ads.length === 0) {
                        const adsData = await TransportAdService.getAllAds();

                        // Назначаем каждому объявлению статус isInReviewAds на основе reviewAds
                        enhancedAds = adsData.map((ad) => ({
                            ad,
                            isInReviewAds: reviewAdsArray.includes(ad.adId),
                        }));
                    } else {
                        enhancedAds = ads.map((ad) => ({
                            ad,
                            isInReviewAds: reviewAdsArray.includes(ad.adId),
                        }));
                    }

                    setAds(() => enhancedAds);

                    const reviewAds = enhancedAds.filter(
                        (extAd) => extAd.isInReviewAds === true
                    );

                    setReviewAds(() => reviewAds);
                } catch (err) {
                    console.error('Ошибка при загрузке данных:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            fetchInitialData();
        }
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
