// src/hooks/TransportAd/TransportAdContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import TransportAdService from '../services/TransportAdService';

const TransportAdContext = createContext();

export const TransportAdProvider = ({ children }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAds = async () => {
            setLoading(true);
            try {
                const data = await TransportAdService.getAllAds();
                setAds(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
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
