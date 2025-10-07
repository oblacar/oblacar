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

    // Полные мои заявки — MAP по adId
    // { [adId]: AdTransportationRequest }
    const [myCargoRequests, setMyCargoRequests] = useState({});

    useEffect(() => {
        if (!isAuthenticated || !user?.userId) {
            setSentRequestsStatuses([]);
            setMyCargoRequests({});            // 👈 MAP сбрасываем в пустой объект
            return;
        }

        (async () => {
            setIsLoading(true);
            setError('');
            try {
                // 1) зеркало
                const statuses = await getSentRequestsStatuses(user.userId);
                // обязательно должны иметь ownerId (см. правку сервиса)
                setSentRequestsStatuses(statuses || []);

                // 2) строим полный MAP
                const fullMap = {};
                for (const row of (statuses || [])) {
                    const { adId, ownerId, requestId, status } = row || {};
                    if (!adId || !ownerId || !requestId) {
                        console.warn('[CargoCtx] skip row, missing ids:', row);
                        continue;
                    }
                    const { main, requests } = await getAdCargoRequestsForOwner({ ownerId, adId });
                    if (!main || !Array.isArray(requests)) {
                        console.warn('[CargoCtx] no main/requests for', { ownerId, adId });
                        continue;
                    }
                    const req = requests.find(r => r?.requestId === requestId);
                    if (!req) {
                        console.warn('[CargoCtx] requestId not found in list', { adId, requestId });
                        continue;
                    }
                    fullMap[adId] = toAdTransportationRequest(adId, main, req, status);
                }

                setMyCargoRequests(fullMap);     // 👈 кладём MAP
                console.log('[CargoCtx] bootstrap done. statuses:', (statuses || []).length, 'full:', Object.keys(fullMap).length);
            } catch (e) {
                console.error('[CargoCtx] bootstrap ERROR', e);
                setSentRequestsStatuses([]);
                setMyCargoRequests({});
                setError(e?.message || 'Failed to load my cargo requests');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [isAuthenticated, user?.userId]);

    // =====================================================================
    // helpers
    const toAdTransportationRequest = useCallback((adId, main, req, fallbackStatus) => {
        // main: { departureCity, destinationCity, date|pickupDate, price, paymentUnit, owner{ id,name,photoUrl|photourl,contact } }
        // req:  { requestId, sender{ id,name,photoUrl|photourl,contact }, dateSent, status, description }
        const ownerPhoto = main?.owner?.photoUrl ?? main?.owner?.photourl ?? '';
        const senderPhoto = req?.sender?.photoUrl ?? req?.sender?.photourl ?? '';

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

    // Собираем полный кеш моих заявок по зеркалам статусов
    const refreshMyCargoRequests = useCallback(async () => {
        if (!isAuthenticated || !user?.userId) {
            setMyCargoRequests({});
            setSentRequestsStatuses([]);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // 1) зеркала статусов
            const statuses = await getSentRequestsStatuses(user.userId);
            setSentRequestsStatuses(statuses || []);

            // 2) для каждого статуса достаём main+requests, собираем единый объект
            const map = {};
            for (const row of (statuses || [])) {
                const { adId, ownerId, requestId, status } = row || {};

                if (!adId || !ownerId || !requestId) {

                    console.warn('[CargoCtx] skip status row (missing id):', row);
                    continue;
                }

                const { main, requests } = await getAdCargoRequestsForOwner({ ownerId, adId });
                if (!main || !Array.isArray(requests)) continue;
                const req = requests.find((r) => r?.requestId === requestId);
                if (!req) continue;

                map[adId] = toAdTransportationRequest(adId, main, req, status);
            }
            setMyCargoRequests(map);
        } catch (e) {
            console.error('[CargoRequestsContext] refreshMyCargoRequests ERROR', e);
            setError(e?.message || 'Failed to load my cargo requests');
            setMyCargoRequests({});
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.userId, toAdTransportationRequest]);




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
        if (!isAuthenticated) throw new Error('Не авторизован');
        if (!mainData?.adId || !mainData?.owner?.id) throw new Error('Некорректный mainData');
        if (!request?.sender?.id) throw new Error('Некорректный request.sender');

        // 1) в БД
        const requestId = await addCargoRequest(mainData, request);

        // 2) зеркало статусов (массив)
        setSentRequestsStatuses((prev) => {
            const safe = Array.isArray(prev) ? prev : [];
            const idx = safe.findIndex((x) => x.adId === mainData.adId);
            const row = { adId: mainData.adId, ownerId: mainData.owner.id, status: CargoRequestStatus.Pending, requestId };
            if (idx >= 0) {
                const next = [...safe];
                next[idx] = { ...next[idx], ...row };
                return next;
            }
            return [...safe, row];
        });

        // 3) полный объект в локальный кеш (map)
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
            const map = Array.isArray(prev)
                ? Object.fromEntries((prev || []).map((x) => [x.adId, x]))
                : (prev || {});
            return { ...map, [mainData.adId]: full };
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
            const safe = Array.isArray(prev) ? prev : [];
            const idx = safe.findIndex((x) => x.adId === adId);
            if (idx >= 0) {
                const next = [...safe];
                next[idx] = { ...next[idx], status: CargoRequestStatus.Cancelled, requestId };
                return next;
            }
            return [...safe, { adId, ownerId, status: CargoRequestStatus.Cancelled, requestId }];
        });

        // полный объект (map)
        setMyCargoRequests((prev) => {
            const map = Array.isArray(prev)
                ? Object.fromEntries((prev || []).map((x) => [x.adId, x]))
                : (prev || {});
            const cur = map[adId];
            if (!cur) return map;
            map[adId] = new AdTransportationRequest({
                ...cur,
                requestData: { ...cur.requestData, status: CargoRequestStatus.Cancelled },
            });
            return { ...map };
        });
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
     * (owner-view; отдельный стейт при необходимости)
     */
    const loadAdRequestsForOwner = useCallback(async (adId, ownerId) => {
        setIsLoading(true);
        setError('');
        try {
            await getAdCargoRequestsForOwner({ ownerId, adId });
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
    }, []);

    /**
     * Статус моей заявки по объявлению.
     */
    const getMyRequestStatusForAd = useCallback((adId) => {
        const f = (Array.isArray(sentRequestsStatuses) ? sentRequestsStatuses : []).find((x) => x.adId === adId);
        return f?.status || 'none';
    }, [sentRequestsStatuses]);

    /**
     * Полный объект моей заявки по adId (для RequestStatusBlock).
     * Поддерживает оба хранилища: map ({[adId]: obj}) и array ([obj,...]).
     */
    const getMyCargoRequestByAdId = useCallback((adId) => {
        if (!myCargoRequests) return null;
        if (!Array.isArray(myCargoRequests)) return myCargoRequests[adId] || null; // map
        return myCargoRequests.find((x) => x?.adId === adId) || null;             // fallback
    }, [myCargoRequests]);

    // Удобное представление в виде массива (для списков/отладки)
    const myCargoRequestsList = useMemo(() => {
        if (!myCargoRequests) return [];
        return Array.isArray(myCargoRequests) ? myCargoRequests : Object.values(myCargoRequests);
    }, [myCargoRequests]);

    // =====================================================================
    const value = useMemo(() => ({
        isLoading,
        error,

        // зеркала
        sentRequestsStatuses,

        // мои заявки (полные)
        myCargoRequests,
        myCargoRequestsList,
        getMyCargoRequestByAdId,
        refreshMyCargoRequests,

        // действия
        sendCargoRequest,
        cancelMyCargoRequest,
        restartMyCargoRequest,

        // owner-view
        loadAdRequestsForOwner,
        acceptCargoRequestAsOwner,
        declineCargoRequestAsOwner,

        getMyRequestStatusForAd,
    }), [
        isLoading, error,
        sentRequestsStatuses,
        myCargoRequests, myCargoRequestsList, getMyCargoRequestByAdId, refreshMyCargoRequests,
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
