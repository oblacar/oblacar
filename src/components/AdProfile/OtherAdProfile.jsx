import React, { useContext, useEffect, useState } from 'react';
import './OtherAdProfile.css';

import ConversationContext from '../../hooks/ConversationContext';
import UserContext from '../../hooks/UserContext';
import TransportationContext from '../../hooks/TransportationContext';
import { formatNumber } from '../../utils/helper';

import Button from '../common/Button/Button';
import ChatBox from '../common/ChatBox/ChatBox';
import Preloader from '../common/Preloader/Preloader';
import RequestStatusBlock from './RequestStatusBlock';
import UserSmallCard from '../common/UserSmallCard/UserSmallCard';
import ModalBackdrop from '../common/ModalBackdrop/ModalBackdrop';
import ConversationLoadingInfo from '../common/ConversationLoadingInfo/ConversationLoadingInfo';

import OtherTransportAdDetails from './OtherTransportAdDetails';
import OtherCargoAdDetails from './OtherCargoAdDetails';
import { FaEnvelope } from 'react-icons/fa';

const OtherAdProfile = ({ adType, ad }) => {
  const data = ad?.ad && typeof ad.ad === 'object' ? ad.ad : ad;

  const { currentConversation, setCurrentConversationState, isConversationsLoaded } =
    useContext(ConversationContext);
  const { user } = useContext(UserContext);
  const {
    sendTransportationRequest,
    getAdTransportationRequestByAdId,
    adTransportationRequests,
    cancelTransportationRequest,
    restartTransportationRequest,
  } = useContext(TransportationContext);

  const [isLoading, setIsLoading] = useState(true);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [isModalBackShow, setIsModalBackShow] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // только для транспорта
  const [cargoDescription, setCargoDescription] = useState('');
  const [adRequestStatus, setAdRequestStatus] = useState('none');
  const [adTransportationRequest, setAdTransportationRequest] = useState(null);
  const [isTransportationRequestSending, setIsTransportationRequestSending] = useState(false);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    if (data) setIsLoading(false);
  }, [data]);

  const {
    adId,
    ownerId,
    ownerName,
    ownerPhotoUrl,
    ownerRating,

    // транспорт
    availabilityDate,
    departureCity,
    destinationCity,
    price,
    paymentUnit,

    // груз
    pickupDate,
    deliveryDate,
    title,
  } = data || {};

  useEffect(() => {
    if (adType !== 'transport' || !adTransportationRequests || !adId) return;
    const atr = getAdTransportationRequestByAdId(adId);
    let status = 'none';
    let rid = null;
    if (atr?.requestData) {
      status = atr.requestData.status ?? 'none';
      rid = atr.requestData.requestId ?? null;
    }
    setAdRequestStatus(status);
    setRequestId(rid);
    setAdTransportationRequest(atr);
    setIsTransportationRequestSending(false);
  }, [adTransportationRequests, adType, adId, getAdTransportationRequestByAdId]);

  useEffect(() => {
    if (!isConversationsLoaded || !isChatBoxOpen || !data) return;
    setCurrentConversationState(adId, user?.userId, ownerId);
    setIsModalBackShow(false);
  }, [isConversationsLoaded, isChatBoxOpen, adId, user?.userId, ownerId, setCurrentConversationState]);

  useEffect(() => {
    setIsLoadingConversation(false);
  }, [isChatBoxOpen, currentConversation]);

  if (isLoading) {
    return <div className="loading">Загрузка объявления...</div>;
  }

  const handleStartChat = () => {
    setIsLoadingConversation(true);
    setIsChatBoxOpen(true);
    if (!isConversationsLoaded) setIsModalBackShow(true);
  };

  const handleCloseModalBack = () => {
    setIsModalBackShow(false);
    setIsChatBoxOpen(false);
  };

  const handleSendRequest = async () => {
    if (adType !== 'transport') return;
    if (!cargoDescription.trim()) return;

    setIsTransportationRequestSending(true);

    const adData = {
      adId,
      locationFrom: departureCity,
      locationTo: destinationCity,
      date: availabilityDate,
      price,
      paymentUnit,
      owner: {
        id: ownerId,
        name: ownerName,
        photoUrl: ownerPhotoUrl,
        contact: '—',
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
      await sendTransportationRequest(adData, request);
      setCargoDescription('');
    } catch (e) {
      console.error('Failed to send request:', e);
      setIsTransportationRequestSending(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await cancelTransportationRequest(adId, user.userId, ownerId, requestId);
      setAdRequestStatus('cancelled');
    } catch (e) {
      console.error('Failed to cancel request:', e);
    }
  };

  const handleRestartRequest = async () => {
    try {
      await restartTransportationRequest(adId, user.userId, ownerId, requestId);
      setAdRequestStatus('none');
    } catch (e) {
      console.error('Failed to restart request:', e);
    }
  };

  const Details = adType === 'cargo' ? OtherCargoAdDetails : OtherTransportAdDetails;

  const RightPanel = () => (
    <div className="other-ad-profile-owner-data">
      <UserSmallCard
        photoUrl={ownerPhotoUrl}
        rating={ownerRating}
        name={ownerName}
        onMessageClick={handleStartChat}
        isLoading={false}
      />

      {adType === 'transport' ? (
        <div className="other-ad-profile-owner-send-request">
          {!isTransportationRequestSending &&
            (adRequestStatus === 'none' || adRequestStatus === '' ? (
              <>
                <strong>Опишите груз и отправьте Перевозчику запрос.</strong>
                <textarea
                  placeholder="Описание вашего груза и деталей перевозки."
                  value={cargoDescription}
                  onChange={(e) => setCargoDescription(e.target.value)}
                />
                <Button
                  type="button"
                  children="Отправить запрос"
                  icon={<FaEnvelope />}
                  onClick={handleSendRequest}
                />
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
            <div className="other-ad-profile-send-request-preloader">
              <Preloader />
            </div>
          )}
        </div>
      ) : (
        <div className="other-ad-profile-owner-send-request">
          <strong>Свяжитесь с автором объявления о грузе.</strong>
          <div style={{ marginTop: 8 }}>
            <Button type="button" children="Написать сообщение" onClick={handleStartChat} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="other-ad-profile">
        <div className="other-ad-profile-main-data">
          <Details ad={data} />
        </div>

        <RightPanel />
      </div>

      {isChatBoxOpen && isConversationsLoaded && (
        <ChatBox
          onClose={() => setIsChatBoxOpen(false)}
          adData={
            adType === 'transport'
              ? {
                adId,
                availabilityDate,
                departureCity,
                destinationCity,
                priceAndPaymentUnit: formatNumber(String(price)) + ' ' + (paymentUnit || ''),
              }
              : {
                adId,
                availabilityDate: pickupDate,
                departureCity,
                destinationCity,
                priceAndPaymentUnit: '',
                title: title || '',
              }
          }
          chatPartnerName={ownerName}
          chatPartnerPhoto={ownerPhotoUrl}
          chatPartnerId={ownerId}
        />
      )}

      {isModalBackShow && (
        <ModalBackdrop children={<ConversationLoadingInfo />} onClose={handleCloseModalBack} />
      )}
    </>
  );
};

export default OtherAdProfile;
