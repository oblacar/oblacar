import React, { useContext, useEffect, useState } from 'react';
import TransportationContext from '../../hooks/TransportationContext';
import UserContext from '../../hooks/UserContext';
import styles from './IncomingRequestsList.module.css';
import IncomingRequestsItem from './IncomingRequestsItem';

const IncomingRequestsList = ({ adId }) => {
    const {
        adsTransportationRequests,
        getAdTransportationRequestsByAdId,
        declineTransportationRequest,
    } = useContext(TransportationContext);
    const { user } = useContext(UserContext);
    const [adTransportationRequest, setAdTransportationRequest] = useState();

    useEffect(() => {
        const adTransportationRequest = getAdTransportationRequestsByAdId(adId);
        setAdTransportationRequest(adTransportationRequest);
    }, [adsTransportationRequests]);

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

    return (
        <div className={styles.requestsList}>
            {(!requestsData || Object.keys(requestsData).length === 0) && (
                <p>Запросы не найдены.</p>
            )}
            <div className={styles.listItems}>
                {Object.entries(requestsData).map(([requestId, request]) => (
                    <IncomingRequestsItem
                        key={requestId}
                        request={request}
                        requestId={requestId}
                        adId={adId}
                        userId={user.userId}
                        onDecline={handleDecline}
                        onAccept={handleAccept}
                    />
                ))}
            </div>
        </div>
    );
};

export default IncomingRequestsList;
