// src/hooks/useAdProfileLogic.js (или src/components/AdProfile/useAdProfileLogic.js)

import { useContext, useEffect, useState, useMemo, useCallback } from 'react';

// Контексты
import CargoAdsContext from '../../../hooks/CargoAdsContext';
import TransportAdContext from '../../../hooks/TransportAdContext';
import ConversationContext from '../../../hooks/ConversationContext';
import UserContext from '../../../hooks/UserContext';
import TransportationContext from '../../../hooks/TransportationContext';

// Утилиты
import { formatNumber } from '../../../utils/helper';

/**
 * Кастомный хук для инкапсуляции всей бизнес-логики компонента OtherAdProfile.
 * @param {string} adType - 'cargo' или 'transport'
 * @param {object} ad - объект объявления
 */
const useAdProfileLogic = ({ adType, ad }) => {
    // =================================================================
    // 1. КОНТЕКСТЫ (UseContext & Destructuring)
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

    // --- 4. Запросы на перевозку ---
    const {
        sendTransportationRequest,
        getAdTransportationRequestByAdId,
        adTransportationRequests,
        cancelTransportationRequest,
        restartTransportationRequest,
    } = useContext(TransportationContext);

    // =================================================================
    // 2. СТЕЙТЫ (useState)
    // =================================================================

    const [isLoading, setIsLoading] = useState(true);
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [isModalBackShow, setIsModalBackShow] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isInReviewAds, setIsInReviewAds] = useState(false); // Закладка

    // Запрос перевозчику
    const [cargoDescription, setCargoDescription] = useState('');
    const [adRequestStatus, setAdRequestStatus] = useState('none');
    const [adTransportationRequest, setAdTransportationRequest] =
        useState(null);
    const [isTransportationRequestSending, setIsTransportationRequestSending] =
        useState(false);
    // const [requestId, setRequestId] = useState(null); // requestId можно убрать, т.к. он хранится в adTransportationRequest

    // =================================================================
    // 3. НОРМАЛИЗАЦИЯ И MEMOИЗИРОВАННЫЕ ДАННЫЕ (useMemo)
    // =================================================================

    const data = useMemo(() => {
        return ad?.ad && typeof ad.ad === 'object' ? ad.ad : ad;
    }, [ad]);

    // 1) Владелец
    const owner = useMemo(() => {
        // Логика извлечения owner (осталась прежней)
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
        // Логика извлечения adProps (осталась прежней)
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
        // Логика унификации Review API (см. предыдущее сообщение)
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
    // 4. ОБРАБОТЧИКИ (useCallback)
    // =================================================================

    // Обработчик кнопки "Варианты" (Bookmark)
    const handleToggleReviewAd = useCallback(
        async (e) => {
            // Логика осталась прежней, но использует adProps.adId
            e?.stopPropagation?.();
            if (!adProps.adId) return;

            try {
                const id = adProps.adId;
                const api = reviewApi;
                if (isInReviewAds) {
                    if (typeof api.remove === 'function') await api.remove(id);
                    else if (typeof api.toggle === 'function')
                        await api.toggle(id);
                    setIsInReviewAds(false);
                } else {
                    if (typeof api.add === 'function') await api.add(id);
                    else if (typeof api.toggle === 'function')
                        await api.toggle(id);
                    setIsInReviewAds(true);
                }
            } catch (err) {
                console.error('[useAdProfileLogic] toggle review error:', err);
            }
        },
        [adProps.adId, isInReviewAds, reviewApi]
    );

    // Обработчики (чат)
    const handleStartChat = useCallback(() => {
        setIsLoadingConversation(true);
        setIsChatBoxOpen(true);
        if (!isConversationsLoaded) setIsModalBackShow(true);
    }, [isConversationsLoaded]);

    const handleCloseModalBack = useCallback(() => {
        setIsModalBackShow(false);
        setIsChatBoxOpen(false);
    }, []);

    // Обработчики (заявка перевозчику — ТОЛЬКО ТРАНСПОРТ)
    // Имплементация должна быть перенесена сюда.
    const handleSendRequest = useCallback(async () => {
        // ... ваша логика handleSendRequest ...
    }, [
        adProps.adId,
        user?.userId,
        owner.id,
        cargoDescription,
        sendTransportationRequest,
        setIsTransportationRequestSending,
    ]);

    const handleCancelRequest = useCallback(async () => {
        // ... ваша логика handleCancelRequest ...
    }, [adTransportationRequest, cancelTransportationRequest]);

    const handleRestartRequest = useCallback(async () => {
        // ... ваша логика handleRestartRequest ...
    }, [adTransportationRequest, restartTransportationRequest]);

    // =================================================================
    // 5. ЭФФЕКТЫ (useEffect)
    // =================================================================

    // 5.1. Первичная загрузка
    useEffect(() => {
        if (data) setIsLoading(false);
    }, [data]);

    // 5.2. Инициализация/Синхронизация закладки
    useEffect(() => {
        if (!adProps.adId) return;
        // Логика осталась прежней
        try {
            const val =
                typeof reviewApi.isReviewed === 'function'
                    ? !!reviewApi.isReviewed(adProps.adId)
                    : Array.isArray(reviewApi.reviewedIds) &&
                      reviewApi.reviewedIds.includes(adProps.adId);
            setIsInReviewAds(val);
        } catch {
            /* молча */
        }
    }, [adProps.adId, reviewApi.isReviewed, reviewApi.reviewedIds]);

    // 5.3. Статусы запросов (ТОЛЬКО ДЛЯ ТРАНСПОРТА)
    useEffect(() => {
        // Логика осталась прежней
        if (
            adType !== 'transport' ||
            !adTransportationRequests ||
            !adProps.adId
        )
            return;

        const atr = getAdTransportationRequestByAdId(adProps.adId);
        let status = 'none';

        if (atr?.requestData) {
            status = atr.requestData.status ?? 'none';
        }

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
        // порядок: (adId, currentUserId, otherUserId)
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
    // 6. ВОЗВРАТ ДАННЫХ И МЕТОДОВ
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
        adProps, // Содержит adId, routeFrom, routeTo, price и т.д.
        user,

        // Обработчики
        handleToggleReviewAd,
        handleStartChat,
        handleCloseModalBack,
        handleSendRequest,
        handleCancelRequest,
        handleRestartRequest,

        // Дополнительные данные
        formatNumber, // Полезная утилита
    };
};

export default useAdProfileLogic;
