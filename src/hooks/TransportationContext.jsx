import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './Authorization/AuthContext';
import TransportationService from '../services/TransportationService';

const TransportationContext = createContext();

export const TransportationProvider = ({ children }) => {
    const { userId, isAuthenticated } = useContext(AuthContext); // Получаем текущего пользователя из AuthContext
    const [adsTransportationRequests, setAdsTransportationRequests] = useState(
        []
    );

    useEffect(() => {
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

        loadUserTransportationRequests();

        return () => {
            clearTransportationRequests(); // Очищаем данные при размонтировании контекста
        };
    }, [userId, isAuthenticated]);

    return (
        <TransportationContext.Provider
            value={{
                adsTransportationRequests,
            }}
        >
            {children}
        </TransportationContext.Provider>
    );
};

export default TransportationContext;
