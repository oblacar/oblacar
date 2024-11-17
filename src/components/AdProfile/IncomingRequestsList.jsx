import React, { useContext, useEffect, useState } from 'react';
import TransportationContext from '../../hooks/TransportationContext';
import styles from './IncomingRequestsList.module.css';

import Button from '../common/Button/Button';
import UserSmallCard from '../common/UserSmallCard/UserSmallCard';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';

// XMarkIcon

const IncomingRequestsList = ({ adId }) => {
    const { adsTransportationRequests, getAdTransportationRequestsByAdId } =
        useContext(TransportationContext);
    const [adTransportationRequest, setAdTransportationRequest] = useState();

    // Получаем объект объявления по adId
    useEffect(() => {
        const adTransportationRequest = getAdTransportationRequestsByAdId(adId);
        setAdTransportationRequest(adTransportationRequest);
    }, [adsTransportationRequests]);

    if (!adTransportationRequest) {
        return <p>Запросы не найдены или данные объявления отсутствуют.</p>;
    }

    const requestsData = adTransportationRequest?.requests || {};

    return (
        <div className={styles.requestsList}>
            {(!requestsData || Object.keys(requestsData).length === 0) && (
                <p>Запросы не найдены.</p>
            )}
            <div className={styles.listItems}>
                {Object.entries(requestsData).map(([requestId, request]) => {
                    const { description, status } = request;

                    const { name, photoUrl } = request.sender;

                    return (
                        <div
                            key={requestId}
                            className={styles.requestItem}
                        >
                            <div className={styles.ownerData}>
                                <UserSmallCard
                                    photoUrl={photoUrl}
                                    rating={''}
                                    name={name}
                                    isLoading={false}
                                />{' '}
                            </div>
                            <div className={styles.rightContainer}>
                                <div className={styles.descriptionContainer}>
                                    <p className={styles.descriptionTitle}>
                                        Описание груза и детали перевозки:
                                    </p>
                                    <div className={styles.description}>
                                        {description}
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <Button
                                        type='button'
                                        type_btn='reverse-no'
                                        children='Отклонить'
                                        icon={<XMarkIcon />}
                                        onClick={() =>
                                            console.log(
                                                `Отклонение запроса: ${requestId}`
                                            )
                                        }
                                    />
                                    <Button
                                        type='button'
                                        children='Подтвердить'
                                        type_btn='yes'
                                        icon={<CheckIcon />}
                                        onClick={() =>
                                            console.log(
                                                `Подтверждение запроса: ${requestId}`
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default IncomingRequestsList;
