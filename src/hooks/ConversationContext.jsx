// ConversationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import ConversationService from '../services/ConversationService';
import TransportAdService from '../services/TransportAdService';
import ExtendedConversation from '../entities/Messages/ExtendedConversation';

import AuthContext from './Authorization/AuthContext';

import { formatNumber } from '../utils/helper';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    //conversations - Расширенные диалоги для пользователя
    const [conversations, setConversations] = useState([]);

    // Флаг готовности контекста. Является событием для прогрузки разговоров: текущего и вообще
    const [isConversationsLoaded, setIsConversationsLoaded] = useState(false);
    const { isAuthenticated, userId } = useContext(AuthContext);
    const [unreadMessages, setUnreadMessages] = useState([]);

    // currentConversation - Расширенный conversation, где messages - это массив сообщений, а не только их id
    // это очень важный стейт. Если он null то будет создаваться новый разговор.
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
            setConversations((prevConversations) => {
                const index = prevConversations.findIndex(
                    (conv) =>
                        conv.conversationId ===
                        currentConversation.conversationId
                );

                if (index === -1) {
                    return [...prevConversations, currentConversation];
                }

                return prevConversations.map((conv, i) =>
                    i === index
                        ? {
                              ...conv,
                              messages: [...currentConversation.messages],
                          }
                        : conv
                );
            });
        } else {
            console.log(
                'currentConversation отсутствует, обновления conversations не требуется'
            );
        }
    }, [currentConversation]);

    const getUnreadMessagesByUserId = async (userId) => {
        try {
            const unreadMessages =
                await ConversationService.getUnreadMessagesByUserId(userId);

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
    //TODO метод нужно изучить и возможно его в хуке обновления использовать, сейчас там код
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
    // TODO как информация - полезно, но не уверен, что мы с этим работаем
    // const initialBasicConversationData = {
    //     adId: '',
    //     participants: [
    //         {
    //             userId: '',
    //             userName: '',
    //             userPhotoUrl: '',
    //         },
    //         {
    //             userId: '',
    //             userName: '',
    //             userPhotoUrl: '',
    //         },
    //     ],
    // };

    //TODO Это тоже нужно проверить, кажется, что мы эти данные не используем
    // const [currentConversationBasicData, setCurrentConversationBasicData] =
    //     useState(initialBasicConversationData);
    // //TODO Это тоже нужно проверить, кажется, что мы эти данные не используем
    // const setBasicConversationData = (basicConversationData) => {
    //     setCurrentConversationBasicData(basicConversationData);
    // };
    // //TODO Это тоже нужно проверить, кажется, что мы эти данные не используем
    // const clearBasicConversationData = () => {
    //     setCurrentConversationBasicData(initialBasicConversationData);
    // };

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
    // TODO проверяем...Кажется. что сейчас этот метод не нужен, т.к. есть аналогичный setCurrentConversationState
    // const findConversation = async (adId, idParticipants) => {
    //     try {
    //         // Проверяем сначала в локальном массиве conversations
    //         const localConversation = conversations.find((conversation) => {
    //             return (
    //                 conversation.adId === adId &&
    //                 idParticipants.every((id) =>
    //                     conversation.participants.some(
    //                         (participant) => participant.userId === id
    //                     )
    //                 )
    //             );
    //         });

    //         if (localConversation) {
    //             // Если разговор найден локально, устанавливаем его в currentConversation
    //             setCurrentConversation(localConversation);
    //             return;
    //         }
    //         //TODO блок формирования нового разговора нужно еще проверять
    //         // Если разговор не найден локально, ищем в базе данных через сервис
    //         const conversation =
    //             await ConversationService.getConversationByAdIdAndParticipantsId(
    //                 adId,
    //                 idParticipants
    //             );

    //         if (!conversation) {
    //             setCurrentConversation(null);
    //             return;
    //         }

    //         // Получаем массив сообщений для существующего conversation из базы
    //         const messages =
    //             await ConversationService.getMessagesByConversationId(
    //                 conversation.conversationId
    //             );

    //         // Создаём расширенный разговор
    //         const extendedConversation = new ExtendedConversation({
    //             conversationId: conversation.conversationId,
    //             adId: conversation.adId,
    //             participants: conversation.participants,
    //             messages: messages,
    //         });

    //         console.log(
    //             'Расширенный разговор из поиска: ',
    //             extendedConversation
    //         );

    //         // Устанавливаем разговор в currentConversation
    //         setCurrentConversation(extendedConversation);
    //     } catch (error) {
    //         console.error('Ошибка при поиске разговора:', error);
    //         setCurrentConversation(null); // Сбрасываем состояние в случае ошибки
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

    //Очищаем Текущий разговор. Нужно использовать выходе из компоненты
    const clearCurrentConversation = () => {
        setCurrentConversation(null);
    };

    //Очищаем Текущий разговор. Нужно использовать выходе из компоненты
    const setCurrentConversationState = (adId, senderId, recipientId) => {
        const extendedConversation = getExtendedConversation(
            conversations,
            adId,
            senderId,
            recipientId
        );

        setCurrentConversation(extendedConversation);
    };

    // Метод отправки сообщений.
    // Очень важный метод, так как при первом отправлении создается conversation в коллекции
    //TODO меняем метод на получение базовой информации об объявлении
    const sendMessage = async (
        // adId,
        adData = {
            adId: '',
            availabilityDate: '',
            departureCity: '',
            destinationCity: '',
            priceAndPaymentUnit: '',
        },
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
        const {
            adId,
            availabilityDate,
            departureCity,
            destinationCity,
            priceAndPaymentUnit,
        } = adData;

        try {
            const newMessage = {
                messageId: `temp-${Date.now()}`,
                conversationId: currentConversation?.conversationId || null,
                senderId: sender.userId,
                recipientId: recipient.userId,
                adId,
                text,
                timestamp: Date.now(),
                isRead: false,
                isDeliveryRequest,
            };

            let conversation = new ExtendedConversation();
            conversation = currentConversation;

            if (!conversation) {
                conversation = getExtendedConversation(
                    conversations,
                    adId,
                    sender.userId,
                    recipient.userId
                );

                if (!conversation) {
                    conversation =
                        await ConversationService.getConversationByAdIdAndParticipantsId(
                            adId,
                            [sender.userId, recipient.userId]
                        );

                    if (!conversation) {
                        const participants = [sender, recipient];

                        const newConversation =
                            await ConversationService.createConversation(
                                adId,
                                participants
                            );

                        // Создаем новый объект ExtendedConversation
                        const newExtendedConversation =
                            new ExtendedConversation();

                        newExtendedConversation.conversationId =
                            newConversation.conversationId;
                        newExtendedConversation.adId = newConversation.adId;
                        newExtendedConversation.participants = [
                            sender,
                            recipient,
                        ];
                        newExtendedConversation.lastMessage = '';
                        newExtendedConversation.availabilityDate =
                            availabilityDate;
                        newExtendedConversation.departureCity = departureCity;
                        newExtendedConversation.destinationCity =
                            destinationCity;
                        newExtendedConversation.messages = [];
                        newExtendedConversation.priceAndPaymentUnit =
                            priceAndPaymentUnit;

                        conversation = newExtendedConversation;
                    }
                }
            }

            setCurrentConversation((prev) => ({
                ...conversation,
                messages: [...(prev?.messages || []), newMessage],
            }));

            await ConversationService.addMessage(
                conversation.conversationId,
                sender.userId,
                recipient.userId,
                adId,
                text,
                isDeliveryRequest
            );

            console.log('Сообщение успешно сохранено в базе');
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    };

    /**
     * Возвращает количество непрочитанных сообщений для конкретного объявления и получателя.
     * Статический метод для оторажения количества непрочитанных сообщений, например, в диалогах.
     * @param {Array} messages - Массив сообщений.
     * @param {string} adId - ID объявления.
     * @param {string} recipientId - ID получателя.
     * @returns {number} - Количество непрочитанных сообщений.
     */
    const countUnreadMessages = (messages, adId, recipientId) => {
        if (!Array.isArray(messages)) {
            console.error('messages должен быть массивом');
            return 0;
        }

        return messages.filter(
            (message) =>
                message.adId === adId &&
                message.recipientId === recipientId &&
                !message.isRead
        ).length;
    };

    return (
        <ConversationContext.Provider
            value={{
                // findConversation,
                currentConversation,
                sendMessage,

                // методы задающие базовые данные для разговора
                // setBasicConversationData,
                // clearBasicConversationData,
                //Методы для чат-листа
                conversations,
                getUserConversations,
                sendChatInterfaceMessage,
                isConversationsLoaded,
                unreadMessages,

                getConversationsByAdId,

                clearCurrentConversation,
                setCurrentConversationState,

                countUnreadMessages,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export default ConversationContext;
