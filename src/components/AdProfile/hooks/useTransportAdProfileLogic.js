// src/hooks/ad-profile/useTransportAdProfileLogic.js
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';

import TransportAdContext from '../../../hooks/TransportAdContext';
import ConversationContext from '../../../hooks/ConversationContext';
import UserContext from '../../../hooks/UserContext';
import TransportationContext from '../../../hooks/TransportationContext';

import TransportationRequest from '../../../entities/Transportation/TransportationRequest';
import TransportationRequestMainData from '../../../entities/Transportation/TransportationRequestMainData';
import { formatNumber } from '../../../utils/helper';

// utils
const toDMY = (d) => {
    const dt = d instanceof Date ? d : new Date(d || Date.now());
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};
const num = (v, def = 0) => (typeof v === 'number' && !Number.isNaN(v) ? v : def);

const buildSenderFromUser = (u) => ({
    id: u?.userId || u?.id || '',
    name: u?.userName || u?.displayName || u?.name || '',
    photourl: u?.profilePhotoUrl || u?.photoUrl || u?.photoURL || '',
    contact: u?.phone || u?.phoneNumber || u?.userPhone || u?.contact || '',
});

// raw transport ad -> TransportationRequestMainData
const makeTransportMainData = (raw) => {
    if (!raw) return null;
    const adId = raw.adId ?? raw.id ?? null;
    const ownerId = raw.ownerId ?? raw.owner?.id ?? '';

    const date = raw.date ?? raw.availabilityDate ?? '';
    const locationFrom = raw.locationFrom ?? raw.departureCity ?? raw.routeFrom ?? '';
    const locationTo = raw.locationTo ?? raw.destinationCity ?? raw.routeTo ?? '';

    const price = typeof raw.price === 'number' ? raw.price : (raw.priceAndPaymentUnit?.price ?? 0);
    const paymentUnit = raw.paymentUnit ?? raw.priceAndPaymentUnit?.unit ?? raw.currency ?? '';

    const owner = {
        id: ownerId,
        name: raw.owner?.name ?? raw.ownerName ?? '',
        photourl: raw.owner?.photourl ?? raw.ownerPhotoUrl ?? raw.owner?.photoUrl ?? '',
        contact: raw.owner?.contact ?? raw.ownerPhone ?? '',
    };

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

const useTransportAdProfileLogic = ({ ad }) => {
    // contexts
    const {
        addReviewAd: transportAddReview,
        removeReviewAd: transportRemoveReview,
        isReviewed: transportIsReviewed,
    } = useContext(TransportAdContext) || {};

    const {
        currentConversation,
        setCurrentConversationState,
        isConversationsLoaded,
    } = useContext(ConversationContext);

    const { user } = useContext(UserContext);

    const {
        sendTransportationRequest,
        getAdTransportationRequestByAdId,
        adTransportationRequests,
        cancelTransportationRequest,
        restartTransportationRequest,
    } = useContext(TransportationContext);

    // state
    const [isLoading, setIsLoading] = useState(true);
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [isModalBackShow, setIsModalBackShow] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [isInReviewAds, setIsInReviewAds] = useState(false);

    const [cargoDescription, setCargoDescription] = useState('');
    const [adRequestStatus, setAdRequestStatus] = useState('none');
    const [adTransportationRequest, setAdTransportationRequest] = useState(null);
    const [isTransportationRequestSending, setIsTransportationRequestSending] = useState(false);

    // data normalize
    const data = useMemo(() => (ad?.ad && typeof ad.ad === 'object' ? ad.ad : ad), [ad]);

    const owner = useMemo(
        () => ({
            id: data?.ownerId ?? data?.owner?.id ?? null,
            name: data?.ownerName ?? data?.owner?.name ?? 'Пользователь',
            photoUrl: data?.ownerPhotoUrl ?? data?.owner?.photoUrl ?? '',
            rating: data?.ownerRating ?? data?.owner?.rating ?? '',
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
            availabilityDate: data?.availabilityDate ?? data?.date ?? '',
        };
    }, [data]);

    // review toggle
    const handleToggleReviewAd = useCallback(
        async (e) => {
            e?.stopPropagation?.();
            if (!adProps.adId) return;
            try {
                const id = adProps.adId;
                if (isInReviewAds) {
                    if (typeof transportRemoveReview === 'function') await transportRemoveReview(id);
                    setIsInReviewAds(false);
                } else {
                    if (typeof transportAddReview === 'function') await transportAddReview(id);
                    setIsInReviewAds(true);
                }
            } catch (err) {
                console.error('[useTransportAdProfileLogic] toggle review error:', err);
            }
        },
        [adProps.adId, isInReviewAds, transportAddReview, transportRemoveReview]
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

    // requests
    const handleSendRequest = useCallback(async () => {
        console.log('[useTransportAdProfileLogic] SEND click');

        if (typeof sendTransportationRequest !== 'function') {
            console.error('[useTransportAdProfileLogic] sendTransportationRequest not a function');
            return;
        }

        const mainData = makeTransportMainData(data);
        if (!mainData?.adId || !mainData?.owner?.id) {
            console.error('[useTransportAdProfileLogic] missing adId/owner.id', mainData);
            return;
        }

        const sender = buildSenderFromUser(user);
        const request = new TransportationRequest({
            sender,
            dateSent: toDMY(new Date()),
            status: 'pending',
            description: cargoDescription || '',
        });

        try {
            setIsTransportationRequestSending(true);
            const requestId = await sendTransportationRequest(mainData, request);

            // optimistic UI
            let atr = getAdTransportationRequestByAdId?.(mainData.adId) || null;
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
            setAdTransportationRequest(atr);
            setAdRequestStatus(atr.requestData?.status || 'pending');
        } catch (e) {
            console.error('[useTransportAdProfileLogic] send ERROR', e);
        } finally {
            setIsTransportationRequestSending(false);
        }
    }, [data, user, cargoDescription, sendTransportationRequest, getAdTransportationRequestByAdId]);

    const handleCancelRequest = useCallback(async () => {
        const reqId = adTransportationRequest?.requestData?.requestId || adTransportationRequest?.requestId;
        if (!reqId) return;
        try {
            await cancelTransportationRequest(reqId);
            setAdRequestStatus('cancelled');
        } catch (e) {
            console.error('[useTransportAdProfileLogic] cancel ERROR', e);
        }
    }, [adTransportationRequest, cancelTransportationRequest]);

    const handleRestartRequest = useCallback(async () => {
        if (typeof restartTransportationRequest !== 'function') return;
        const mainData = makeTransportMainData(data);
        if (!mainData?.adId || !mainData?.owner?.id) return;

        const sender = buildSenderFromUser(user);
        const request = new TransportationRequest({
            sender,
            dateSent: toDMY(new Date()),
            status: 'pending',
            description: cargoDescription || '',
        });

        try {
            setIsTransportationRequestSending(true);
            await restartTransportationRequest(mainData, request);
            setAdRequestStatus('pending');
        } catch (e) {
            console.error('[useTransportAdProfileLogic] restart ERROR', e);
        } finally {
            setIsTransportationRequestSending(false);
        }
    }, [data, user, cargoDescription, restartTransportationRequest]);

    // effects
    useEffect(() => {
        if (data) setIsLoading(false);
    }, [data]);

    useEffect(() => {
        if (!adProps.adId) return;
        try {
            const val = typeof transportIsReviewed === 'function' ? !!transportIsReviewed(adProps.adId) : false;
            setIsInReviewAds(val);
        } catch { }
    }, [adProps.adId, transportIsReviewed]);

    useEffect(() => {
        if (!adTransportationRequests || !adProps.adId) return;
        const atr = getAdTransportationRequestByAdId(adProps.adId);
        const status = atr?.requestData?.status ?? 'none';
        setAdRequestStatus(status);
        setAdTransportationRequest(atr);
        setIsTransportationRequestSending(false);
    }, [adTransportationRequests, adProps.adId, getAdTransportationRequestByAdId]);

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
        isTransportationRequestSending,
        adRequestStatus,
        adTransportationRequest,
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
        handleSendRequest,
        handleCancelRequest,
        handleRestartRequest,

        // utils
        formatNumber,
    };
};

export default useTransportAdProfileLogic;
