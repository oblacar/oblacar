import React, { useContext, useEffect, useState } from 'react';
import TransportationContext from '../../hooks/TransportationContext';
import './IncomingRequestsList.css';

import Button from '../common/Button/Button';

const IncomingRequestsList = ({ adId }) => {
    const { adsTransportationRequests, getAdTransportationRequestsByAdId } =
        useContext(TransportationContext);
    const [adTransportationRequest, setAdTransportationRequest] = useState();

    // Получаем объект объявления по adId
    useEffect(() => {
        console.log(
            'все объекты adsTransportationRequests: ',
            adsTransportationRequests
        );

        const adTransportationRequest = getAdTransportationRequestsByAdId(adId);

        console.log(
            'вытащили объект adTransportationRequest: ',
            adTransportationRequest
        );

        setAdTransportationRequest(adTransportationRequest);
    }, [adsTransportationRequests]);

    console.log('в объявлении adId: ', adId);

    console.log(
        'в объявлении adTransportationRequest: ',
        adTransportationRequest
    );

    if (!adTransportationRequest) {
        return <p>Запросы не найдены или данные объявления отсутствуют.</p>;
    }

    const { mainData, requests } = adTransportationRequest;
    const requestsData = adTransportationRequest?.requests || {};

    return (
        <div className='requests-list'>
            <h3>Запросы на перевозку для объявления:</h3>
            <div className='requests-list-header'>
                <p>
                    <strong>Откуда:</strong> {mainData.locationFrom}
                </p>
                <p>
                    <strong>Куда:</strong> {mainData.locationTo}
                </p>
                <p>
                    <strong>Цена:</strong> {mainData.price}{' '}
                    {mainData.paymentUnit}
                </p>
            </div>
            <div className='requests-list-items'>
                {Object.entries(requestsData).map(([requestId, request]) => (
                    <div
                        key={requestId}
                        className='request-item'
                    >
                        <p>
                            <strong>Отправитель:</strong> {request.sender.name}
                        </p>
                        <p>
                            <strong>Контакт:</strong> {request.sender.contact}
                        </p>
                        <p>
                            <strong>Сообщение:</strong> {request.message}
                        </p>
                        <p>
                            <strong>Статус:</strong> {request.status}
                        </p>
                        <div className='request-item-actions'>
                            <Button
                                type='button'
                                children='Подтвердить'
                                onClick={() =>
                                    console.log(
                                        `Подтверждение запроса: ${requestId}`
                                    )
                                }
                            />
                            <Button
                                type='button'
                                children='Отклонить'
                                onClick={() =>
                                    console.log(
                                        `Отклонение запроса: ${requestId}`
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IncomingRequestsList;
