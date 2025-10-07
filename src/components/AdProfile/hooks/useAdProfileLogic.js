// src/hooks/useAdProfileLogic.js (или src/components/AdProfile/useAdProfileLogic.js)

import { useContext, useEffect, useState, useMemo, useCallback } from 'react';

// Контексты
import CargoAdsContext from '../../../hooks/CargoAdsContext';
import TransportAdContext from '../../../hooks/TransportAdContext';
import ConversationContext from '../../../hooks/ConversationContext';
import UserContext from '../../../hooks/UserContext';
import TransportationContext from '../../../hooks/TransportationContext';

import TransportationRequest from '../../../entities/Transportation/TransportationRequest';
import TransportationRequestMainData from '../../../entities/Transportation/TransportationRequestMainData';

// Утилиты
import { formatNumber } from '../../../utils/helper';

// ===== helpers =====
const toDMY = (d) => {
    const dt = d instanceof Date ? d : new Date(d || Date.now());
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};

const num = (v, def = 0) =>
    typeof v === 'number' && !Number.isNaN(v) ? v : def;

// Формируем sender из UserContext под ключи, которые ждёт БД/классы
const buildSenderFromUser = (u) => ({
    id: u?.userId || u?.id || '',
    name: u?.userName || u?.displayName || u?.name || '',
    photourl: u?.profilePhotoUrl || u?.photoUrl || u?.photoURL || '',
    contact: u?.phone || u?.phoneNumber || u?.userPhone || u?.contact || '',
});

// Нормализуем сырое объявление транспорта → экземпляр TransportationRequestMainData
const makeTransportMainData = (raw) => {
    if (!raw) return null;
    const adId = raw.adId ?? raw.id ?? null;
    const ownerId = raw.ownerId ?? raw.owner?.id ?? '';

    const date =
        raw.date ??
        raw.availabilityDate ??
        '';

    const locationFrom =
        raw.locationFrom ??
        raw.departureCity ??
        raw.routeFrom ??
        '';

    const locationTo =
        raw.locationTo ??
        raw.destinationCity ??
        raw.routeTo ??
        '';

    const price =
        typeof raw.price === 'number'
            ? raw.price
            : (raw.priceAndPaymentUnit?.price ?? 0);

    const paymentUnit =
        raw.paymentUnit ??
        raw.priceAndPaymentUnit?.unit ??
        raw.currency ??
        '';

    const owner = {
        id: ownerId,
        name: raw.owner?.name ?? raw.ownerName ?? '',
        photourl: raw.owner?.photourl ?? raw.ownerPhotoUrl ?? raw.owner?.photoUrl ?? '',
        contact: raw.owner?.contact ?? raw.ownerPhone ?? '',
    };

    // Создаём именно КЛАСС mainData
    return new TransportationRequestMainData({
        adId,
        locationFrom,
        locationTo,
        date,
        price: num(price),
        paymentUnit,
        owner,
    });
};

/**
 * Кастомный хук для инкапсуляции всей бизнес-логики компонента OtherAdProfile.
 * @param {string} adType - 'cargo' или 'transport'
 * @param {object} ad - объект объявления
 */
const useAdProfileLogic = ({ adType, ad }) => {
    // =================================================================
    // 1. КОНТЕКСТЫ
    // =================================================================

    // --- 1. Контекст ГРУЗОВ ---
    const {
        addReviewAd: cargoAddReview,
        removeReviewAd: cargoRemoveReview,
        reviewAds: cargoReviewedIds,
        isReviewed: cargoIsReviewed,
    } = useContext(CargoAdsContext) || {};

    // --- 2. Контекст ТРАНСПОРТА ---
    const {
        addReviewAd: transportAddReview,
        removeReviewAd: transportRemoveReview,
        isReviewed: transportIsReviewed,
    } = useContext(TransportAdContext) || {};

    // --- 3. Чат и Пользователь ---
    const {
        currentConversation,
        setCurrentConversationState,
        isConversationsLoaded,
    } = useContext(ConversationContext);
    const { user } = useContext(UserContext);

    // --- 4. Запросы на перевозку (ТРАНСПОРТ) ---
    const {
        sendTransportationRequest,
        getAdTransportationRequestByAdId,
        adTransportationRequests,
        cancelTransportationRequest,
        restartTransportationRequest,
    } = useContext(TransportationContext);

    // =================================================================
    // 2. СТЕЙТЫ
    // =================================================================

    const [isLoading, setIsLoading] = useState(true);
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [isModalBackShow, setIsModalBackShow] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isInReviewAds, setIsInReviewAds] = useState(false); // Закладка

    // Заявки
    const [cargoDescription, setCargoDescription] = useState('');
    const [adRequestStatus, setAdRequestStatus] = useState('none');
    const [adTransportationRequest, setAdTransportationRequest] = useState(null);
    const [isTransportationRequestSending, setIsTransportationRequestSending] =
        useState(false);

    // =================================================================
    // 3. НОРМАЛИЗАЦИЯ / MEMO
    // =================================================================

    const data = useMemo(() => {
        return ad?.ad && typeof ad.ad === 'object' ? ad.ad : ad;
    }, [ad]);

    // 1) Владелец
    const owner = useMemo(() => {
        return adType === 'cargo'
            ? {
                id: data?.owner?.id ?? data?.ownerId ?? null,
                name: data?.owner?.name ?? data?.ownerName ?? 'Пользователь',
                photoUrl: data?.owner?.photoUrl ?? data?.ownerPhotoUrl ?? '',
                rating: data?.owner?.rating ?? data?.ownerRating ?? '',
            }
            : {
                id: data?.ownerId ?? null,
                name: data?.ownerName ?? 'Пользователь',
                photoUrl: data?.ownerPhotoUrl ?? '',
                rating: data?.ownerRating ?? '',
            };
    }, [data, adType]);

    // 2) Поля объявления
    const adProps = useMemo(() => {
        const adId = data?.adId ?? null;
        const routeFrom = data?.departureCity ?? '';
        const routeTo = data?.destinationCity ?? '';
        const price = data?.price ?? '';
        const paymentUnit = data?.paymentUnit ?? '';
        const title = adType === 'cargo' ? data?.title ?? '' : '';

        return {
            adId,
            routeFrom,
            routeTo,
            price,
            paymentUnit,
            title,
            availabilityDate:
                adType === 'transport'
                    ? data?.availabilityDate ?? ''
                    : data?.pickupDate ?? '',
            pickupDate: adType === 'cargo' ? data?.pickupDate ?? '' : '',
            deliveryDate: adType === 'cargo' ? data?.deliveryDate ?? '' : '',
        };
    }, [data, adType]);

    // 3) Review API (Закладки)
    const reviewApi = useMemo(() => {
        if (adType === 'transport') {
            return {
                add: transportAddReview,
                remove: transportRemoveReview,
                toggle: transportAddReview || transportRemoveReview,
                isReviewed: transportIsReviewed,
                reviewedIds: undefined,
            };
        }
        return {
            add: cargoAddReview,
            remove: cargoRemoveReview,
            toggle: cargoAddReview || cargoRemoveReview,
            isReviewed: cargoIsReviewed,
            reviewedIds: cargoReviewedIds,
        };
    }, [
        adType,
        cargoAddReview,
        cargoRemoveReview,
        cargoIsReviewed,
        cargoReviewedIds,
        transportAddReview,
        transportRemoveReview,
        transportIsReviewed,
    ]);

    // =================================================================
    // 4. ОБРАБОТЧИКИ
    // =================================================================

    // Bookmark
    const handleToggleReviewAd = useCallback(
        async (e) => {
            e?.stopPropagation?.();
            if (!adProps.adId) return;

            try {
                const id = adProps.adId;
                const api = reviewApi;
                if (isInReviewAds) {
                    if (typeof api.remove === 'function') await api.remove(id);
                    else if (typeof api.toggle === 'function') await api.toggle(id);
                    setIsInReviewAds(false);
                } else {
                    if (typeof api.add === 'function') await api.add(id);
                    else if (typeof api.toggle === 'function') await api.toggle(id);
                    setIsInReviewAds(true);
                }
            } catch (err) {
                console.error('[useAdProfileLogic] toggle review error:', err);
            }
        },
        [adProps.adId, isInReviewAds, reviewApi]
    );

    // Чат
    const handleStartChat = useCallback(() => {
        setIsLoadingConversation(true);
        setIsChatBoxOpen(true);
        if (!isConversationsLoaded) setIsModalBackShow(true);
    }, [isConversationsLoaded]);

    const handleCloseModalBack = useCallback(() => {
        setIsModalBackShow(false);
        setIsChatBoxOpen(false);
    }, []);

    // ======== Заявка перевозчику (ТРАНСПОРТ) ========
    const handleSendRequest = useCallback(async () => {
        if (adType !== 'transport') return;

        console.log('[useAdProfileLogic] TRANSPORT/SEND click', {
            adRawKeys: Object.keys(data || {}),
            adRaw: data,
            hasCtxMethod: typeof sendTransportationRequest === 'function',
        });

        if (typeof sendTransportationRequest !== 'function') {
            console.error('[useAdProfileLogic] sendTransportationRequest is not a function (TransportationContext?)');
            return;
        }

        // 1) MainData (экземпляр класса)
        const mainData = makeTransportMainData(data);
        console.log('[useAdProfileLogic] TRANSPORT mainData →', mainData);

        if (!mainData?.adId || !mainData?.owner?.id) {
            console.error('[useAdProfileLogic] TRANSPORT: missing adId/owner.id', mainData);
            return;
        }

        // 2) Request (экземпляр класса)
        const sender = buildSenderFromUser(user);
        const request = new TransportationRequest({
            // requestId генерирует сервис
            sender,
            dateSent: toDMY(new Date()),           // формат dd.mm.yyyy
            status: 'pending',
            dateConfirmed: null,
            description: cargoDescription || '',
        });

        console.log('[useAdProfileLogic] TRANSPORT request(class) →', request);

        try {
            setIsTransportationRequestSending(true);

            const requestId = await sendTransportationRequest(mainData, request);

            // Попытка сразу взять из контекста (он уже setState-нул)
            let atr = getAdTransportationRequestByAdId?.(mainData.adId) || null;

            // Если контекст ещё не успел — делаем локальный «эхо»-объект
            if (!atr) {
                atr = {
                    adId: mainData.adId,
                    adData: {
                        locationFrom: mainData.locationFrom,
                        locationTo: mainData.locationTo,
                        date: mainData.date,
                        price: mainData.price,
                        paymentUnit: mainData.paymentUnit,
                        owner: mainData.owner,
                    },
                    requestData: {
                        requestId,
                        sender: request.sender,
                        dateSent: request.dateSent,
                        status: 'pending',
                        description: request.description,
                    },
                };
            }

            // Обновляем локальный UI немедленно
            setAdTransportationRequest(atr);
            setAdRequestStatus(atr.requestData?.status || 'pending');

            console.log('[useAdProfileLogic] TRANSPORT send OK →', requestId);
        } catch (e) {
            console.error('[useAdProfileLogic] TRANSPORT send ERROR', e);
        } finally {
            setIsTransportationRequestSending(false);
        }
    }, [adType, data, user, cargoDescription, sendTransportationRequest]);

    const handleCancelRequest = useCallback(async () => {
        if (adType !== 'transport') return;

        const reqId =
            adTransportationRequest?.requestData?.requestId ||
            adTransportationRequest?.requestId;

        console.log('[useAdProfileLogic] TRANSPORT/CANCEL click', {
            hasCtxMethod: typeof cancelTransportationRequest === 'function',
            reqId,
            adTransportationRequest,
        });

        if (typeof cancelTransportationRequest !== 'function') {
            console.error('[useAdProfileLogic] cancelTransportationRequest is not a function');
            return;
        }
        if (!reqId) {
            console.error('[useAdProfileLogic] no requestId for cancel');
            return;
        }

        try {
            await cancelTransportationRequest(reqId);
            console.log('[useAdProfileLogic] TRANSPORT cancel OK');
            setAdRequestStatus('cancelled');
        } catch (e) {
            console.error('[useAdProfileLogic] TRANSPORT cancel ERROR', e);
        }
    }, [adType, adTransportationRequest, cancelTransportationRequest]);

    const handleRestartRequest = useCallback(async () => {
        if (adType !== 'transport') return;

        console.log('[useAdProfileLogic] TRANSPORT/RESTART click', {
            hasCtxMethod: typeof restartTransportationRequest === 'function',
            cargoDescription,
        });

        if (typeof restartTransportationRequest !== 'function') {
            console.error('[useAdProfileLogic] restartTransportationRequest is not a function');
            return;
        }

        const mainData = makeTransportMainData(data);
        if (!mainData?.adId || !mainData?.owner?.id) {
            console.error('[useAdProfileLogic] TRANSPORT restart: missing adId/owner.id', mainData);
            return;
        }

        const sender = buildSenderFromUser(user);
        const request = new TransportationRequest({
            sender,
            dateSent: toDMY(new Date()),
            status: 'pending',
            dateConfirmed: null,
            description: cargoDescription || '',
        });

        try {
            setIsTransportationRequestSending(true);
            // повторно создаём заявку тем же способом
            const res = await restartTransportationRequest(mainData, request);
            console.log('[useAdProfileLogic] TRANSPORT restart OK →', res);
            setAdRequestStatus('pending');
        } catch (e) {
            console.error('[useAdProfileLogic] TRANSPORT restart ERROR', e);
        } finally {
            setIsTransportationRequestSending(false);
        }
    }, [adType, data, user, cargoDescription, restartTransportationRequest]);

    // =================================================================
    // 5. ЭФФЕКТЫ
    // =================================================================

    // 5.1. Первичная загрузка
    useEffect(() => {
        if (data) setIsLoading(false);
    }, [data]);

    // 5.2. Инициализация/Синхронизация закладки
    useEffect(() => {
        if (!adProps.adId) return;
        try {
            const val =
                typeof reviewApi.isReviewed === 'function'
                    ? !!reviewApi.isReviewed(adProps.adId)
                    : Array.isArray(reviewApi.reviewedIds) &&
                    reviewApi.reviewedIds.includes(adProps.adId);
            setIsInReviewAds(val);
        } catch {
            /* noop */
        }
    }, [adProps.adId, reviewApi.isReviewed, reviewApi.reviewedIds]);

    // 5.3. Статусы запросов (ТОЛЬКО ДЛЯ ТРАНСПОРТА)
    useEffect(() => {
        if (adType !== 'transport' || !adTransportationRequests || !adProps.adId) return;

        const atr = getAdTransportationRequestByAdId(adProps.adId);
        let status = 'none';
        if (atr?.requestData) status = atr.requestData.status ?? 'none';

        console.log('[useAdProfileLogic] TRANSPORT status sync', {
            adId: adProps.adId,
            found: !!atr,
            status,
            atr,
        });

        setAdRequestStatus(status);
        setAdTransportationRequest(atr);
        setIsTransportationRequestSending(false);
    }, [
        adTransportationRequests,
        adType,
        adProps.adId,
        getAdTransportationRequestByAdId,
    ]);

    // 5.4. Чат-привязка
    useEffect(() => {
        if (!isConversationsLoaded || !isChatBoxOpen || !data) return;
        setCurrentConversationState(adProps.adId, user?.userId, owner.id);
        setIsModalBackShow(false);
    }, [
        isConversationsLoaded,
        isChatBoxOpen,
        adProps.adId,
        user?.userId,
        owner.id,
        setCurrentConversationState,
        data,
    ]);

    // 5.5. Загрузка разговора
    useEffect(() => {
        setIsLoadingConversation(false);
    }, [isChatBoxOpen, currentConversation]);

    // =================================================================
    // 6. ВОЗВРАТ
    // =================================================================
    return {
        // Состояния
        isLoading,
        isChatBoxOpen,
        isModalBackShow,
        isLoadingConversation,
        isInReviewAds,
        isConversationsLoaded,
        isTransportationRequestSending,
        adRequestStatus,
        adTransportationRequest,
        cargoDescription,

        // Сеттеры
        setIsChatBoxOpen,
        setCargoDescription,

        // Данные
        adType,
        data,
        owner,
        adProps, // adId, routeFrom, routeTo, price, и т.д.
        user,

        // Обработчики
        handleToggleReviewAd,
        handleStartChat,
        handleCloseModalBack,
        handleSendRequest,
        handleCancelRequest,
        handleRestartRequest,

        // Доп. утилиты
        formatNumber,
    };
};

export default useAdProfileLogic;
