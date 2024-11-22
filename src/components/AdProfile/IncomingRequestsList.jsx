import React, { useContext, useEffect, useState } from 'react';
import TransportationContext from '../../hooks/TransportationContext';
import UserContext from '../../hooks/UserContext';
import styles from './IncomingRequestsList.module.css';
import IncomingRequestsItem from './IncomingRequestsItem';
import ChatBox from '../common/ChatBox/ChatBox';
import ConversationContext from '../../hooks/ConversationContext';

const IncomingRequestsList = ({ adId }) => {
    const {
        adsTransportationRequests,
        getAdTransportationRequestsByAdId,
        declineTransportationRequest,
    } = useContext(TransportationContext);
    const { user } = useContext(UserContext);
    const {
        setBasicConversationData,
        findConversation,

        setCurrentConversationState,
    } = useContext(ConversationContext);

    const [adTransportationRequest, setAdTransportationRequest] = useState();

    useEffect(() => {
        const adTransportationRequest = getAdTransportationRequestsByAdId(adId);
        setAdTransportationRequest(adTransportationRequest);
    }, [adsTransportationRequests, adId]);

    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [chatPartnerData, setChatPartnerData] = useState(null);

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

        // findConversation(adId, [userData.ownerId, user.userId]);

        setCurrentConversationState(adId, userData.ownerId, user.userId);

        setIsChatBoxOpen(true); // Открываем чат
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
            {isChatBoxOpen && chatPartnerData && (
                <ChatBox
                    onClose={() => setIsChatBoxOpen(false)}
                    adId={adId}
                    chatPartnerName={chatPartnerData.ownerName}
                    chatPartnerPhoto={chatPartnerData.ownerPhotoUrl}
                    chatPartnerId={chatPartnerData.ownerId}
                />
            )}
        </>
    );
};

export default IncomingRequestsList;
