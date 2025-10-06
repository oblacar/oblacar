// src/components/AdProfile/AdRightPanel.jsx
import React, { useContext, useMemo, useState } from 'react';
import UserSmallCard from '../../common/UserSmallCard/UserSmallCard';
import Button from '../../common/Button/Button';
import Preloader from '../../common/Preloader/Preloader';
import RequestStatusBlock from '../components/AdRequests/RequestStatusBlock';
import { FaEnvelope } from 'react-icons/fa';

// Контекст заявок на объявления ГРУЗА
import { CargoRequestsContext } from '../../../hooks/CargoRequestsContext';

/**
 * Правая панель с контактами и заявкой.
 */
const AdRightPanel = ({
    adType,                    // 'transport' | 'cargo'
    ad,                        // { id, ownerId, ... }
    owner,                     // { photoUrl, rating, name }
    cargoDescription,
    setCargoDescription,
    handleStartChat,           // (кнопка под фото — пока не трогаем)

    // ===== старая транспорт-логика (оставляем как есть) =====
    handleSendRequest,
    isTransportationRequestSending,
    adRequestStatus,
    handleCancelRequest,
    handleRestartRequest,
    adTransportationRequest,
}) => {
    const isTransportAd = adType === 'transport';
    const isCargoAd = adType === 'cargo';

    // ===== CARGO REQUESTS =====
    const {
        sendCargoRequest,
        cancelMyCargoRequest,
        restartMyCargoRequest,
        getMyRequestStatusForAd,
        sentRequestsStatuses,
    } = useContext(CargoRequestsContext) || {};

    const [isCargoRequestSending, setIsCargoRequestSending] = useState(false);

    const cargoAdStatus = useMemo(() => {
        if (!isCargoAd || !ad?.id || !getMyRequestStatusForAd) return 'none';
        return getMyRequestStatusForAd(ad.id);
    }, [isCargoAd, ad?.id, getMyRequestStatusForAd]);

    const myCargoReqMeta = useMemo(() => {
        if (!isCargoAd || !ad?.id || !Array.isArray(sentRequestsStatuses)) return null;
        return sentRequestsStatuses.find((x) => x.adId === ad.id) || null;
    }, [isCargoAd, ad?.id, sentRequestsStatuses]);

    const handleSendCargoRequest = async () => {
        if (!isCargoAd || !sendCargoRequest || !ad) return;
        try {
            setIsCargoRequestSending(true);
            await sendCargoRequest({ ad, message: cargoDescription || '' });
        } finally {
            setIsCargoRequestSending(false);
        }
    };

    const handleCancelCargoRequest = async () => {
        if (!isCargoAd || !cancelMyCargoRequest || !ad || !myCargoReqMeta?.requestId) return;
        await cancelMyCargoRequest({
            ownerId: ad.ownerId,
            adId: ad.id,
            requestId: myCargoReqMeta.requestId,
        });
    };

    const handleRestartCargoRequest = async () => {
        if (!isCargoAd || !restartMyCargoRequest || !ad) return;
        setIsCargoRequestSending(true);
        try {
            await restartMyCargoRequest({ ad, message: cargoDescription || '' });
        } finally {
            setIsCargoRequestSending(false);
        }
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
                onMessageClick={handleStartChat} // под фото — отдельная кнопка, не трогаем
                isLoading={false}
            />

            {isTransportAd ? (
                // ===== Объявления ТРАНСПОРТА =====
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
                                <Button type='button' icon={<FaEnvelope />} onClick={handleSendRequest}>
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
                        <div className='other-ad-profile-send-request-preloader'>
                            <Preloader />
                        </div>
                    )}
                </div>
            ) : isCargoAd ? (
                // ===== Объявления ГРУЗА =====
                <div className='other-ad-profile-owner-send-request'>
                    {!isCargoRequestSending &&
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
                                adTransportationRequest={null}
                            />
                        ))}

                    {isCargoRequestSending && (
                        <div className='other-ad-profile-send-request-preloader'>
                            <Preloader />
                        </div>
                    )}
                </div>
            ) : (
                // fallback
                <div className='other-ad-profile-owner-send-request'>
                    <strong>Свяжитесь с автором объявления.</strong>
                </div>
            )}
        </div>
    );
};

export default AdRightPanel;
