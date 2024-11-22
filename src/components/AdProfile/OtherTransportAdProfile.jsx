// src/components/AdProfile/AdProfile.js

import React, { useState, useEffect, useRef, useContext } from 'react';
import './OtherTransportAdProfile.css';
import { FaUser, FaEnvelope } from 'react-icons/fa';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

import ConversationContext from '../../hooks/ConversationContext';
import UserContext from '../../hooks/UserContext';
import TransportationContext from '../../hooks/TransportationContext';

import { cutNumber, formatNumber } from '../../utils/helper';

import PhotoCarousel from '../common/PhotoCarousel/PhotoCarousel';
import Button from '../common/Button/Button';
import ChatBox from '../common/ChatBox/ChatBox';
import Preloader from '../common/Preloader/Preloader';
import RequestStatusBlock from './RequestStatusBlock';
import UserSmallCard from '../common/UserSmallCard/UserSmallCard';

const OtherTransportAdProfile = ({
    ad,
    // onSendRequest,
    // onMessage,
    // userType,
}) => {
    const {
        currentConversation,
        findConversation,

        clearConversation,
        setBasicConversationData,
        clearBasicConversationData,

        setCurrentConversationState,
        clearCurrentConversation,
    } = useContext(ConversationContext);
    const { user } = useContext(UserContext);
    const {
        sendTransportationRequest,
        getRequestStatusByAdId,
        getAdTransportationRequestByAdId,
        adTransportationRequests,
        cancelTransportationRequest,
        restartTransportationRequest,
    } = useContext(TransportationContext);

    const [cargoDescription, setCargoDescription] = useState('');
    const [adRequestStatus, setAdRequestStatus] = useState('');
    const [adTransportationRequest, setAdTransportationRequest] =
        useState(null);
    const [isTransportationRequestSending, setIsTransportationRequestSending] =
        useState(false);

    const {
        adId,
        ownerPhotoUrl,
        ownerName,
        ownerId,
        availabilityDate,
        departureCity,
        destinationCity,
        price,
        paymentUnit,
        paymentOptions,
        readyToNegotiate,
        truckName,
        transportType,
        loadingTypes,
        truckWeight,
        truckHeight,
        truckWidth,
        truckDepth,
        ownerRating,
    } = ad;

    // console.log('Номер об: ', adId);

    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isLoadingConversation, setIsLoadingConversation] = useState(false);

    const [requestId, setRequestId] = useState(null);

    useEffect(() => {
        if (ad) {
            setIsLoading(false);
        }
    }, [ad]);

    useEffect(() => {
        //TODO shoulde undersand what from it depended
        if (ad) {
            const adTransportationRequest =
                getAdTransportationRequestByAdId(adId);

            let requestStatusByAdId;
            let requestId;
            if (adTransportationRequest) {
                requestStatusByAdId =
                    adTransportationRequest.requestData.status;

                requestId = adTransportationRequest.requestData.requestId;
            } else {
                requestStatusByAdId = '';
                requestId = null;
            }

            setAdRequestStatus(requestStatusByAdId);
            setRequestId(requestId);

            console.log('adTransportationRequest:', requestStatusByAdId);
            setAdTransportationRequest(adTransportationRequest);

            setIsTransportationRequestSending(false);
        }
    }, [adTransportationRequests]);

    useEffect(() => {
        console.log('adTransportationRequest: ', adTransportationRequest);
    }, [adTransportationRequest]);

    useEffect(
        () => {
            const basicConversationData = {
                adId: ad.adId,
                participants: [
                    {
                        userId: ownerId,
                        userName: ownerName,
                        userPhotoUrl: ownerPhotoUrl,
                    },
                    {
                        userId: user.userId,
                        userName: user.userName,
                        userPhotoUrl: user.userPhoto,
                    },
                ],
            };

            setBasicConversationData(basicConversationData);

            findConversation(adId, [ownerId, user.userId]);

            setCurrentConversationState(adId, user.userId, ownerId);
            // Очистка состояния при размонтировании компонента
            return () => {
                clearConversation();
                clearBasicConversationData();
                //TODO отлаживаем обновления стейтов
                // clearCurrentConversation();
            };
        },
        // eslint-disable-next-line
        []
    );

    useEffect(() => {
        setIsLoadingConversation(false);
    }, [isChatBoxOpen, currentConversation]);

    if (isLoading) {
        return <div className='loading'>Загрузка объявления...</div>;
    }

    const loadingTypesItem = () => {
        const loadingTypesString = loadingTypes?.join(', ');
        return loadingTypesString ? (
            <>
                <strong>Загрузка:</strong> {loadingTypesString}
            </>
        ) : null;
    };

    const paymentOptionsItem = () => {
        let paymentOptionsString = paymentOptions?.join(', ');

        if (readyToNegotiate) {
            paymentOptionsString = paymentOptionsString + ', торг';
        }

        return paymentOptionsString ? (
            <>
                <strong>Условия:</strong> {paymentOptionsString}
            </>
        ) : null;
    };

    const truckWeightValue = () => {
        const valueData =
            Number(truckHeight) * Number(truckWidth) * Number(truckDepth);
        const value = cutNumber(valueData);

        const valuePart = value ? (
            <div>
                <strong>Габариты: </strong>
                {value}м<sup>3</sup> ({Number(truckHeight)}м x{' '}
                {Number(truckWidth)}м x {Number(truckDepth)}м)
            </div>
        ) : null;

        const weightPart = truckWeight ? (
            <div>
                <strong>Тоннаж: </strong>
                {Number(truckWeight)}т
            </div>
        ) : null;

        return (
            <>
                {weightPart}
                {valuePart}
            </>
        );
    };

    const handleStartChat = async () => {
        setIsLoadingConversation(true);

        setIsChatBoxOpen(true);
    };

    //==>>

    const handleSendRequest = async () => {
        if (!cargoDescription.trim()) {
            console.error('Cargo description cannot be empty.');
            return;
        }

        setIsTransportationRequestSending(true);

        const adData = {
            adId: adId,
            locationFrom: departureCity,
            locationTo: destinationCity,
            date: availabilityDate,
            price: price,
            paymentUnit: paymentUnit,
            owner: {
                id: ownerId,
                name: ownerName,
                photoUrl: ownerPhotoUrl,
                contact: 'не заполняется',
            },
        };

        const request = {
            sender: {
                id: user.userId,
                name: user.userName,
                photoUrl: user.userPhoto,
                contact: user.userPhone,
            },
            dateSent: new Date().toLocaleDateString('ru-RU'),
            status: 'pending',
            description: cargoDescription,
        };

        try {
            const requestId = await sendTransportationRequest(adData, request);
            console.log('Request sent successfully!');

            setCargoDescription(''); // Очистить поле после отправки

            const adTransportationRequest =
                getAdTransportationRequestByAdId(requestId);

            setAdTransportationRequest(adTransportationRequest);
        } catch (error) {
            console.error('Failed to send request:', error);
        }
    };

    const handleCancelRequest = async () => {
        try {
            await cancelTransportationRequest(
                adId,
                user.userId,
                ownerId,
                requestId
            );

            setAdRequestStatus('cancelled'); // Обновите локальный статус
        } catch (error) {
            console.error('Failed to cancel request:', error);
        }
    };

    const handleRestartRequest = async () => {
        try {
            await restartTransportationRequest(
                adId,
                user.userId,
                ownerId,
                requestId
            );

            setAdRequestStatus('none'); // Обновите локальный статус
        } catch (error) {
            console.error('Failed to cancel request:', error);
        }
    };

    //<<==

    return (
        <>
            <div className='transport-ad-profile'>
                <div className='transport-ad-profile-main-data'>
                    <div className='transport-ad-profile-truck-photo-area'>
                        <PhotoCarousel photos={ad.truckPhotoUrls || []} />
                    </div>
                    <div className='transport-ad-profile-rout-date-price'>
                        <div className='transport-ad-profile-date transport-ad-profile-rout-date-price-row'>
                            <strong>Доступен:</strong> {availabilityDate}
                        </div>
                        <div className='transport-ad-profile-departure-city transport-ad-profile-rout-date-price-row'>
                            <strong>Откуда:</strong> {departureCity}
                        </div>
                        <div className='transport-ad-profile-destination-city transport-ad-profile-rout-date-price-row'>
                            <strong>Куда:</strong> {destinationCity}
                        </div>
                        <div className='transport-ad-profile-price transport-ad-profile-rout-date-price-row'>
                            <strong>Цена:</strong> {formatNumber(String(price))}{' '}
                            {paymentUnit}
                        </div>
                        <div className='transport-ad-profile-price transport-ad-profile-rout-date-price-row'>
                            {paymentOptionsItem()}
                        </div>

                        <div className='transport-ad-profile-truck'>
                            <div className='transport-ad-profile-truck-name transport-ad-profile-truck-row'>
                                <strong>Марка: </strong>
                                {truckName}
                            </div>
                            <div className='transport-ad-profile-truck-type transport-ad-profile-truck-row'>
                                <strong>Тип: </strong>
                                {transportType}
                            </div>
                            <div className='transport-ad-profile-truck-weight-value transport-ad-profile-truck-row'>
                                {truckWeightValue()}
                            </div>
                            <div className='transport-ad-profile-truck-loadings transport-ad-profile-truck-row'>
                                {loadingTypesItem()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='transport-ad-profile-owner-data'>
                    <UserSmallCard
                        photoUrl={ownerPhotoUrl}
                        rating={ownerRating}
                        name={ownerName}
                        onMessageClick={handleStartChat}
                        isLoading={false}
                    />

                    <div className='transport-ad-profile-owner-send-request'>
                        {!isTransportationRequestSending &&
                            (adRequestStatus === 'none' ||
                            adRequestStatus === '' ? (
                                <>
                                    <strong>
                                        Опишите груз и отправьте Перевозчику
                                        запрос на подтверждение доставки.
                                    </strong>
                                    <textarea
                                        placeholder='Описание вашего груза и деталей перевозки.'
                                        value={cargoDescription}
                                        onChange={(e) =>
                                            setCargoDescription(e.target.value)
                                        }
                                    ></textarea>
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
                            <div className='transport-ad-profile-send-request-preloader'>
                                <Preloader />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isChatBoxOpen && (
                <ChatBox
                    onClose={() => setIsChatBoxOpen(false)}
                    adId={ad.adId}
                    chatPartnerName={ownerName}
                    chatPartnerPhoto={ownerPhotoUrl}
                    chatPartnerId={ownerId}
                />
            )}
        </>
    );
};

export default OtherTransportAdProfile;
