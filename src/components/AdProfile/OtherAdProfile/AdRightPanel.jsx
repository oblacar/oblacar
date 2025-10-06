// src/components/AdProfile/AdRightPanel.jsx
import React, { useContext, useMemo, useState, useEffect } from 'react';
import UserSmallCard from '../../common/UserSmallCard/UserSmallCard';
import Button from '../../common/Button/Button';
import Preloader from '../../common/Preloader/Preloader';
import RequestStatusBlock from '../components/AdRequests/RequestStatusBlock';
import { FaEnvelope } from 'react-icons/fa';

// ВАЖНО: путь такой, как у тебя в примере
import { CargoRequestsContext } from '../../../hooks/CargoRequestsContext';

const AdRightPanel = ({
    adType,            // 'transport' | 'cargo'
    ad,                // ОЖИДАЕМ: { adId: string, ownerId: string, ... }
    owner,             // { photoUrl, rating, name }
    cargoDescription,
    setCargoDescription,

    // для объявлений ТРАНСПОРТА (как было)
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

    // ==== СТРОГИЕ идентификаторы (устойчиво к разным схемам) ====
    // adId: предпочитаем ad.adId, иначе ad.id
    const adId = ad?.adId ?? ad?.id ?? null;
    // ownerId: предпочитаем ad.ownerId, иначе owner.id (как иногда приходит у транспорта/груза)
    const adOwnerId = ad?.ownerId ?? ad?.owner?.id ?? null;

    useEffect(() => {
        console.log('[AdRightPanel] incoming ad snapshot:', {
            keys: Object.keys(ad || {}),
            adId,
            adOwnerId,
            ownerInline: ad?.owner,
        });
    }, [ad, adId, adOwnerId]);

    // базовая валидация входных данных
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

    // ===== CARGO context =====
    const cargoCtx = useContext(CargoRequestsContext);
    const {
        sendCargoRequest,
        cancelMyCargoRequest,
        restartMyCargoRequest,
        getMyRequestStatusForAd,
        sentRequestsStatuses,
        error: cargoError,
        isLoading: cargoCtxLoading,
    } = cargoCtx || {};

    const [isCargoRequestSending, setIsCargoRequestSending] = useState(false);

    // статус моей заявки (cargo) — строго по adId
    const cargoAdStatus = useMemo(() => {
        if (!isCargoAd || !adId || !getMyRequestStatusForAd) return 'none';
        const s = getMyRequestStatusForAd(adId);
        console.log('[AdRightPanel] cargoAdStatus', { adId, s });
        return s;
    }, [isCargoAd, adId, getMyRequestStatusForAd]);

    // мета моей заявки (cargo)
    const myCargoReqMeta = useMemo(() => {
        if (!isCargoAd || !adId || !Array.isArray(sentRequestsStatuses)) return null;
        const meta = sentRequestsStatuses.find((x) => x.adId === adId) || null;
        console.log('[AdRightPanel] myCargoReqMeta', { adId, meta });
        return meta;
    }, [isCargoAd, adId, sentRequestsStatuses]);

    // Минимальный объект, чтобы RequestStatusBlock не падал в cargo-ветке
    const cargoStatusStub = useMemo(() => {
        if (!isCargoAd) return null;
        return {
            // поля, к которым RequestStatusBlock обычно тянется
            requestData: {
                requestId: myCargoReqMeta?.requestId || '',
                adId: adId || '',
                ownerId: adOwnerId || '',
                // сообщение мы не храним в зеркале — пусть будет пустым
                message: '',
            },
            // на всякий случай — метки времени
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }, [isCargoAd, myCargoReqMeta?.requestId, adId, adOwnerId]);

    // === TRANSPORT ===
    const handleTransportSendClick = async () => {
        setLocalError('');
        if (!handleSendRequest) {
            console.error('[AdRightPanel] handleSendRequest is missing (transport)');
            setLocalError('Внутренняя ошибка: не передан handleSendRequest.');
            return;
        }
        try {
            console.log('[AdRightPanel] TRANSPORT send →', { message: cargoDescription });
            await Promise.resolve(handleSendRequest());
            console.log('[AdRightPanel] TRANSPORT send DONE');
        } catch (e) {
            console.error('[AdRightPanel] handleSendRequest ERROR', e);
            setLocalError(e?.message || 'Ошибка отправки заявки (transport).');
        }
    };

    // === CARGO ===
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
            console.log('[AdRightPanel] CARGO sendCargoRequest →', { adId, adOwnerId, message: cargoDescription });
            // Сервис ожидает ad.id — маппим строго: id = ad.adId
            await sendCargoRequest({
                ad: { ...ad, id: adId, ownerId: adOwnerId },
                message: cargoDescription || '',
            });
            console.log('[AdRightPanel] CARGO send DONE');
        } catch (e) {
            console.error('[AdRightPanel] CARGO send ERROR', e);
            setLocalError(e?.message || 'Ошибка отправки заявки (cargo).');
        } finally {
            setIsCargoRequestSending(false);
        }
    };

    const handleCancelCargoRequest = async () => {
        setLocalError('');
        if (!cargoCtx || !cancelMyCargoRequest) {
            console.error('[AdRightPanel] cancelMyCargoRequest missing');
            setLocalError('Метод отмены недоступен (cargo).');
            return;
        }
        if (!myCargoReqMeta?.requestId) {
            console.error('[AdRightPanel] requestId missing for cancel', { myCargoReqMeta });
            setLocalError('Не найден requestId для отмены (cargo).');
            return;
        }
        try {
            console.log('[AdRightPanel] CARGO cancel →', { ownerId: adOwnerId, adId, requestId: myCargoReqMeta.requestId });
            await cancelMyCargoRequest({ ownerId: adOwnerId, adId, requestId: myCargoReqMeta.requestId });
        } catch (e) {
            console.error('[AdRightPanel] CARGO cancel ERROR', e);
            setLocalError(e?.message || 'Ошибка отмены заявки (cargo).');
        }
    };

    const handleRestartCargoRequest = async () => {
        setLocalError('');
        if (!cargoCtx || !restartMyCargoRequest) {
            console.error('[AdRightPanel] restartMyCargoRequest missing');
            setLocalError('Метод повторной отправки недоступен (cargo).');
            return;
        }
        try {
            setIsCargoRequestSending(true);
            console.log('[AdRightPanel] CARGO restart →', { adId, adOwnerId, message: cargoDescription });
            await restartMyCargoRequest({
                ad: { ...ad, id: adId, ownerId: adOwnerId },
                message: cargoDescription || '',
            });
            console.log('[AdRightPanel] CARGO restart DONE');
        } catch (e) {
            console.error('[AdRightPanel] CARGO restart ERROR', e);
            setLocalError(e?.message || 'Ошибка повторной отправки (cargo).');
        } finally {
            setIsCargoRequestSending(false);
        }
    };

    const titleTextTransport = 'Опишите груз и отправьте Перевозчику запрос.';
    const placeholderTransport = 'Описание вашего груза и деталей перевозки.';
    const titleTextCargo = 'Опишите условия и отправьте запрос владельцу груза.';
    const placeholderCargo = 'Ваше предложение по перевозке: цена, дата, маршрут, условия.';

    const cargoSending = isCargoRequestSending || cargoCtxLoading;

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
                        (adRequestStatus === 'none' || adRequestStatus === '' ? (
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
                                onRestartRequest={handleRestartRequest}
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
                        (cargoAdStatus === 'none' || cargoAdStatus === '' ? (
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
                                adTransportationRequest={cargoStatusStub}
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

            {/* DEBUG (строго по ожидаемым полям) */}
            <div style={{ marginTop: 12, fontSize: 12, opacity: .7, padding: 8, border: '1px dashed #ccc', borderRadius: 8 }}>
                <div><b>DEBUG</b></div>
                <div>adType: {String(adType)}</div>
                <div>hasCargoCtx: {String(!!cargoCtx)}</div>
                <div>ad.adId: {String(adId)}</div>
                <div>ad.ownerId: {String(adOwnerId)}</div>
                <div>cargoAdStatus: {String(cargoAdStatus)}</div>
                <div>transport adRequestStatus: {String(adRequestStatus)}</div>
            </div>
        </div>
    );
};

export default AdRightPanel;
