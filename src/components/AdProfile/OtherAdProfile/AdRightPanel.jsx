// src/components/AdProfile/AdRightPanel.jsx

import React from 'react';
import UserSmallCard from '../../common/UserSmallCard/UserSmallCard';
import Button from '../../common/Button/Button';
import Preloader from '../../common/Preloader/Preloader';
import RequestStatusBlock from '../components/AdRequests/RequestStatusBlock'; // Убедитесь, что путь правильный
import { FaEnvelope } from 'react-icons/fa'; // Иконка

/**
 * Правая панель с контактами, запросом на перевозку или кнопкой чата.
 * Принимает все необходимые данные и обработчики из useAdProfileLogic.
 */
const AdRightPanel = ({
    adType,
    owner,
    cargoDescription,
    setCargoDescription,
    handleStartChat,
    handleSendRequest,
    isTransportationRequestSending,
    adRequestStatus,
    handleCancelRequest,
    handleRestartRequest,
    adTransportationRequest,
}) => {
    return (
        <div className='other-ad-profile-owner-data'>
            <UserSmallCard
                photoUrl={owner.photoUrl}
                rating={owner.rating}
                name={owner.name}
                onMessageClick={handleStartChat}
                isLoading={false}
            />

            {adType === 'transport' ? (
                // Логика для объявлений ТРАНСПОРТА
                <div className='other-ad-profile-owner-send-request'>
                    {!isTransportationRequestSending &&
                        (adRequestStatus === 'none' ||
                        adRequestStatus === '' ? (
                            <>
                                <strong>
                                    Опишите груз и отправьте Перевозчику запрос.
                                </strong>
                                <textarea
                                    placeholder='Описание вашего груза и деталей перевозки.'
                                    value={cargoDescription}
                                    onChange={(e) =>
                                        setCargoDescription(e.target.value)
                                    }
                                />
                                <Button
                                    type='button'
                                    children='Отправить запрос'
                                    icon={<FaEnvelope />}
                                    onClick={handleSendRequest}
                                />
                            </>
                        ) : (
                            <RequestStatusBlock
                                status={adRequestStatus}
                                onCancelRequest={handleCancelRequest}
                                onRestartRequest={handleRestartRequest}
                                adTransportationRequest={
                                    adTransportationRequest
                                }
                            />
                        ))}

                    {isTransportationRequestSending && (
                        <div className='other-ad-profile-send-request-preloader'>
                            <Preloader />
                        </div>
                    )}
                </div>
            ) : (
                // Логика для объявлений ГРУЗОВ
                <div className='other-ad-profile-owner-send-request'>
                    <strong>Свяжитесь с автором объявления о грузе.</strong>
                    <div style={{ marginTop: 8 }}>
                        <Button
                            type='button'
                            children='Написать сообщение'
                            onClick={handleStartChat}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdRightPanel;
