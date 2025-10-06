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
import AuthContext from './Authorization/AuthContext';
import UserContext from './UserContext';

export const CargoRequestsContext = createContext(null);

export function CargoRequestsProvider({ children }) {
    const { isAuthenticated } = useContext(AuthContext);
    const { user } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [sentRequestsStatuses, setSentRequestsStatuses] = useState([]);
    const [currentAdRequests, setCurrentAdRequests] = useState({ main: null, requests: [] });

    const refreshSentStatuses = useCallback(async () => {
        if (!isAuthenticated) {
            console.warn('[CargoRequestsContext] refreshSentStatuses: no user');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            console.log('[CargoRequestsContext] getSentRequestsStatuses for', user.userId);
            const list = await getSentRequestsStatuses(user.userId);
            console.log('[CargoRequestsContext] statuses →', list);
            setSentRequestsStatuses(list || []);
        } catch (e) {
            console.error('[CargoRequestsContext] refreshSentStatuses ERROR', e);
            setError(e?.message || 'Failed to load statuses');
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId, isAuthenticated]);

    const sendCargoRequest = useCallback(async ({ ad, message }) => {
        if (!isAuthenticated) throw new Error('Не авторизован');
        if (!ad?.id || !ad?.ownerId) throw new Error('Нет ad.id или ad.ownerId');

        console.log('[CargoRequestsContext] addCargoRequest →', { adId: ad.id, ownerId: ad.ownerId, driverId: user.userId, message });
        const res = await addCargoRequest({
            ad,
            driver: {
                id: user.userId,
                name: user.userName || '',
                photoUrl: user.userPhoto || '',
                contact: user.userPhone || user.userEmail || '',
            },
            message,
        });
        console.log('[CargoRequestsContext] addCargoRequest DONE →', res);

        setSentRequestsStatuses((prev) => {
            const next = [...prev];
            const idx = next.findIndex((x) => x.adId === ad.id);
            const row = { adId: ad.id, status: CargoRequestStatus.Pending, requestId: res.requestId };
            if (idx >= 0) next[idx] = { ...next[idx], ...row };
            else next.push(row);
            return next;
        });

        return res;
    }, [user?.userId, user?.userName, user?.userPhoto, user?.userPhone, user?.userEmail, isAuthenticated]);

    const cancelMyCargoRequest = useCallback(async ({ ownerId, adId, requestId }) => {
        if (!user?.userId) throw new Error('Не авторизован');
        console.log('[CargoRequestsContext] cancelCargoRequest →', { driverId: user.userId, ownerId, adId, requestId });
        await cancelCargoRequest({ driverId: user.userId, ownerId, adId, requestId });
        console.log('[CargoRequestsContext] cancelCargoRequest DONE');

        setSentRequestsStatuses((prev) => {
            const next = [...prev];
            const idx = next.findIndex((x) => x.adId === adId);
            if (idx >= 0) next[idx] = { ...next[idx], status: CargoRequestStatus.Cancelled, requestId };
            else next.push({ adId, status: CargoRequestStatus.Cancelled, requestId });
            return next;
        });
    }, [user?.userId]);

    const restartMyCargoRequest = useCallback(async ({ ad, message }) => {
        if (!isAuthenticated) throw new Error('Не авторизован');
        console.log('[CargoRequestsContext] restartCargoRequest →', { adId: ad.id, ownerId: ad.ownerId, driverId: user.userId, message });
        const res = await restartCargoRequest({
            ad,
            driver: {
                id: user.userId,
                name: user.userName || '',
                photoUrl: user.userPhoto || '',
                contact: user.userPhone || user.userEmail || '',
            },
            message,
        });
        console.log('[CargoRequestsContext] restartCargoRequest DONE →', res);

        setSentRequestsStatuses((prev) => {
            const next = [...prev];
            const idx = next.findIndex((x) => x.adId === ad.id);
            const row = { adId: ad.id, status: CargoRequestStatus.Pending, requestId: res.requestId };
            if (idx >= 0) next[idx] = { ...next[idx], ...row };
            else next.push(row);
            return next;
        });

        return res;
    }, [user?.userId, user?.userName, user?.userPhoto, user?.userPhone, user?.userEmail]);

    const loadAdRequestsForOwner = useCallback(async (adId, ownerId) => {
        setIsLoading(true);
        setError('');
        try {
            console.log('[CargoRequestsContext] getAdCargoRequestsForOwner →', { adId, ownerId });
            const data = await getAdCargoRequestsForOwner({ ownerId, adId });
            console.log('[CargoRequestsContext] currentAdRequests ←', data);
            setCurrentAdRequests(data || { main: null, requests: [] });
        } catch (e) {
            console.error('[CargoRequestsContext] loadAdRequestsForOwner ERROR', e);
            setError(e?.message || 'Failed to load ad requests');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const acceptCargoRequestAsOwner = useCallback(async ({ ad, requestId }) => {
        console.log('[CargoRequestsContext] acceptCargoRequest →', { adId: ad.id, ownerId: ad.ownerId, requestId });
        const res = await acceptCargoRequest({ ownerId: ad.ownerId, ad, requestId });
        console.log('[CargoRequestsContext] acceptCargoRequest DONE →', res);
        return res;
    }, []);

    const declineCargoRequestAsOwner = useCallback(async ({ ownerId, adId, requestId }) => {
        console.log('[CargoRequestsContext] declineCargoRequest →', { ownerId, adId, requestId });
        await declineCargoRequest({ ownerId, adId, requestId });
        await loadAdRequestsForOwner(adId, ownerId);
    }, [loadAdRequestsForOwner]);

    const getMyRequestStatusForAd = useCallback((adId) => {
        const f = sentRequestsStatuses.find((x) => x.adId === adId);
        return f?.status || 'none';
    }, [sentRequestsStatuses]);

    useEffect(() => {
        if (user?.userId) refreshSentStatuses();
    }, [user?.userId, refreshSentStatuses]);

    const value = useMemo(() => ({
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
    }), [
        isLoading, error, sentRequestsStatuses, currentAdRequests,
        refreshSentStatuses, sendCargoRequest, cancelMyCargoRequest, restartMyCargoRequest,
        loadAdRequestsForOwner, acceptCargoRequestAsOwner, declineCargoRequestAsOwner,
        getMyRequestStatusForAd,
    ]);

    return (
        <CargoRequestsContext.Provider value={value}>
            {children}
        </CargoRequestsContext.Provider>
    );
}
