// src/contexts/CargoRequestsContext.js
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
    addCargoRequest,
    cancelCargoRequest,
    restartCargoRequest,
    acceptCargoRequest,
    declineCargoRequest,
    getSentRequestsStatuses,
    getAdCargoRequestsForOwner,
    CargoRequestStatus,
} from '../services/CargoRequestsService';

// проверь путь до AuthContext
import AuthContext from './Authorization/AuthContext';
import UserContext from './UserContext';

export const CargoRequestsContext = createContext(null);

export function CargoRequestsProvider({ children }) {
    const { isAuthenticated } = useContext(AuthContext); // ожидается user.userId и пр.
    const { user, isUserLoaded, } = useContext(UserContext); // ожидается user.userId и пр.

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // статусы исходящих (водителя) по adId
    const [sentRequestsStatuses, setSentRequestsStatuses] = useState([]); // [{adId, status, requestId}]

    // входящие по конкретному объявлению для владельца груза
    const [currentAdRequests, setCurrentAdRequests] = useState({
        main: null,
        requests: [], // [{requestId, sender{...}, status, message, ...}]
    });

    // ===== Actions =====

    const refreshSentStatuses = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        setError(null);
        try {
            const list = await getSentRequestsStatuses(user?.userId);
            setSentRequestsStatuses(list || []);
        } catch (e) {
            console.error(e);
            setError(e?.message || 'Failed to load statuses');
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId, isAuthenticated]);

    const sendCargoRequest = useCallback(
        async ({ ad, message }) => {
            if (!isAuthenticated) throw new Error('Not authenticated');

            const driver = {
                id: user.userId,
                name: user.userName || '',
                photoUrl: user.userPhoto || '',
                contact: user.userPhone || user.userEmail || '',
            };

            const res = await addCargoRequest({ ad, driver, message });
            // локально апдейтим список статусов
            setSentRequestsStatuses((prev) => {
                const next = [...prev];
                const idx = next.findIndex((x) => x.adId === ad.id);
                const row = { adId: ad.id, status: CargoRequestStatus.Pending, requestId: res.requestId };
                if (idx >= 0) next[idx] = { ...next[idx], ...row };
                else next.push(row);
                return next;
            });
            return res;
        },
        [user?.userId, user?.userName, user?.userPhoto, user?.userPhone, user?.userEmail]
    );

    const cancelMyCargoRequest = useCallback(
        async ({ ownerId, adId, requestId }) => {
            if (!user?.userId) throw new Error('Not authenticated');
            await cancelCargoRequest({ driverId: user.userId, ownerId, adId, requestId });
            setSentRequestsStatuses((prev) => {
                const next = [...prev];
                const idx = next.findIndex((x) => x.adId === adId);
                if (idx >= 0) next[idx] = { ...next[idx], status: CargoRequestStatus.Cancelled, requestId };
                else next.push({ adId, status: CargoRequestStatus.Cancelled, requestId });
                return next;
            });
        },
        [user?.userId]
    );

    const restartMyCargoRequest = useCallback(
        async ({ ad, message }) => {
            if (!user?.userId) throw new Error('Not authenticated');
            const driver = {
                id: user.userId,
                name: user.userName || '',
                photoUrl: user.userPhoto || '',
                contact: user.userPhone || user.userEmail || '',
            };
            const res = await restartCargoRequest({ ad, driver, message });
            setSentRequestsStatuses((prev) => {
                const next = [...prev];
                const idx = next.findIndex((x) => x.adId === ad.id);
                const row = { adId: ad.id, status: CargoRequestStatus.Pending, requestId: res.requestId };
                if (idx >= 0) next[idx] = { ...next[idx], ...row };
                else next.push(row);
                return next;
            });
            return res;
        },
        [user?.userId, user?.userName, user?.userPhoto, user?.userPhone, user?.userEmail]
    );

    // Для владельца груза
    const loadAdRequestsForOwner = useCallback(async (adId, ownerId) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAdCargoRequestsForOwner({ ownerId, adId });
            setCurrentAdRequests(data || { main: null, requests: [] });
        } catch (e) {
            console.error(e);
            setError(e?.message || 'Failed to load ad requests');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const acceptCargoRequestAsOwner = useCallback(async ({ ad, requestId }) => {
        // создаст Transportation, переведёт объявление в work и проставит статусы
        return acceptCargoRequest({ ownerId: ad.ownerId, ad, requestId });
    }, []);

    const declineCargoRequestAsOwner = useCallback(async ({ ownerId, adId, requestId }) => {
        await declineCargoRequest({ ownerId, adId, requestId });
        // перегружаем текущий список
        await loadAdRequestsForOwner(adId, ownerId);
    }, [loadAdRequestsForOwner]);

    // утилита
    const getMyRequestStatusForAd = useCallback(
        (adId) => {
            const f = sentRequestsStatuses.find((x) => x.adId === adId);
            return f?.status || 'none';
        },
        [sentRequestsStatuses]
    );

    // ===== Effects =====
    useEffect(() => {
        if (user?.userId) refreshSentStatuses();
    }, [user?.userId, refreshSentStatuses]);

    const value = useMemo(
        () => ({
            // state
            isLoading,
            error,
            sentRequestsStatuses,
            currentAdRequests,

            // actions
            refreshSentStatuses,
            sendCargoRequest,
            cancelMyCargoRequest,
            restartMyCargoRequest,

            loadAdRequestsForOwner,
            acceptCargoRequestAsOwner,
            declineCargoRequestAsOwner,

            // utils
            getMyRequestStatusForAd,
        }),
        [
            isLoading,
            error,
            sentRequestsStatuses,
            currentAdRequests,
            refreshSentStatuses,
            sendCargoRequest,
            cancelMyCargoRequest,
            restartMyCargoRequest,
            loadAdRequestsForOwner,
            acceptCargoRequestAsOwner,
            declineCargoRequestAsOwner,
            getMyRequestStatusForAd,
        ]
    );

    return (
        <CargoRequestsContext.Provider value={value}>
            {children}
        </CargoRequestsContext.Provider>
    );
}
