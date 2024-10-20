// TransportContext.js
import React, { createContext, useState } from 'react';
import TransportService from '../services/TransportService';
import TransportAdService from '../services/TransportAdService';

// Создание контекста
const TransportContext = createContext();

export const TransportProvider = ({ children }) => {
    const [transports, setTransports] = useState([]);

    const fetchTransports = async () => {
        const trucks = await TransportService.fetchTrucks();
        setTransports(trucks);
    };

    const createTransportAd = async (adData) => {
        const result = await TransportAdService.createTransportAd(adData);
        // Обработка успешного создания объявления (например, обновление состояния или уведомление пользователя)
        return result;
    };

    return (
        <TransportContext.Provider
            value={{ transports, fetchTransports, createTransportAd }}
        >
            {children}
        </TransportContext.Provider>
    );
};

export default TransportContext;
