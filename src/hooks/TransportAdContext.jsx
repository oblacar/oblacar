// src/hooks/TransportAd/TransportAdContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import TransportAdService from '../services/TransportAdService';

const TransportAdContext = createContext();

export const TransportAdProvider = ({ children }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    //закоментим подкрузку объявлений из базы. Временно, для отладки.
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

    useEffect(() => {
        const loadAds = async () => {
            try {
                const adsData = await TransportAdService.getTestAds(); // Получаем данные из сервиса
                setAds(adsData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadAds();
    }, []);

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

    return (
        <TransportAdContext.Provider
            value={{ ads, loading, error, addAd, updateAd, deleteAd }}
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
