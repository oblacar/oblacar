// ConversationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import ConversationService from '../services/ConversationService';
import TransportAdService from '../services/TransportAdService';
import ExtendedConversation from '../entities/Messages/ExtendedConversation';

import AuthContext from './Authorization/AuthContext';
import UserContext from './UserContext';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    //conversations - диалоги для пользователя
    const [conversations, setConversations] = useState([]);
    const [isConversationsLoaded, setIsConversationsLoaded] = useState(false);
    const { isAuthenticated, userId } = useContext(AuthContext);
    // const { user } = useContext(UserContext);
    const [unreadMessages, setUnreadMessages] = useState([]);

    useEffect(() => {
        if (isAuthenticated) {
            setIsConversationsLoaded(false);

            getUserConversations(userId);

            getUnreadMessagesByUserId(userId);
        }
        else{
            setUnreadMessages([]);
        }
    }, [isAuthenticated, userId]);

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
                    priceAndPaymentUnit: price + ' ' + paymentUnit || '',
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

    // currentConversation - Расширенный conversation, где messages - это массив сообщений, а не только их id
    const [currentConversation, setCurrentConversation] = useState(null);

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

    // Метод пытается получить "разговор" и записать его в "текщий разговор", если нет, то null
    const findConversation = async (adId, idParticipants) => {
        try {
            // Проверка на наличие разговора по `adId`
            const conversation =
                await ConversationService.getConversationByAdIdAndParticipantsId(
                    adId,
                    idParticipants
                );

            if (!conversation) {
                setCurrentConversation(null);
                return;
            }

            //Получаем массив сообщений для существующего conversation
            const messages =
                await ConversationService.getMessagesByConversationId(
                    conversation.conversationId
                );

            const extendedConversation = new ExtendedConversation({
                conversationId: conversation.conversationId,
                adId: conversation.adId,
                participants: conversation.participants,
                messages: messages,
            });

            setCurrentConversation(extendedConversation);
        } catch (error) {
            console.error('Ошибка при поиске разговора:', error);
            setCurrentConversation(null); // Обрабатываем ошибку, сбрасывая состояние
        }
    };

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

    // Метод отправки сообщений.
    // Очень важный метод, так как при первом отправлении создается conversation в коллекции
    const sendMessage = async (
        adId,
        senderId,
        recipientId,
        text,
        isDeliveryRequest = false
    ) => {
        try {
            // Локально добавляем сообщение для мгновенного отображения
            const newMessage = {
                messageId: `temp-${Date.now()}`, // Временный ID для локального отображения
                conversationId: currentConversation?.conversationId || null, //TODO нужно сделать такой же метод для отправки из чата
                senderId,
                recipientId,
                adId,
                text,
                timestamp: Date.now(),
                isRead: false,
                isDeliveryRequest,
            };

            if (!currentConversation) {
                // Создаем расширенный разговор (ExtendedConversation) с полным массивом объектов сообщений
                const extendedConversation = new ExtendedConversation({
                    adId: currentConversationBasicData.adId,
                    participants: currentConversationBasicData.participants,
                });

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
                // Разговор не существует, создаем новый в фоне
                const newConversation =
                    await ConversationService.createConversation(
                        currentConversationBasicData.adId,
                        currentConversationBasicData.participants
                    );

                conversationId = newConversation.conversationId;

                // Сохраняем текущий расширенный разговор в состоянии
                setCurrentConversation((prevConversation) => ({
                    ...prevConversation,
                    conversationId: conversationId,
                }));
                // setCurrentConversation(extendedConversation);
            }

            // Сохраняем сообщение на сервере после создания разговора
            await ConversationService.addMessage(
                conversationId,
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
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export default ConversationContext;
