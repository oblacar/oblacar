// src/hooks/CargoRequestsContext.js
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

// Стандартизированный объект для UI (унифицирован под RequestStatusBlock)
import AdTransportationRequest from '../entities/Transportation/AdTransportationRequest';

export const CargoRequestsContext = createContext(null);

export function CargoRequestsProvider({ children }) {
    const { isAuthenticated } = useContext(AuthContext);
    const { user } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Зеркало статусов моих отправленных заявок (по adId)
    const [sentRequestsStatuses, setSentRequestsStatuses] = useState([]);

    // Полные мои заявки (для мгновенного UI) — по каждой заявке объект AdTransportationRequest
    const [myCargoRequests, setMyCargoRequests] = useState([]);

    // =====================================================================
    // helpers
    const toAdTransportationRequest = useCallback((adId, main, req, fallbackStatus) => {
        // main: { departureCity, destinationCity, date|pickupDate, price, paymentUnit, owner{ id,name,photoUrl|photourl,contact } }
        // req:  { requestId, sender{ id,name,photoUrl|photourl,contact }, dateSent, status, description }
        const ownerPhoto =
            main?.owner?.photoUrl ?? main?.owner?.photourl ?? '';
        const senderPhoto =
            req?.sender?.photoUrl ?? req?.sender?.photourl ?? '';

        return new AdTransportationRequest({
            adId,
            adData: {
                locationFrom: main?.departureCity || '',
                locationTo: main?.destinationCity || '',
                date: main?.date || main?.pickupDate || '',
                price: Number(main?.price) || 0,
                paymentUnit: main?.paymentUnit || '',
                owner: {
                    id: main?.owner?.id || '',
                    name: main?.owner?.name || '',
                    photoUrl: ownerPhoto,
                    contact: main?.owner?.contact || '',
                },
            },
            requestData: {
                requestId: req?.requestId || '',
                sender: {
                    id: req?.sender?.id || '',
                    name: req?.sender?.name || '',
                    photoUrl: senderPhoto,
                    contact: req?.sender?.contact || '',
                },
                dateSent: req?.dateSent || '',
                status: req?.status || fallbackStatus || CargoRequestStatus.Pending,
                description: req?.description || '',
            },
        });
    }, []);

    // =====================================================================
    // загрузка данных

    const refreshSentStatuses = useCallback(async () => {
        if (!isAuthenticated || !user?.userId) {
            setSentRequestsStatuses([]);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const list = await getSentRequestsStatuses(user.userId);
            setSentRequestsStatuses(list || []);
        } catch (e) {
            console.error('[CargoRequestsContext] refreshSentStatuses ERROR', e);
            setError(e?.message || 'Failed to load statuses');
        } finally {
            setIsLoading(false);
        }
    }, [user?.userId, isAuthenticated]);

    const refreshMyCargoRequests = useCallback(async () => {
        if (!isAuthenticated || !user?.userId) {
            setMyCargoRequests([]);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // 1) сначала зеркала статусов (в них есть ownerId, adId, requestId)
            const statuses = await getSentRequestsStatuses(user.userId);
            setSentRequestsStatuses(statuses || []);

            // 2) для каждого статуса — тянем main+requests и собираем полный объект
            const full = [];
            for (const row of (statuses || [])) {
                const { adId, ownerId, requestId, status } = row || {};
                if (!adId || !ownerId || !requestId) continue;

                const { main, requests } = await getAdCargoRequestsForOwner({ ownerId, adId });
                if (!main || !Array.isArray(requests)) continue;
                const req = requests.find((r) => r?.requestId === requestId);
                if (!req) continue;

                full.push(toAdTransportationRequest(adId, main, req, status));
            }
            setMyCargoRequests(full);
        } catch (e) {
            console.error('[CargoRequestsContext] refreshMyCargoRequests ERROR', e);
            setError(e?.message || 'Failed to load my cargo requests');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.userId, toAdTransportationRequest]);

    // useEffect(() => {
    //     if (!user?.userId) {
    //         setSentRequestsStatuses([]);
    //         setMyCargoRequests([]);
    //         return;
    //     }
    //     // Загружаем статусы + полные заявки при входе пользователя
    //     refreshMyCargoRequests();
    // }, [user?.userId, refreshMyCargoRequests]);


    useEffect(() => {
        if (!isAuthenticated || !user?.userId) {
            setSentRequestsStatuses([]);
            setMyCargoRequests([]);
            return;
        }

        (async () => {
            try {
                console.log('[CargoCtx] mount: user', { userId: user.userId });

                // 1) статусы
                console.log('[CargoCtx] load sent statuses…');
                const statuses = await getSentRequestsStatuses(user.userId);
                console.log('[CargoCtx] sent statuses ←', statuses.length, statuses);
                setSentRequestsStatuses(statuses || []);

                // 2) полные мои заявки
                console.log('[CargoCtx] load my requests…');
                // ⚠️ нужен сервисный метод, который соберёт по mirrors полный объект
                const list = await CargoRequestsService.getMyCargoRequests(user.userId);
                console.log('[CargoCtx] myCargoRequests ←', list.length, list);
                setMyCargoRequests(list || []);
            } catch (e) {
                console.error('[CargoCtx] init ERROR', e);
                setSentRequestsStatuses([]);
                setMyCargoRequests([]);
            }
        })();

        return () => {
            setSentRequestsStatuses([]);
            setMyCargoRequests([]);
        };
    }, [isAuthenticated, user?.userId]);


    // =====================================================================
    // публичные методы

    /**
     * Отправить заявку по грузу.
     * ОЖИДАЕТ СТРОГИЕ объекты:
     *   - mainData: { adId, departureCity, destinationCity, date, price, paymentUnit, owner{ id,name,photourl|photoUrl,contact } }
     *   - request:  { sender{ id,name,photourl|photoUrl,contact }, dateSent, status, description }
     * Возвращает { requestId }.
     */
    const sendCargoRequest = useCallback(async (mainData, request) => {
        console.log(mainData);
        console.log(request);

        if (!isAuthenticated) throw new Error('Не авторизован');
        if (!mainData?.adId || !mainData?.owner?.id) throw new Error('Некорректный mainData');
        if (!request?.sender?.id) throw new Error('Некорректный request.sender');

        // 1) в БД
        const requestId = await addCargoRequest(mainData, request);

        // 2) зеркало статусов
        setSentRequestsStatuses((prev) => {
            const next = [...prev];
            const idx = next.findIndex((x) => x.adId === mainData.adId);
            const row = { adId: mainData.adId, ownerId: mainData.owner.id, status: CargoRequestStatus.Pending, requestId };
            if (idx >= 0) next[idx] = { ...next[idx], ...row };
            else next.push(row);
            return next;
        });

        // 3) полный объект в локальный кеш (для UI)
        const full = toAdTransportationRequest(
            mainData.adId,
            {
                departureCity: mainData.departureCity,
                destinationCity: mainData.destinationCity,
                date: mainData.date,
                price: mainData.price,
                paymentUnit: mainData.paymentUnit,
                owner: {
                    id: mainData.owner.id,
                    name: mainData.owner.name || '',
                    photoUrl: mainData.owner.photoUrl ?? mainData.owner.photourl ?? '',
                    contact: mainData.owner.contact || '',
                },
            },
            {
                requestId,
                sender: {
                    id: request.sender.id,
                    name: request.sender.name || '',
                    photoUrl: request.sender.photoUrl ?? request.sender.photourl ?? '',
                    contact: request.sender.contact || '',
                },
                dateSent: request.dateSent || '',
                status: request.status || CargoRequestStatus.Pending,
                description: request.description || '',
            },
            CargoRequestStatus.Pending
        );

        setMyCargoRequests((prev) => {
            const idx = prev.findIndex((x) => x.adId === mainData.adId);
            if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = full;
                return copy;
            }
            return [...prev, full];
        });

        return { requestId };
    }, [isAuthenticated, toAdTransportationRequest]);

    /**
     * Отмена своей заявки.
     */
    const cancelMyCargoRequest = useCallback(async ({ ownerId, adId, requestId }) => {
        if (!user?.userId) throw new Error('Не авторизован');
        await cancelCargoRequest({ driverId: user.userId, ownerId, adId, requestId });

        // зеркало
        setSentRequestsStatuses((prev) => {
            const next = [...prev];
            const idx = next.findIndex((x) => x.adId === adId);
            if (idx >= 0) next[idx] = { ...next[idx], status: CargoRequestStatus.Cancelled, requestId };
            else next.push({ adId, ownerId, status: CargoRequestStatus.Cancelled, requestId });
            return next;
        });

        // полный объект
        setMyCargoRequests((prev) =>
            prev.map((r) =>
                r.adId === adId
                    ? new AdTransportationRequest({
                        ...r,
                        requestData: { ...r.requestData, status: CargoRequestStatus.Cancelled },
                    })
                    : r
            )
        );
    }, [user?.userId]);

    /**
     * Повторно отправить (создаёт НОВУЮ заявку).
     * ОЖИДАЕТ СТРОГИЕ объекты, как и sendCargoRequest.
     */
    const restartMyCargoRequest = useCallback(async (mainData, request) => {
        if (!isAuthenticated) throw new Error('Не авторизован');
        const { requestId } = await sendCargoRequest(mainData, request); // создаём как новую
        return { requestId };
    }, [isAuthenticated, sendCargoRequest]);

    /**
     * Подтянуть все заявки по объявлению (для владельца груза).
     */
    const loadAdRequestsForOwner = useCallback(async (adId, ownerId) => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getAdCargoRequestsForOwner({ ownerId, adId });
            // это «владелец-режим», кладём как было
            // если нужно — можно держать отдельный стейт для owner-view
        } catch (e) {
            console.error('[CargoRequestsContext] loadAdRequestsForOwner ERROR', e);
            setError(e?.message || 'Failed to load ad requests');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const acceptCargoRequestAsOwner = useCallback(async ({ ad, requestId }) => {
        const res = await acceptCargoRequest({ ownerId: ad.ownerId, ad, requestId });
        return res;
    }, []);

    const declineCargoRequestAsOwner = useCallback(async ({ ownerId, adId, requestId }) => {
        await declineCargoRequest({ ownerId, adId, requestId });
        // можно при желании освежить owner-view
    }, []);

    /**
     * Статус моей заявки по объявлению.
     */
    const getMyRequestStatusForAd = useCallback((adId) => {
        const f = sentRequestsStatuses.find((x) => x.adId === adId);
        return f?.status || 'none';
    }, [sentRequestsStatuses]);

    /**
     * Полный объект моей заявки по adId (для RequestStatusBlock).
     */
    const getMyCargoRequestByAdId = useCallback((adId) => {
        return myCargoRequests.find(x => x.adId === adId) || null;
    }, [myCargoRequests]);

    // =====================================================================
    const value = useMemo(() => ({
        isLoading,
        error,

        // зеркала
        sentRequestsStatuses,

        // мои заявки (полные)
        myCargoRequests,
        getMyCargoRequestByAdId,
        refreshMyCargoRequests,

        // действия
        sendCargoRequest,
        cancelMyCargoRequest,
        restartMyCargoRequest,

        // owner-view (как было)
        loadAdRequestsForOwner,
        acceptCargoRequestAsOwner,
        declineCargoRequestAsOwner,

        getMyRequestStatusForAd,
    }), [
        isLoading, error,
        sentRequestsStatuses,
        myCargoRequests, getMyCargoRequestByAdId, refreshMyCargoRequests,
        sendCargoRequest, cancelMyCargoRequest, restartMyCargoRequest,
        loadAdRequestsForOwner, acceptCargoRequestAsOwner, declineCargoRequestAsOwner,
        getMyRequestStatusForAd,
    ]);

    return (
        <CargoRequestsContext.Provider value={value}>
            {children}
        </CargoRequestsContext.Provider>
    );
}
