import React, { useContext, useEffect, useState } from 'react';
import TransportationContext from '../../hooks/TransportationContext';
import UserContext from '../../hooks/UserContext';
import styles from './IncomingRequestsList.module.css';
import IncomingRequestsItem from './IncomingRequestsItem';
import ChatBox from '../common/ChatBox/ChatBox';
import ConversationContext from '../../hooks/ConversationContext';
import TransportAdContext from '../../hooks/TransportAdContext';

import { formatNumber } from '../../utils/helper';

import ModalBackdrop from '../common/ModalBackdrop/ModalBackdrop';
import ConversationLoadingInfo from '../common/ConversationLoadingInfo/ConversationLoadingInfo';

const IncomingRequestsList = ({ adId }) => {
    const {
        adsTransportationRequests,
        getAdTransportationRequestsByAdId,
        declineTransportationRequest,
    } = useContext(TransportationContext);
    const { user } = useContext(UserContext);
    const { isConversationsLoaded, setCurrentConversationState } =
        useContext(ConversationContext);
    const { getAdById } = useContext(TransportAdContext);

    const [adTransportationRequest, setAdTransportationRequest] = useState();
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [chatPartnerData, setChatPartnerData] = useState(null);

    const [isModalBackShow, setIsModalBackShow] = useState(false);

    //Собираем основные данные объявления для отображения в чатах
    const [adData, setAdData] = useState({
        adId: '',
        availabilityDate: '',
        departureCity: '',
        destinationCity: '',
        priceAndPaymentUnit: '',
    });

    // стейт данный для разговора. Нужен, что бы применить, когда разговоры прогрузятся на сайте.
    // в обычном режиме все будет происходить быстро, но сразу после перезагрузки, будет пауза
    // для этого используем стейт.
    const [conversationData, setConversationData] = useState({
        adId: '',
        ownerId: '',
        userId: '',
    });

    useEffect(() => {
        if (isConversationsLoaded && isChatBoxOpen) {
            setCurrentConversationState(
                conversationData.adId,
                conversationData.ownerId,
                conversationData.userId
            );

            setIsModalBackShow(false);
        }
    }, [isConversationsLoaded, isChatBoxOpen]);

    useEffect(() => {
        const adTransportationRequest = getAdTransportationRequestsByAdId(adId);
        setAdTransportationRequest(adTransportationRequest);

        if (adId) {
            const ad = getAdById(adId);

            const priceAndPaymentUnit =
                formatNumber(String(ad.ad.price)) + ' ' + ad.ad.paymentUnit;

            setAdData({
                adId: ad.ad.adId,
                availabilityDate: ad.ad.availabilityDate,
                departureCity: ad.ad.departureCity,
                destinationCity: ad.ad.destinationCity,
                priceAndPaymentUnit: priceAndPaymentUnit,
            });
        }
    }, [adsTransportationRequests, adId]);

    if (!adTransportationRequest) {
        return <p>Запросы не найдены или данные объявления отсутствуют.</p>;
    }

    const requestsData = adTransportationRequest?.requests || {};

    const handleDecline = (userId, adId, requestId) => {
        declineTransportationRequest(userId, adId, requestId);
    };

    const handleAccept = (userId, adId, requestId) => {
        console.log(`Подтверждение запроса: ${requestId}`);
    };

    const handleStartChat = (userData) => {
        setChatPartnerData(userData); // Устанавливаем данные о собеседнике

        const baseConversationData = {
            adId: adId,
            ownerId: userData.ownerId,
            userId: user.userId,
        };
        setConversationData(baseConversationData);

        setIsChatBoxOpen(true); // Открываем чат

        if (!isConversationsLoaded) {
            setIsModalBackShow(true);
        }
    };

    const handleCloseModalBack = () => {
        setIsModalBackShow(false);
        setIsChatBoxOpen(false);
    };

    return (
        <>
            <div className={styles.requestsList}>
                {(!requestsData || Object.keys(requestsData).length === 0) && (
                    <p>Запросы не найдены.</p>
                )}
                <div className={styles.listItems}>
                    {Object.entries(requestsData).map(
                        ([requestId, request]) => (
                            <IncomingRequestsItem
                                key={requestId}
                                request={request}
                                requestId={requestId}
                                adId={adId}
                                userId={user.userId}
                                onDecline={handleDecline}
                                onAccept={handleAccept}
                                onMessageClick={(userData) =>
                                    handleStartChat(userData)
                                }
                            />
                        )
                    )}
                </div>
            </div>
            {isChatBoxOpen && chatPartnerData && isConversationsLoaded && (
                <ChatBox
                    onClose={() => setIsChatBoxOpen(false)}
                    // adId={adId}
                    adData={adData}
                    chatPartnerName={chatPartnerData.ownerName}
                    chatPartnerPhoto={chatPartnerData.ownerPhotoUrl}
                    chatPartnerId={chatPartnerData.ownerId}
                />
            )}

            {isModalBackShow && (
                <ModalBackdrop
                    children={<ConversationLoadingInfo />}
                    onClose={handleCloseModalBack}
                />
            )}
        </>
    );
};

export default IncomingRequestsList;
