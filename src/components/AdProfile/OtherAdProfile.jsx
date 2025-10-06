// src/components/AdProfile/OtherAdProfile.jsx
import React, {
    useContext,
    useEffect,
    useState,
    useMemo,
    useCallback,
} from 'react';
import './OtherAdProfile.css';

// 1. ИМПОРТЫ
// -------------------------------------------------------------------
// Контексты
import CargoAdsContext from '../../hooks/CargoAdsContext';
import TransportAdContext from '../../hooks/TransportAdContext';
import ConversationContext from '../../hooks/ConversationContext';
import UserContext from '../../hooks/UserContext';
import TransportationContext from '../../hooks/TransportationContext';

// Утилиты
import { formatNumber } from '../../utils/helper';

// Компоненты (Общие/Переиспользуемые)
import Button from '../common/Button/Button';
import ChatBox from '../common/ChatBox/ChatBox';
import Preloader from '../common/Preloader/Preloader';
import ModalBackdrop from '../common/ModalBackdrop/ModalBackdrop';
import ConversationLoadingInfo from '../common/ConversationLoadingInfo/ConversationLoadingInfo';
import UserSmallCard from '../common/UserSmallCard/UserSmallCard';
import IconWithTooltip from '../common/IconWithTooltip/IconWithTooltip';

// Компоненты (Специфичные для этой фичи)
import RequestStatusBlock from './RequestStatusBlock';
import OtherTransportAdDetails from './OtherTransportAdDetails';
import OtherCargoAdDetails from './OtherCargoAdDetails';

// Иконки
import { FaEnvelope } from 'react-icons/fa';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';

const OtherAdProfile = ({ adType, ad }) => {
    // 2. КОНТЕКСТЫ (useContext)
    // -------------------------------------------------------------------

    // --- 1. Контекст ГРУЗОВ (CargoAdsContext) ---
    const {
        addReviewAd: cargoAddReview, // 'addReviewAd' -> cargoAddReview
        removeReviewAd: cargoRemoveReview, // 'removeReviewAd' -> cargoRemoveReview
        reviewAds: cargoReviewedIds, // 'reviewAds' (список ID) -> cargoReviewedIds
        isReviewed: cargoIsReviewed, // 'isReviewed' -> cargoIsReviewed (Возможно, undefined)
    } = useContext(CargoAdsContext) || {};

    // --- 2. Контекст ТРАНСПОРТА (TransportAdContext) ---
    const {
        loadReviewAds: transportLoadReviewAds, // Добавили извлечение метода загрузки
        addReviewAd: transportAddReview, // 'addReviewAd' -> transportAddReview
        removeReviewAd: transportRemoveReview, // 'removeReviewAd' -> transportRemoveReview
        isReviewed: transportIsReviewed, // 'isReviewed' -> transportIsReviewed
    } = useContext(TransportAdContext) || {};

    const {
        currentConversation,
        setCurrentConversationState,
        isConversationsLoaded,
    } = useContext(ConversationContext);
    const { user } = useContext(UserContext);
    const {
        sendTransportationRequest,
        getAdTransportationRequestByAdId,
        adTransportationRequests,
        cancelTransportationRequest,
        restartTransportationRequest,
    } = useContext(TransportationContext);

    // 3. СТЕЙТ (useState) - Локальное состояние компонента
    // -------------------------------------------------------------------
    const [isLoading, setIsLoading] = useState(true);
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const [isModalBackShow, setIsModalBackShow] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);

    // Логика кнопки "Варианты" (Bookmark)
    const [isInReviewAds, setIsInReviewAds] = useState(false);

    // Логика "Запроса Перевозчику" (только для транспорта)
    const [cargoDescription, setCargoDescription] = useState('');
    const [adRequestStatus, setAdRequestStatus] = useState('none');
    const [adTransportationRequest, setAdTransportationRequest] =
        useState(null);
    const [isTransportationRequestSending, setIsTransportationRequestSending] =
        useState(false);
    const [requestId, setRequestId] = useState(null);

    // 4. ЧИСТЫЕ ВЫЧИСЛЕНИЯ / НОРМАЛИЗАЦИЯ ДАННЫХ
    // (Используются в хуках и обработчиках, должны быть выше их)
    // -------------------------------------------------------------------
    // Нормализуем вход
    const data = ad?.ad && typeof ad.ad === 'object' ? ad.ad : ad;

    // 1) Владелец
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

    // 2) Поля объявления
    const adId = data?.adId ?? null;
    const availabilityDate =
        adType === 'transport'
            ? data?.availabilityDate ?? ''
            : data?.pickupDate ?? '';
    const routeFrom = data?.departureCity ?? '';
    const routeTo = data?.destinationCity ?? '';
    const price = data?.price ?? '';
    const paymentUnit = data?.paymentUnit ?? '';
    const title = adType === 'cargo' ? data?.title ?? '' : '';
    const pickupDate = adType === 'cargo' ? data?.pickupDate ?? '' : '';
    const deliveryDate = adType === 'cargo' ? data?.deliveryDate ?? '' : '';

    // 5. MEMOИЗИРОВАННЫЕ ВЫЧИСЛЕНИЯ (useMemo)

    const reviewApi = useMemo(() => {
        // --- Логика для ТРАНСПОРТА (Transport) ---
        if (adType === 'transport') {
            return {
                add: transportAddReview,
                remove: transportRemoveReview,
                // Для упрощения API, используем add/remove как заглушку для toggle
                toggle: transportAddReview || transportRemoveReview,

                // Используем метод isReviewed из транспортного контекста
                isReviewed: transportIsReviewed,

                // Здесь нет отдельного списка reviewedIds, поэтому ставим заглушку
                reviewedIds: undefined,
            };
        }

        // --- Логика для ГРУЗОВ (Cargo - по умолчанию) ---
        return {
            add: cargoAddReview,
            remove: cargoRemoveReview,
            toggle: cargoAddReview || cargoRemoveReview,

            // Используем метод isReviewed из контекста грузов (если есть, иначе undefined)
            isReviewed: cargoIsReviewed,

            // Используем список ID из контекста грузов
            reviewedIds: cargoReviewedIds,
        };
    }, [
        adType,
        // Зависимости: все извлеченные алиасы
        cargoAddReview,
        cargoRemoveReview,
        cargoIsReviewed,
        cargoReviewedIds,
        transportAddReview,
        transportRemoveReview,
        transportIsReviewed,
        // transportLoadReviewAds не нужен здесь, т.к. не используется в этом блоке.
    ]);

    // 6. ОБРАБОТЧИКИ (Функции, use*Callback)
    // -------------------------------------------------------------------

    // Обработчик кнопки "Варианты" (Bookmark)
    const handleToggleReviewAd = useCallback(
        async (e) => {
            e?.stopPropagation?.();
            if (!adId) return;

            try {
                // ... ваша логика добавления/удаления ...
                if (isInReviewAds) {
                    if (typeof reviewApi.remove === 'function')
                        await reviewApi.remove(adId);
                    else if (typeof reviewApi.toggle === 'function')
                        await reviewApi.toggle(adId);
                    setIsInReviewAds(false);
                } else {
                    if (typeof reviewApi.add === 'function')
                        await reviewApi.add(adId);
                    else if (typeof reviewApi.toggle === 'function')
                        await reviewApi.toggle(adId);
                    setIsInReviewAds(true);
                }
            } catch (err) {
                console.error('[OtherAdProfile] toggle review error:', err);
            }
        },
        [adId, isInReviewAds, reviewApi]
    );

    // Обработчики (чат)
    const handleStartChat = () => {
        setIsLoadingConversation(true);
        setIsChatBoxOpen(true);
        if (!isConversationsLoaded) setIsModalBackShow(true);
    };
    const handleCloseModalBack = () => {
        setIsModalBackShow(false);
        setIsChatBoxOpen(false);
    };

    // Обработчики (заявка перевозчику — ТОЛЬКО ТРАНСПОРТ)
    const handleSendRequest = async () => {
        // ... ваша логика handleSendRequest ...
    };
    const handleCancelRequest = async () => {
        // ... ваша логика handleCancelRequest ...
    };
    const handleRestartRequest = async () => {
        // ... ваша логика handleRestartRequest ...
    };

    // 7. ЭФФЕКТЫ (useEffect)
    // -------------------------------------------------------------------

    // 7.1. Первичная загрузка
    useEffect(() => {
        if (data) setIsLoading(false);
    }, [data]);

    // 7.2. Инициализация/Синхронизация закладки
    useEffect(() => {
        if (!adId) return;
        try {
            const val =
                typeof reviewApi.isReviewed === 'function'
                    ? !!reviewApi.isReviewed(adId)
                    : Array.isArray(reviewApi.reviewedIds) &&
                      reviewApi.reviewedIds.includes(adId);
            setIsInReviewAds(val);
        } catch {
            /* молча */
        }
        // Реагируем на изменения списка в контексте
    }, [adId, reviewApi.isReviewed, reviewApi.reviewedIds]);

    // 7.3. Статусы запросов (ТОЛЬКО ДЛЯ ТРАНСПОРТА)
    useEffect(() => {
        // ... ваша логика статусов запросов ...
        if (adType !== 'transport' || !adTransportationRequests || !adId)
            return;
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
    }, [
        adTransportationRequests,
        adType,
        adId,
        getAdTransportationRequestByAdId,
    ]);

    // 7.4. Чат-привязка
    useEffect(() => {
        if (!isConversationsLoaded || !isChatBoxOpen || !data) return;
        // порядок: (adId, currentUserId, otherUserId)
        setCurrentConversationState(adId, user?.userId, owner.id);
        setIsModalBackShow(false);
    }, [
        isConversationsLoaded,
        isChatBoxOpen,
        adId,
        user?.userId,
        owner.id,
        setCurrentConversationState,
        data,
    ]);

    // 7.5. Загрузка разговора
    useEffect(() => {
        setIsLoadingConversation(false);
    }, [isChatBoxOpen, currentConversation]);

    // 8. ФУНКЦИИ РЕНДЕРИНГА И РАННИЙ ВЫХОД
    // -------------------------------------------------------------------

    // Выбор компонента деталей
    const Details =
        adType === 'cargo' ? OtherCargoAdDetails : OtherTransportAdDetails;

    // Вложенный компонент правой панели
    const RightPanel = () => (
        <div className='other-ad-profile-owner-data'>
            <UserSmallCard
                photoUrl={owner.photoUrl}
                rating={owner.rating}
                name={owner.name}
                onMessageClick={handleStartChat}
                isLoading={false}
            />

            {/* ... JSX для отправки запроса / кнопки чата ... */}
            {/* ... ваш остальной JSX RightPanel ... */}

            {adType === 'transport' ? (
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

    // Ранний выход
    if (isLoading) {
        return <div className='loading'>Загрузка объявления...</div>;
    }

    // 9. ОСНОВНОЙ РЕНДЕРИНГ (return JSX)
    // -------------------------------------------------------------------
    return (
        <>
            <div className='other-ad-profile'>
                {/* 1. Кнопка "Варианты" (Bookmark) */}
                {isInReviewAds ? (
                    <div className={`oap-in-review oap-in-review--is-active`}>
                        <IconWithTooltip
                            icon={FaBookmark}
                            tooltipText='Убрать из Вариантов'
                            onClick={handleToggleReviewAd}
                        />
                    </div>
                ) : (
                    <div className={`oap-in-review`}>
                        <IconWithTooltip
                            icon={FaRegBookmark}
                            tooltipText='Добавить в Варианты'
                            onClick={handleToggleReviewAd}
                        />
                    </div>
                )}

                {/* 2. Детали объявления */}
                <div className='other-ad-profile-main-data'>
                    <Details ad={data} />
                </div>

                {/* 3. Правая панель с контактами/запросом */}
                <RightPanel />
            </div>

            {/* 4. Чат и модальные окна (рендерим вне основного блока) */}
            {isChatBoxOpen && isConversationsLoaded && (
                <ChatBox
                    onClose={() => setIsChatBoxOpen(false)}
                    // ... пропсы чатбокса ...
                    adData={
                        adType === 'transport'
                            ? {
                                  adId,
                                  availabilityDate,
                                  departureCity: routeFrom,
                                  destinationCity: routeTo,
                                  priceAndPaymentUnit:
                                      formatNumber(String(price)) +
                                      ' ' +
                                      (paymentUnit || ''),
                              }
                            : {
                                  adId,
                                  availabilityDate: pickupDate,
                                  departureCity: routeFrom,
                                  destinationCity: routeTo,
                                  priceAndPaymentUnit: '',
                                  title: title || '',
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
                    onClose={() => setIsModalBackShow(false)}
                />
            )}
        </>
    );
};

export default OtherAdProfile;
