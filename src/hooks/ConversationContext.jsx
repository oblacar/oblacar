// ConversationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import ConversationService from '../services/ConversationService';
import ExtendedConversation from '../entities/Messages/ExtendedConversation';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
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

            const extendedConversation = new ExtendedConversation(
                conversation.conversationId,
                conversation.adId,
                conversation.participants,
                messages
            );

            setCurrentConversation(extendedConversation);
        } catch (error) {
            console.error('Ошибка при поиске разговора:', error);
            setCurrentConversation(null); // Обрабатываем ошибку, сбрасывая состояние
        }
    };

    useEffect(() => {
        console.log(currentConversation);
    }, [currentConversation]);

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
                conversationId: currentConversation?.conversationId || null,
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
                const extendedConversation = new ExtendedConversation(
                    null,
                    currentConversationBasicData.adId,
                    currentConversationBasicData.participants,
                    []
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
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export default ConversationContext;
