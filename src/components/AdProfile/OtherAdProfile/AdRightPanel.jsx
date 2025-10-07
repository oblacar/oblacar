// src/components/AdProfile/AdRightPanel.jsx
import React, { useContext, useMemo, useState, useEffect } from 'react';
import UserSmallCard from '../../common/UserSmallCard/UserSmallCard';
import Button from '../../common/Button/Button';
import Preloader from '../../common/Preloader/Preloader';
import RequestStatusBlock from '../components/AdRequests/RequestStatusBlock';
import { FaEnvelope } from 'react-icons/fa';

// контексты/сущности
import { CargoRequestsContext } from '../../../hooks/CargoRequestsContext';
import UserContext from '../../../hooks/UserContext';
import CargoRequest from '../../../entities/CargoAd/CargoRequest';

// ───────── helpers ─────────
const num = (v, def = 0) => (typeof v === 'number' && !Number.isNaN(v) ? v : def);

const toDMY = (d) => {
    const dt = d instanceof Date ? d : new Date(d || Date.now());
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};

// из UserContext собираем sender
const buildSenderFromUser = (u) => ({
    id: u?.userId || u?.id || '',
    name: u?.userName || u?.displayName || u?.name || '',
    photoUrl: u?.userPhoto || u?.profilePhotoUrl || u?.photoUrl || u?.photoURL || '',
    contact: u?.userPhone || u?.phone || u?.phoneNumber || u?.contact || u?.userEmail || '',
});

// НОРМАЛИЗУЕМ объявление → строгий mainData для сервиса/контекста
const buildCargoMainDataFromAd = (raw) => {
    const adId = raw?.adId ?? raw?.id ?? null;
    const ownerId = raw?.ownerId ?? raw?.owner?.id ?? null;

    return {
        adId,
        departureCity: raw?.route?.from ?? raw?.departureCity ?? raw?.locationFrom ?? raw?.routeFrom ?? '',
        destinationCity: raw?.route?.to ?? raw?.destinationCity ?? raw?.locationTo ?? raw?.routeTo ?? '',
        // ВАЖНО: именно mainData.date (а не pickupDate)
        date: raw?.availabilityFrom ?? raw?.pickupDate ?? raw?.date ?? raw?.availabilityDate ?? toDMY(new Date()),
        price: num(
            typeof raw?.price === 'number' ? raw.price : (raw?.priceAndPaymentUnit?.price ?? Number(raw?.price) ?? 0),
            0
        ),
        paymentUnit: raw?.paymentUnit ?? raw?.priceAndPaymentUnit?.unit ?? raw?.currency ?? '',
        owner: {
            id: ownerId || '',
            name: raw?.owner?.name ?? raw?.ownerName ?? '',
            photoUrl: raw?.owner?.photourl ?? raw?.ownerPhotoUrl ?? raw?.owner?.photoUrl ?? '',
            // фикс опечатки raw.raw?.owner?.contact
            contact: raw?.owner?.contact ?? raw?.ownerPhone ?? '',
        },
    };
};

const AdRightPanel = ({
    adType,            // 'transport' | 'cargo'
    ad,                // ожидаем { adId, ownerId, ... }
    owner,             // { photoUrl, rating, name }
    cargoDescription,
    setCargoDescription,

    // для ТРАНСПОРТА:
    handleStartChat,
    handleSendRequest,
    isTransportationRequestSending,
    adRequestStatus,
    handleCancelRequest,
    handleRestartRequest,

    adTransportationRequest,
}) => {
    const isTransportAd = adType === 'transport';
    const isCargoAd = adType === 'cargo';

    // «Новый запрос» — открыть форму составления
    const [forceComposeCargo, setForceComposeCargo] = useState(false);
    const [forceComposeTransport, setForceComposeTransport] = useState(false);

    const { user } = useContext(UserContext) || {};
    const cargoCtx = useContext(CargoRequestsContext);

    const {
        sendCargoRequest,
        cancelMyCargoRequest,
        // restartMyCargoRequest, // больше не используем тут — «Новый запрос» только открывает форму
        getMyRequestStatusForAd,
        getMyCargoRequestByAdId,   // полный объект моей заявки
        sentRequestsStatuses,      // meta-записи (requestId/status)
        error: cargoError,
        isLoading: cargoCtxLoading,
    } = cargoCtx || {};

    // устойчивые идентификаторы
    const adId = ad?.adId ?? ad?.id ?? null;
    const adOwnerId = ad?.ownerId ?? ad?.owner?.id ?? null;

    // локальная валидация входа
    const [localError, setLocalError] = useState('');
    useEffect(() => {
        if (!ad) {
            console.error('[AdRightPanel] ad is undefined/null');
            setLocalError('Внутренняя ошибка: не передан объект объявления (ad).');
            return;
        }
        if (!adId) {
            console.error('[AdRightPanel] ad.adId is missing. ad =', ad);
            setLocalError('Внутренняя ошибка: в объявлении нет ad.adId.');
            return;
        }
        if (!adOwnerId) {
            console.error('[AdRightPanel] ad.ownerId is missing. ad =', ad);
            setLocalError('Внутренняя ошибка: в объявлении нет ad.ownerId.');
            return;
        }
        setLocalError('');
    }, [ad, adId, adOwnerId]);

    // статус моей заявки (cargo) — строго по adId
    const cargoAdStatus = useMemo(() => {
        if (!isCargoAd || !adId || !getMyRequestStatusForAd) return 'none';
        return getMyRequestStatusForAd(adId);
    }, [isCargoAd, adId, getMyRequestStatusForAd]);

    // ПОЛНЫЙ объект моей заявки (для RequestStatusBlock)
    const myCargoFull = useMemo(() => {
        if (!isCargoAd || !getMyCargoRequestByAdId || !adId) return null;
        return getMyCargoRequestByAdId(adId);
    }, [isCargoAd, getMyCargoRequestByAdId, adId]);

    // мета (зеркало статуса/ID) — на случай, если полного ещё нет
    const myCargoReqMeta = useMemo(() => {
        if (!isCargoAd || !adId || !Array.isArray(sentRequestsStatuses)) return null;
        return sentRequestsStatuses.find((x) => x.adId === adId) || null;
    }, [isCargoAd, adId, sentRequestsStatuses]);

    const [isCargoRequestSending, setIsCargoRequestSending] = useState(false);
    const cargoSending = isCargoRequestSending || cargoCtxLoading;

    // ── TRANSPORT ──
    const handleTransportSendClick = async () => {
        setLocalError('');
        if (!handleSendRequest) {
            console.error('[AdRightPanel] handleSendRequest is missing (transport)');
            setLocalError('Внутренняя ошибка: не передан handleSendRequest.');
            return;
        }
        try {
            await Promise.resolve(handleSendRequest());
            setForceComposeTransport(false);
        } catch (e) {
            console.error('[AdRightPanel] handleSendRequest ERROR', e);
            setLocalError(e?.message || 'Ошибка отправки заявки (transport).');
        }
    };

    // ── CARGO: отправка ──
    const handleSendCargoRequest = async () => {
        setLocalError('');
        if (!isCargoAd) return;
        if (!cargoCtx || !sendCargoRequest) {
            console.error('[AdRightPanel] CargoRequestsContext/sendCargoRequest missing');
            setLocalError('Контекст заявок не инициализирован (cargo).');
            return;
        }

        try {
            setIsCargoRequestSending(true);

            // 1) строгий mainData
            const mainData = buildCargoMainDataFromAd({ ...ad, adId, ownerId: adOwnerId });
            if (!mainData?.adId || !mainData?.owner?.id || !mainData?.date) {
                console.error('[AdRightPanel] CARGO invalid mainData', mainData);
                throw new Error('Некорректные данные объявления (cargo).');
            }

            // 2) строгий request (класс) с sender из UserContext
            const sender = buildSenderFromUser(user);
            const request = new CargoRequest({
                sender,
                dateSent: toDMY(new Date()),
                status: 'pending',
                description: cargoDescription || '',
            });

            // 3) отправляем через контекст
            await sendCargoRequest(mainData, request);

            // скрыть форму и очистить поле
            setForceComposeCargo(false);
            setCargoDescription?.('');
        } catch (e) {
            console.error('[AdRightPanel] CARGO send ERROR', e);
            setLocalError(e?.message || 'Ошибка отправки заявки (cargo).');
        } finally {
            setIsCargoRequestSending(false);
        }
    };

    // ── CARGO: отмена ──
    const handleCancelCargoRequest = async () => {
        setLocalError('');
        if (!cargoCtx || !cancelMyCargoRequest) {
            console.error('[AdRightPanel] cancelMyCargoRequest missing');
            setLocalError('Метод отмены недоступен (cargo).');
            return;
        }
        const requestId = myCargoFull?.requestData?.requestId || myCargoReqMeta?.requestId || '';
        if (!requestId) {
            console.error('[AdRightPanel] requestId missing for cancel');
            setLocalError('Не найден requestId для отмены (cargo).');
            return;
        }
        try {
            await cancelMyCargoRequest({ ownerId: adOwnerId, adId, requestId });
        } catch (e) {
            console.error('[AdRightPanel] CARGO cancel ERROR', e);
            setLocalError(e?.message || 'Ошибка отмены заявки (cargo).');
        }
    };

    // ── CARGO: «Новый запрос» — просто открыть форму (без записи в БД)
    const handleRestartCargoRequest = () => {
        setLocalError('');
        setForceComposeCargo(true);
        setCargoDescription?.('');
    };

    const titleTextTransport = 'Опишите груз и отправьте Перевозчику запрос.';
    const placeholderTransport = 'Описание вашего груза и деталей перевозки.';
    const titleTextCargo = 'Опишите условия и отправьте запрос владельцу груза.';
    const placeholderCargo = 'Ваше предложение по перевозке: цена, дата, маршрут, условия.';

    return (
        <div className='other-ad-profile-owner-data'>
            <UserSmallCard
                photoUrl={owner.photoUrl}
                rating={owner.rating}
                name={owner.name}
                onMessageClick={handleStartChat}
                isLoading={false}
            />

            {isTransportAd ? (
                <div className='other-ad-profile-owner-send-request'>
                    {!isTransportationRequestSending &&
                        (forceComposeTransport || adRequestStatus === 'none' || adRequestStatus === '' ? (
                            <>
                                <strong>{titleTextTransport}</strong>
                                <textarea
                                    placeholder={placeholderTransport}
                                    value={cargoDescription}
                                    onChange={(e) => setCargoDescription(e.target.value)}
                                />
                                <Button type='button' icon={<FaEnvelope />} onClick={handleTransportSendClick}>
                                    Отправить запрос
                                </Button>
                            </>
                        ) : (
                            <RequestStatusBlock
                                status={adRequestStatus}
                                onCancelRequest={handleCancelRequest}
                                onRestartRequest={() => {
                                    setForceComposeTransport(true);
                                    setCargoDescription?.('');
                                }}
                                adTransportationRequest={adTransportationRequest}
                            />
                        ))}

                    {isTransportationRequestSending && (
                        <div className='other-ad-profile-send-request-preloader'><Preloader /></div>
                    )}
                </div>
            ) : isCargoAd ? (
                <div className='other-ad-profile-owner-send-request'>
                    {!cargoSending &&
                        (forceComposeCargo || cargoAdStatus === 'none' || cargoAdStatus === '' ? (
                            <>
                                <strong>{titleTextCargo}</strong>
                                <textarea
                                    placeholder={placeholderCargo}
                                    value={cargoDescription}
                                    onChange={(e) => setCargoDescription(e.target.value)}
                                />
                                <Button type='button' icon={<FaEnvelope />} onClick={handleSendCargoRequest}>
                                    Отправить запрос
                                </Button>
                            </>
                        ) : (
                            <RequestStatusBlock
                                status={cargoAdStatus}
                                onCancelRequest={handleCancelCargoRequest}
                                onRestartRequest={handleRestartCargoRequest}
                                adTransportationRequest={myCargoFull}
                            />
                        ))}

                    {cargoSending && (
                        <div className='other-ad-profile-send-request-preloader'><Preloader /></div>
                    )}

                    {(localError || cargoError) && (
                        <div style={{ color: 'crimson', marginTop: 8 }}>
                            {localError || cargoError}
                        </div>
                    )}
                </div>
            ) : (
                <div className='other-ad-profile-owner-send-request'>
                    <strong>Свяжитесь с автором объявления.</strong>
                </div>
            )}
        </div>
    );
};

export default AdRightPanel;
