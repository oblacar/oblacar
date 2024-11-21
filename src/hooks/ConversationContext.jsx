// ConversationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import ConversationService from '../services/ConversationService';
import TransportAdService from '../services/TransportAdService';
import ExtendedConversation from '../entities/Messages/ExtendedConversation';

import AuthContext from './Authorization/AuthContext';
import UserContext from './UserContext';

import { formatNumber } from '../utils/helper';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    //conversations - Расширенные диалоги для пользователя
    const [conversations, setConversations] = useState([]);
    const [isConversationsLoaded, setIsConversationsLoaded] = useState(false);
    const { isAuthenticated, userId } = useContext(AuthContext);
    // const { user } = useContext(UserContext);
    const [unreadMessages, setUnreadMessages] = useState([]);
    // currentConversation - Расширенный conversation, где messages - это массив сообщений, а не только их id
    // это очень важный стейт. Если он null то будет создаваться новый разговор.
    // TODO - баг, если начать разговор из Запросов, то после перезагрузки не находит разговор.
    const [currentConversation, setCurrentConversation] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            setIsConversationsLoaded(false);

            getUserConversations(userId);

            getUnreadMessagesByUserId(userId);
        } else {
            setUnreadMessages([]);
        }
    }, [isAuthenticated, userId]);

    useEffect(() => {
        if (currentConversation) {
            console.log('Стейт currentConv: ', currentConversation);

            console.log('Стейт c-s: ', conversations);

            // updateConversationsState(currentConversation);
        }
    }, [currentConversation, conversations]);

    const getUnreadMessagesByUserId = async (userId) => {
        try {
            const unreadMessages =
                await ConversationService.getUnreadMessagesByUserId(userId);

            console.log('unreadMessages: ', unreadMessages);

            setUnreadMessages(unreadMessages);
        } catch (error) {
            console.error('Ошибка при поиске разговоров:', error);
            setUnreadMessages([]);
        }
    };

    /**
     * Обновляет массив расширенных разговоров conversations в стейте на основе текущего разговора.
     * Используется при отправке сообщений из Чата Запросов и Объявлений
     * @param {Object} currentConversation - Текущий разговор, который нужно добавить или обновить.
     */
    const updateConversationsState = (currentConversation) => {
        setConversations((prevConversations) => {
            if (!currentConversation || !currentConversation.conversationId) {
                console.error('Некорректный текущий разговор.');
                return prevConversations;
            }

            // Проверяем, существует ли разговор с таким conversationId
            const existingConversationIndex = prevConversations.findIndex(
                (conversation) =>
                    conversation.conversationId ===
                    currentConversation.conversationId
            );

            if (existingConversationIndex !== -1) {
                // Обновляем существующий разговор
                const updatedConversations = [...prevConversations];
                updatedConversations[existingConversationIndex] = {
                    ...updatedConversations[existingConversationIndex],
                    ...currentConversation,
                };

                console.log(
                    'Обновляем стейт, ищем ошибки: ',
                    updatedConversations
                );

                return updatedConversations;
            } else {
                // Добавляем новый разговор
                return [...prevConversations, currentConversation];
            }
        });
    };

    const getUserConversations = async (userId) => {
        try {
            // Получаем массив стандартных разговоров
            const conversations =
                await ConversationService.getUserConversations(userId);

            // Создаем массив для хранения расширенных разговоров
            const extendedConversations = [];

            for (const conversation of conversations) {
                const {
                    conversationId,
                    adId,
                    participants,
                    messages,
                    lastMessage,
                } = conversation;

                // Получаем логистическую информацию по adId
                const adData = await TransportAdService.getAdById(adId);

                const {
                    availabilityDate,
                    departureCity,
                    destinationCity,
                    price,
                    paymentUnit,
                } = adData || {}; // Если данных нет, значения будут undefined

                console.log('messages для расширенного объекта:', messages);

                //Получаем массив сообщений для массива Id messages
                const conversationMessages =
                    await ConversationService.getMessagesByIds(messages);

                // Создаем расширенный разговор
                const extendedConversation = new ExtendedConversation({
                    conversationId: conversationId,
                    adId: adId,
                    availabilityDate: availabilityDate || '',
                    departureCity: departureCity || '',
                    destinationCity: destinationCity || '',
                    priceAndPaymentUnit:
                        formatNumber(String(price)) + ' ' + paymentUnit || '',
                    participants: participants,
                    messages: conversationMessages,
                    lastMessage: lastMessage || null,
                });

                // Добавляем расширенный разговор в массив
                extendedConversations.push(extendedConversation);
            }

            // Устанавливаем массив расширенных разговоров в состояние
            setConversations(extendedConversations);
            setIsConversationsLoaded(true);
        } catch (error) {
            console.error('Ошибка при поиске разговоров:', error);
            setConversations([]);
        }
    };

    // Основные данные разговора. Важно передавать данные в заданном формате
    const initialBasicConversationData = {
        adId: '',
        participants: [
            {
                userId: '',
                userName: '',
                userPhotoUrl: '',
            },
            {
                userId: '',
                userName: '',
                userPhotoUrl: '',
            },
        ],
    };
    const [currentConversationBasicData, setCurrentConversationBasicData] =
        useState(initialBasicConversationData);

    const setBasicConversationData = (basicConversationData) => {
        setCurrentConversationBasicData(basicConversationData);
    };

    const clearBasicConversationData = () => {
        setCurrentConversationBasicData(initialBasicConversationData);
    };

    /**
     * Возвращает массив Расширенных разговоров из стейта,
     * связанных с указанным номером объявления (adId).
     *
     * @param {string} adId - Идентификатор объявления для фильтрации.
     * @param {Array} conversations - Массив разговоров.
     * @returns {Array} - Массив разговоров с совпадающим adId, или пустой массив, если входные данные некорректны.
     */
    const getConversationsByAdId = (adId, conversations) => {
        if (!adId || !Array.isArray(conversations)) {
            console.error('Invalid adId or conversations array');
            return [];
        }

        return conversations.filter(
            (conversation) => conversation.adId === adId
        );
    };

    // Метод пытается получить "разговор" из Сервиса (бд)
    // и записать расширеный разговор в "текщий разговор", если нет, то null
    // Сначала проверим разговор в Стейте, и вернем его в currentConversation
    // TODO проверяем...ы

    const findConversation = async (adId, idParticipants) => {
        try {
            // Проверяем сначала в локальном массиве conversations
            const localConversation = conversations.find((conversation) => {
                return (
                    conversation.adId === adId &&
                    idParticipants.every((id) =>
                        conversation.participants.some(
                            (participant) => participant.userId === id
                        )
                    )
                );
            });

            if (localConversation) {
                // Если разговор найден локально, устанавливаем его в currentConversation
                setCurrentConversation(localConversation);
                return;
            }
            //TODO блок формирования нового разговора нужно еще проверять
            // Если разговор не найден локально, ищем в базе данных через сервис
            const conversation =
                await ConversationService.getConversationByAdIdAndParticipantsId(
                    adId,
                    idParticipants
                );

            if (!conversation) {
                setCurrentConversation(null);
                return;
            }

            // Получаем массив сообщений для существующего conversation из базы
            const messages =
                await ConversationService.getMessagesByConversationId(
                    conversation.conversationId
                );

            // Создаём расширенный разговор
            const extendedConversation = new ExtendedConversation({
                conversationId: conversation.conversationId,
                adId: conversation.adId,
                participants: conversation.participants,
                messages: messages,
            });

            // Устанавливаем разговор в currentConversation
            setCurrentConversation(extendedConversation);
        } catch (error) {
            console.error('Ошибка при поиске разговора:', error);
            setCurrentConversation(null); // Сбрасываем состояние в случае ошибки
        }
    };

    // const findConversation = async (adId, idParticipants) => {
    //     try {
    //         // Проверка на наличие разговора по `adId`
    //         const conversation =
    //             await ConversationService.getConversationByAdIdAndParticipantsId(
    //                 adId,
    //                 idParticipants
    //             );

    //         if (!conversation) {
    //             setCurrentConversation(null);
    //             return;
    //         }

    //         //Получаем массив сообщений для существующего conversation
    //         const messages =
    //             await ConversationService.getMessagesByConversationId(
    //                 conversation.conversationId
    //             );

    //         const extendedConversation = new ExtendedConversation({
    //             conversationId: conversation.conversationId,
    //             adId: conversation.adId,
    //             participants: conversation.participants,
    //             messages: messages,
    //         });

    //         setCurrentConversation(extendedConversation);
    //     } catch (error) {
    //         console.error('Ошибка при поиске разговора:', error);
    //         setCurrentConversation(null); // Обрабатываем ошибку, сбрасывая состояние
    //     }
    // };

    // Метод отправки сообщений из списка Диалогов.
    // Основное отличие от sendMessage в том, что conversation уже существует.
    const sendChatInterfaceMessage = async (
        adId,
        senderId,
        recipientId,
        text,
        isDeliveryRequest = false
    ) => {
        try {
            const conversation = conversations.find(
                (conv) => conv.adId === adId
            );

            if (!conversation) {
                return;
            }

            // Локально добавляем сообщение для мгновенного отображения
            const newMessage = {
                messageId: `temp-${Date.now()}`, // Временный ID для локального отображения
                conversationId: conversation.conversationId,
                senderId,
                recipientId,
                adId,
                text,
                timestamp: Date.now(),
                isRead: false,
                isDeliveryRequest,
            };

            // Обновляем локальный интерфейс чата
            setConversations((prevConversations) =>
                prevConversations.map((conv) =>
                    conv.conversationId === conversation.conversationId
                        ? {
                              ...conv,
                              messages: [...conv.messages, newMessage],
                          }
                        : conv
                )
            );

            // Сохраняем сообщение на сервере после создания разговора
            await ConversationService.addMessage(
                conversation.conversationId,
                senderId,
                recipientId,
                adId,
                text,
                isDeliveryRequest
            );

            console.log('Сообщение отправлено и сохранено в базе');
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            // Дополнительно: можно добавить обработку ошибки для уведомления пользователя
        }
    };

    /**
     * Получает расширенный разговор из массива conversations.
     * @param {Array} conversations - Массив разговоров.
     * @param {string} adId - ID объявления.
     * @param {string} senderId - ID отправителя.
     * @param {string} recipientId - ID получателя.
     * @returns {Object|null} Расширенный разговор или null, если не найден.
     */
    const getExtendedConversation = (
        conversations,
        adId,
        senderId,
        recipientId
    ) => {
        if (
            !Array.isArray(conversations) ||
            !adId ||
            !senderId ||
            !recipientId
        ) {
            console.error('Некорректные параметры для поиска разговора.');
            return null;
        }

        return (
            conversations.find((conversation) => {
                // Проверяем совпадение adId
                if (conversation.adId !== adId) {
                    return false;
                }

                // Проверяем участников разговора
                const participantIds = conversation.participants.map(
                    (p) => p.userId
                );
                return (
                    participantIds.includes(senderId) &&
                    participantIds.includes(recipientId)
                );
            }) || null
        );
    };

    // Метод отправки сообщений.
    // Очень важный метод, так как при первом отправлении создается conversation в коллекции
    const sendMessage = async (
        adId,
        // senderId,
        // recipientId,

        sender = {
            userId: '',
            userName: '',
            userPhotoUrl: '',
        },
        recipient = {
            userId: '',
            userName: '',
            userPhotoUrl: '',
        },

        text,
        isDeliveryRequest = false
    ) => {
        try {
            // Локально добавляем сообщение для мгновенного отображения
            const newMessage = {
                messageId: `temp-${Date.now()}`, // Временный ID для локального отображения
                conversationId: currentConversation?.conversationId || null, //TODO нужно сделать такой же метод для отправки из чата
                senderId: sender.userId,
                recipientId: recipient.userId,
                adId,
                text,
                timestamp: Date.now(),
                isRead: false,
                isDeliveryRequest,
            };

            // console.log('Мы в sendMessage');

            // if (currentConversation)
            //     console.log('текущий разговор есть: ', currentConversation);

            if (!currentConversation) {
                //Нужно перепроверить, а точно ли нет currentConversation.
                //Если все же есть в стейте, то обновим стейт текущего разговора.
                const findedExtendedConversation = getExtendedConversation(
                    conversations,
                    adId,
                    sender.userId,
                    recipient.userId
                );

                // console.log(
                //     'Разговора нет в списке разговоров: ',
                //     findedExtendedConversation
                // );

                setCurrentConversation(findedExtendedConversation);
            }

            if (!currentConversation) {
                //Нужно перепроверить, а точно ли нет такого разговора в бд.
                //Если все же есть, то обносить стейт текущего разговора.

                findConversation(adId, [sender.userId, recipient.userId]);

                console.log(
                    'Поискали разговор в массиве, добавил: ',
                    currentConversation
                );
            }

            if (!currentConversation) {
                // Создаем расширенный разговор (ExtendedConversation) с полным массивом объектов сообщений
                // const extendedConversation = new ExtendedConversation({
                //     adId: currentConversationBasicData.adId,
                //     participants: currentConversationBasicData.participants,
                // });

                //TODO Сейчас неправильно создается Новый Расширенный разговор.
                //Мы его делаем здесь для ускорения, а асинхронно загружаем в БД
                const extendedConversation = new ExtendedConversation({
                    adId: adId,
                    participants: [sender, recipient],
                });

                console.log(
                    'Разговора нет. Создали и добавили в стей: ',
                    extendedConversation
                );

                setCurrentConversation(extendedConversation);
            }

            // Обновляем локальный интерфейс чата
            setCurrentConversation((prevConversation) => ({
                ...prevConversation,
                messages: [...(prevConversation?.messages || []), newMessage],
            }));

            // Проверяем существование разговора
            let conversationId = currentConversation?.conversationId;

            if (!conversationId) {
                //TODO мне кажется, что этот блок проверки дублирует логику сверху.
                // Нужно проверять логи, заходит ли сюда вообще.
                // Разговор не существует, создаем новый в фоне

                console.log('adId: ', adId);

                //    senderId,
                //         recipientId,

                const participants = [sender, recipient];

                console.log('usery: ', participants);

                const newConversation =
                    // await ConversationService.createConversation(
                    //     currentConversationBasicData.adId,
                    //     currentConversationBasicData.participants
                    // );
                    await ConversationService.createConversation(
                        adId,
                        participants
                    );

                conversationId = newConversation.conversationId;

                // Сохраняем текущий расширенный разговор в состоянии
                setCurrentConversation((prevConversation) => ({
                    ...prevConversation,
                    conversationId: conversationId,
                }));
                // setCurrentConversation(extendedConversation);
            }

            // Обновляем локальный интерфейс чата - метод скопирован из отправки из чата
            setConversations((prevConversations) =>
                prevConversations.map((conv) =>
                    conv.conversationId === currentConversation.conversationId
                        ? {
                              ...conv,
                              messages: [...conv.messages, newMessage],
                          }
                        : conv
                )
            );

            // Сохраняем сообщение на сервере после создания разговора
            await ConversationService.addMessage(
                conversationId,
                sender.userId,
                recipient.userId,
                adId,
                text,
                isDeliveryRequest
            );

            console.log('Сообщение отправлено и сохранено в базе');
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            // Дополнительно: можно добавить обработку ошибки для уведомления пользователя
        }
    };

    const clearConversation = () => {
        setCurrentConversation(null);
    };

    return (
        <ConversationContext.Provider
            value={{
                findConversation,
                currentConversation,
                sendMessage,
                clearConversation,

                // методы задающие базовые данные для разговора
                setBasicConversationData,
                clearBasicConversationData,
                //Методы для чат-листа
                conversations,
                getUserConversations,
                sendChatInterfaceMessage,
                isConversationsLoaded,
                unreadMessages,

                getConversationsByAdId,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export default ConversationContext;
