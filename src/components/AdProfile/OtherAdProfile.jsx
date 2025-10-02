// src/components/AdProfile/OtherAdProfile.jsx
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
  // нормализуем вход: иногда приходит { ad: {...} }
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

  // только для транспорта (панель «отправить запрос»)
  const [cargoDescription, setCargoDescription] = useState('');
  const [adRequestStatus, setAdRequestStatus] = useState('none');
  const [adTransportationRequest, setAdTransportationRequest] = useState(null);
  const [isTransportationRequestSending, setIsTransportationRequestSending] = useState(false);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    if (data) setIsLoading(false);
  }, [data]);

  // ===== НОРМАЛИЗАЦИЯ ПОЛЕЙ ПОД ОБЩИЙ ИНТЕРФЕЙС =====
  // 1) владелец
  const owner =
    adType === 'cargo'
      ? {
        id: data?.owner?.id ?? data?.ownerId ?? null,
        name: data?.owner?.name ?? data?.ownerName ?? 'Пользователь',
        photoUrl: data?.owner?.photoUrl ?? data?.ownerPhotoUrl ?? '',
        rating: data?.owner?.rating ?? data?.ownerRating ?? '',
      }
      : {
        id: data?.ownerId ?? null,
        name: data?.ownerName ?? 'Пользователь',
        photoUrl: data?.ownerPhotoUrl ?? '',
        rating: data?.ownerRating ?? '',
      };

  // 2) маршруты/даты/цены — разные названия в cargo/transport
  const adId = data?.adId ?? null;

  const availabilityDate =
    adType === 'transport' ? data?.availabilityDate ?? '' : data?.pickupDate ?? '';

  const routeFrom =
    adType === 'transport' ? data?.departureCity ?? '' : data?.departureCity ?? '';
  const routeTo =
    adType === 'transport' ? data?.destinationCity ?? '' : data?.destinationCity ?? '';

  const price = data?.price ?? '';
  const paymentUnit = data?.paymentUnit ?? '';

  // для ChatBox заголовка у груза пригодится
  const title = adType === 'cargo' ? data?.title ?? '' : '';

  // (доп. поля, если нужны ниже)
  const pickupDate = adType === 'cargo' ? data?.pickupDate ?? '' : '';
  const deliveryDate = adType === 'cargo' ? data?.deliveryDate ?? '' : '';

  // ===== СТАТУСЫ ЗАПРОСОВ (ТОЛЬКО ДЛЯ ТРАНСПОРТА) =====
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

  // ===== ЧАТ ПРИВЯЗКА =====
  useEffect(() => {
    if (!isConversationsLoaded || !isChatBoxOpen || !data) return;
    // порядок: (adId, currentUserId, otherUserId)
    setCurrentConversationState(adId, user?.userId, owner.id);
    setIsModalBackShow(false);
  }, [isConversationsLoaded, isChatBoxOpen, adId, user?.userId, owner.id, setCurrentConversationState]);

  useEffect(() => {
    setIsLoadingConversation(false);
  }, [isChatBoxOpen, currentConversation]);

  if (isLoading) {
    return <div className="loading">Загрузка объявления...</div>;
  }

  // ===== Обработчики (чат) =====
  const handleStartChat = () => {
    setIsLoadingConversation(true);
    setIsChatBoxOpen(true);
    if (!isConversationsLoaded) setIsModalBackShow(true);
  };
  const handleCloseModalBack = () => {
    setIsModalBackShow(false);
    setIsChatBoxOpen(false);
  };

  // ===== Обработчики (заявка перевозчику — ТОЛЬКО ТРАНСПОРТ) =====
  const handleSendRequest = async () => {
    if (adType !== 'transport') return;
    if (!cargoDescription.trim()) return;

    setIsTransportationRequestSending(true);

    const adData = {
      adId,
      locationFrom: routeFrom,
      locationTo: routeTo,
      date: availabilityDate,
      price,
      paymentUnit,
      owner: {
        id: owner.id,
        name: owner.name,
        photoUrl: owner.photoUrl,
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
      await cancelTransportationRequest(adId, user.userId, owner.id, requestId);
      setAdRequestStatus('cancelled');
    } catch (e) {
      console.error('Failed to cancel request:', e);
    }
  };
  const handleRestartRequest = async () => {
    try {
      await restartTransportationRequest(adId, user.userId, owner.id, requestId);
      setAdRequestStatus('none');
    } catch (e) {
      console.error('Failed to restart request:', e);
    }
  };

  // какой блок описания слева
  const Details = adType === 'cargo' ? OtherCargoAdDetails : OtherTransportAdDetails;

  const RightPanel = () => (
    <div className="other-ad-profile-owner-data">
      <UserSmallCard
        photoUrl={owner.photoUrl}
        rating={owner.rating}
        name={owner.name}
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
                departureCity: routeFrom,
                destinationCity: routeTo,
                priceAndPaymentUnit: formatNumber(String(price)) + ' ' + (paymentUnit || ''),
              }
              : {
                adId,
                availabilityDate: pickupDate,
                departureCity: routeFrom,
                destinationCity: routeTo,
                priceAndPaymentUnit: '', // у груза пока без ставки
                title: title || '',
              }
          }
          chatPartnerName={owner.name}
          chatPartnerPhoto={owner.photoUrl}
          chatPartnerId={owner.id}
        />
      )}

      {isModalBackShow && (
        <ModalBackdrop children={<ConversationLoadingInfo />} onClose={() => setIsModalBackShow(false)} />
      )}
    </>
  );
};

export default OtherAdProfile;
