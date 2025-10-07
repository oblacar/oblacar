// src/hooks/ad-profile/useCargoAdProfileLogic.js
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';

import CargoAdsContext from '../../../hooks/CargoAdsContext';
import ConversationContext from '../../../hooks/ConversationContext';
import UserContext from '../../../hooks/UserContext';
import { CargoRequestsContext } from '../../../hooks/CargoRequestsContext';

import CargoRequest from '../../../entities/CargoAd/CargoRequest';
import CargoRequestMainData from '../../../entities/CargoAd/CargoRequestMainData';
import { formatNumber } from '../../../utils/helper';

// helpers
const num = (v, def = 0) => (typeof v === 'number' && !Number.isNaN(v) ? v : def);

const buildSenderFromUser = (u) => ({
    id: u?.userId || u?.id || '',
    name: u?.userName || u?.displayName || u?.name || '',
    photoUrl: u?.userPhoto || u?.photoUrl || u?.photoURL || '',
    contact: u?.userPhone || u?.phoneNumber || u?.phone || u?.contact || u?.userEmail || '',
});

// raw cargo ad -> CargoRequestMainData
const makeCargoMainData = (raw) => {
    console.log('raw: ');
    console.log(raw);

    if (!raw) return null;


    const adId = raw?.adId ?? raw?.id ?? null;

    const departureCity = raw?.route.from ?? raw?.departureCity ?? raw?.locationFrom ?? raw?.routeFrom ?? raw?.from ?? '';
    const destinationCity = raw?.route.to ?? raw?.destinationCity ?? raw?.locationTo ?? raw?.routeTo ?? raw?.to ?? '';
    const pickupDate = raw?.availabilityFrom
        ?? raw?.pickupDate ?? raw?.date ?? raw?.availabilityDate ?? '';

    // const price = typeof raw?.price === 'number' ? raw.price : (raw?.priceAndPaymentUnit?.price ?? 0);
    const price = raw?.price ?? '';
    const paymentUnit = raw?.paymentUnit ?? raw?.priceAndPaymentUnit?.unit ?? raw?.currency ?? '';

    const ownerId = raw?.ownerId ?? raw?.owner?.id ?? raw?.userId ?? '';
    const ownerName = raw?.ownerName ?? raw?.owner?.name ?? raw?.userName ?? '';
    const ownerPhotoUrl = raw?.ownerPhotoUrl ?? raw?.owner?.photoUrl ?? raw?.userPhoto ?? '';
    const ownerPhone = raw?.ownerPhone ?? raw?.owner?.phone ?? raw?.userPhone ?? '';

    return new CargoRequestMainData({
        adId,
        departureCity,
        destinationCity,
        pickupDate,
        price: num(price),
        paymentUnit,
        owner: {
            id: ownerId,
            name: ownerName,
            photoUrl: ownerPhotoUrl,
            contact: ownerPhone,
        },
    });
};

const useCargoAdProfileLogic = ({ ad }) => {
    // contexts
    const {
        addReviewAd: cargoAddReview,
        removeReviewAd: cargoRemoveReview,
        reviewAds: cargoReviewedIds,
        isReviewed: cargoIsReviewed,
    } = useContext(CargoAdsContext) || {};

    const {
        currentConversation,
        setCurrentConversationState,
        isConversationsLoaded,
    } = useContext(ConversationContext);
    const { user } = useContext(UserContext);

    const {
        sendCargoRequest,            // (mainData: CargoRequestMainData, request: CargoRequest) => Promise<string>
        cancelMyCargoRequest,
        restartMyCargoRequest,       // (mainData, request) => Promise<string>
        getMyRequestStatusForAd,
        sentRequestsStatuses,
    } = useContext(CargoRequestsContext) || {};

    // state
    const [isLoading, setIsLoading] = useState(true);
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [isModalBackShow, setIsModalBackShow] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isInReviewAds, setIsInReviewAds] = useState(false);

    const [cargoDescription, setCargoDescription] = useState('');
    const [adRequestStatus, setAdRequestStatus] = useState('none');

    // data
    const data = useMemo(() => (ad?.ad && typeof ad.ad === 'object' ? ad.ad : ad), [ad]);

    const owner = useMemo(
        () => ({
            id: data?.owner?.id ?? data?.ownerId ?? null,
            name: data?.owner?.name ?? data?.ownerName ?? 'Пользователь',
            photoUrl: data?.owner?.photoUrl ?? data?.ownerPhotoUrl ?? '',
            rating: data?.owner?.rating ?? data?.ownerRating ?? '',
        }),
        [data]
    );

    const adProps = useMemo(() => {
        const adId = data?.adId ?? null;
        const routeFrom = data?.departureCity ?? data?.locationFrom ?? '';
        const routeTo = data?.destinationCity ?? data?.locationTo ?? '';
        const price = data?.price ?? '';
        const paymentUnit = data?.paymentUnit ?? '';
        return {
            adId,
            routeFrom,
            routeTo,
            price,
            paymentUnit,
            pickupDate: data?.pickupDate ?? data?.date ?? '',
            deliveryDate: data?.deliveryDate ?? '',
            title: data?.title ?? '',
        };
    }, [data]);

    // review
    const handleToggleReviewAd = useCallback(
        async (e) => {
            e?.stopPropagation?.();
            if (!adProps.adId) return;
            try {
                const id = adProps.adId;
                if (isInReviewAds) {
                    if (typeof cargoRemoveReview === 'function') await cargoRemoveReview(id);
                    setIsInReviewAds(false);
                } else {
                    if (typeof cargoAddReview === 'function') await cargoAddReview(id);
                    setIsInReviewAds(true);
                }
            } catch (err) {
                console.error('[useCargoAdProfileLogic] toggle review error:', err);
            }
        },
        [adProps.adId, isInReviewAds, cargoAddReview, cargoRemoveReview]
    );

    // chat
    const handleStartChat = useCallback(() => {
        setIsLoadingConversation(true);
        setIsChatBoxOpen(true);
        if (!isConversationsLoaded) setIsModalBackShow(true);
    }, [isConversationsLoaded]);

    const handleCloseModalBack = useCallback(() => {
        setIsModalBackShow(false);
        setIsChatBoxOpen(false);
    }, []);

    // send request (strict DTO)
    const handleSendCargoRequest = useCallback(async () => {
        if (typeof sendCargoRequest !== 'function') {
            console.error('[useCargoAdProfileLogic] sendCargoRequest not a function');
            return;
        }
        const mainData = makeCargoMainData(data);
        if (!mainData?.adId || !mainData?.owner?.id) {
            console.error('[useCargoAdProfileLogic] missing adId/owner.id', mainData);
            return;
        }

        const sender = buildSenderFromUser(user);
        const request = new CargoRequest({
            sender,
            dateSent: new Date().toISOString(),
            status: 'pending',
            description: cargoDescription || '',
        });

        try {
            console.log(mainData);
            console.log(request);

            const requestId = await sendCargoRequest(mainData, request);
            // локально статус сразу
            setAdRequestStatus('pending');
            return requestId;
        } catch (e) {
            console.error('[useCargoAdProfileLogic] send ERROR', e);
        }
    }, [data, user, cargoDescription, sendCargoRequest]);

    const handleCancelCargoRequest = useCallback(async (requestMeta) => {
        // requestMeta: { ownerId, adId, requestId }
        try {
            await cancelMyCargoRequest(requestMeta);
            setAdRequestStatus('cancelled');
        } catch (e) {
            console.error('[useCargoAdProfileLogic] cancel ERROR', e);
        }
    }, [cancelMyCargoRequest]);

    const handleRestartCargoRequest = useCallback(async () => {
        if (typeof restartMyCargoRequest !== 'function') return;

        const mainData = makeCargoMainData(data);
        if (!mainData?.adId || !mainData?.owner?.id) return;

        const sender = buildSenderFromUser(user);
        const request = new CargoRequest({
            sender,
            dateSent: new Date().toISOString(),
            status: 'pending',
            description: cargoDescription || '',
        });

        try {
            await restartMyCargoRequest(mainData, request);
            setAdRequestStatus('pending');
        } catch (e) {
            console.error('[useCargoAdProfileLogic] restart ERROR', e);
        }
    }, [data, user, cargoDescription, restartMyCargoRequest]);

    // effects
    useEffect(() => {
        if (data) setIsLoading(false);
    }, [data]);

    useEffect(() => {
        if (!adProps.adId) return;
        try {
            const val =
                typeof cargoIsReviewed === 'function'
                    ? !!cargoIsReviewed(adProps.adId)
                    : Array.isArray(cargoReviewedIds) && cargoReviewedIds.includes(adProps.adId);
            setIsInReviewAds(val);
        } catch { }
    }, [adProps.adId, cargoIsReviewed, cargoReviewedIds]);

    useEffect(() => {
        if (!adProps.adId || !getMyRequestStatusForAd) return;
        const s = getMyRequestStatusForAd(adProps.adId);
        setAdRequestStatus(s || 'none');
    }, [adProps.adId, sentRequestsStatuses, getMyRequestStatusForAd]);

    useEffect(() => {
        if (!isConversationsLoaded || !isChatBoxOpen || !data) return;
        setCurrentConversationState(adProps.adId, user?.userId, owner.id);
        setIsModalBackShow(false);
    }, [isConversationsLoaded, isChatBoxOpen, adProps.adId, user?.userId, owner.id, setCurrentConversationState, data]);

    useEffect(() => {
        setIsLoadingConversation(false);
    }, [isChatBoxOpen, currentConversation]);

    return {
        // state
        isLoading,
        isChatBoxOpen,
        isModalBackShow,
        isLoadingConversation,
        isInReviewAds,
        isConversationsLoaded,
        adRequestStatus,
        cargoDescription,

        // setters
        setIsChatBoxOpen,
        setCargoDescription,

        // data
        data,
        owner,
        adProps,
        user,

        // handlers
        handleToggleReviewAd,
        handleStartChat,
        handleCloseModalBack,
        handleSendCargoRequest,
        handleCancelCargoRequest,
        handleRestartCargoRequest,

        // utils
        formatNumber,
    };
};

export default useCargoAdProfileLogic;
