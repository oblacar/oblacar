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

    // Догрузка удаленных объявлений в список Вариантов:
    const fetchRemainingReviewAds = async (remainingReviewAds, foundAds) => {
        for (const adId of remainingReviewAds) {
            try {
                const adData = await TransportAdService.getAdById(adId);

                if (adData) {
                    const newExtAd = {
                        ad: adData, // Сохраняем объявление
                        isInReviewAds: true,
                    };

                    foundAds.push(newExtAd); // Добавляем объявление в переданный массив

                    // Удаляем adId из Set
                    remainingReviewAds.delete(adId);
                } else {
                    console.log(
                        'Объявление не найдено или было удалено. id:',
                        adId
                    );
                }
            } catch (error) {
                console.error(
                    `Ошибка при получении объявления с id ${adId}:`,
                    error
                );
            }
        }
    };

    // загрузка объявлений после получения базы отмеченных объявлений:
    //Оптимизированный метод сверки объявлений с отмеченными

    async function processAds(ads, reviewAds) {
        let remainingReviewAds = new Set(reviewAds);
        const enhancedAds = []; // Массив для расширенных объявлений
        const foundAds = []; // Массив для найденных отмеченных объявлений

        const isAdsStructure = (ad) => {
            const requiredKeys = ['isInReviewAds']; // Здесь перечислите нужные ключи

            return requiredKeys.every((key) => ad.hasOwnProperty(key));
        };
        const isAdsExtended = isAdsStructure(ads[0]);

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

        await fetchRemainingReviewAds(remainingReviewAds, foundAds);

        console.log(remainingReviewAds);
        console.log(foundAds);

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
                    const { enhancedAds, foundAds } = await processAds(
                        adsData,
                        reviewAdsArray
                    );

                    setAds(enhancedAds);
                    setReviewAds(foundAds);
                } else {
                    // enhancedAds = markReviewAds(ads, reviewAdsArray);
                    const { enhancedAds, foundAds } = await processAds(
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

    // Функции для добавления, обновления и удаления объявлений/ возвращаем положительно
    const addAd = async (adData) => {
        try {
            console.log(adData);

            const isAdsStructure = (adData) => {
                const requiredKeys = ['isInReviewAds'];
                return requiredKeys.every((key) => adData[key] !== undefined);
            };

            if (isAdsStructure(adData)) {
                const newAd = await TransportAdService.createAd(adData.ad);

                setAds((prevAds) => [...prevAds, newAd]);
            } else {
                const newAd = await TransportAdService.createAd(adData);

                setAds((prevAds) => [
                    ...prevAds,
                    { ad: newAd, isInReviewAds: false },
                ]);
            }

            return true;
        } catch (err) {
            setError(err.message);

            return false;
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
