// src/components/AdProfile/OtherAdProfile.jsx

import React from 'react';
// Импортируем только нужные компоненты и наш новый хук
import useAdProfileLogic from '../hooks/useAdProfileLogic';
import AdRightPanel from './AdRightPanel';
import ChatBox from '../../common/ChatBox/ChatBox';
import ModalBackdrop from '../../common/ModalBackdrop/ModalBackdrop';
import ConversationLoadingInfo from '../../common/ConversationLoadingInfo/ConversationLoadingInfo';
import IconWithTooltip from '../../common/IconWithTooltip/IconWithTooltip';
import OtherTransportAdDetails from '../components/AdDetails/OtherTransportAdDetails';
import OtherCargoAdDetails from '../components/AdDetails/OtherCargoAdDetails';
import { formatNumber } from '../../../utils/helper'; // Только для ChatBox

// Иконки
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';
import './OtherAdProfile.css';

const OtherAdProfile = ({ adType, ad }) => {
    // 1. ИСПОЛЬЗУЕМ ВЕСЬ ФУНКЦИОНАЛ ИЗ ХУКА
    const {
        // Состояния и данные для рендеринга
        isLoading,
        isChatBoxOpen,
        isModalBackShow,
        isInReviewAds,
        isConversationsLoaded,
        isTransportationRequestSending,
        adRequestStatus,
        adTransportationRequest,
        cargoDescription,

        // Сеттеры
        setIsChatBoxOpen,
        setCargoDescription,

        // Данные
        data,
        owner,
        adProps, // adId, routeFrom, routeTo, price и т.д.

        // Обработчики
        handleToggleReviewAd,
        handleStartChat,
        handleCloseModalBack,
        handleSendRequest,
        handleCancelRequest,
        handleRestartRequest,

        formatNumber,
    } = useAdProfileLogic({ adType, ad });

    // 2. Вспомогательные данные
    const Details =
        adType === 'cargo' ? OtherCargoAdDetails : OtherTransportAdDetails;

    // 3. РАННИЙ ВЫХОД
    if (isLoading) {
        return <div className='loading'>Загрузка объявления...</div>;
    }

    // 4. ОСНОВНОЙ РЕНДЕРИНГ
    return (
        <>
            <div className='other-ad-profile'>
                {/* 1. Кнопка "Варианты" (Bookmark) */}
                <div
                    className={`oap-in-review ${
                        isInReviewAds ? 'oap-in-review--is-active' : ''
                    }`}
                >
                    <IconWithTooltip
                        icon={isInReviewAds ? FaBookmark : FaRegBookmark}
                        tooltipText={
                            isInReviewAds
                                ? 'Убрать из Вариантов'
                                : 'Добавить в Варианты'
                        }
                        onClick={handleToggleReviewAd}
                    />
                </div>

                {/* 2. Детали объявления */}
                <div className='other-ad-profile-main-data'>
                    <Details ad={data} />
                </div>

                {/* 3. Правая панель с контактами/запросом (Вынесенный компонент) */}
                <AdRightPanel
                    adType={adType}
                    owner={owner}
                    cargoDescription={cargoDescription}
                    setCargoDescription={setCargoDescription}
                    handleStartChat={handleStartChat}
                    handleSendRequest={handleSendRequest}
                    isTransportationRequestSending={
                        isTransportationRequestSending
                    }
                    adRequestStatus={adRequestStatus}
                    handleCancelRequest={handleCancelRequest}
                    handleRestartRequest={handleRestartRequest}
                    adTransportationRequest={adTransportationRequest}
                />
            </div>

            {/* 4. Чат и модальные окна */}
            {isChatBoxOpen && isConversationsLoaded && (
                <ChatBox
                    onClose={() => setIsChatBoxOpen(false)}
                    adData={
                        adType === 'transport'
                            ? {
                                  adId: adProps.adId,
                                  availabilityDate: adProps.availabilityDate,
                                  departureCity: adProps.routeFrom,
                                  destinationCity: adProps.routeTo,
                                  priceAndPaymentUnit:
                                      formatNumber(String(adProps.price)) +
                                      ' ' +
                                      (adProps.paymentUnit || ''),
                              }
                            : {
                                  adId: adProps.adId,
                                  availabilityDate: adProps.pickupDate,
                                  departureCity: adProps.routeFrom,
                                  destinationCity: adProps.routeTo,
                                  priceAndPaymentUnit: '',
                                  title: adProps.title || '',
                              }
                    }
                    chatPartnerName={owner.name}
                    chatPartnerPhoto={owner.photoUrl}
                    chatPartnerId={owner.id}
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

export default OtherAdProfile;
