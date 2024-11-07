// ConversationContext.js
import React, { createContext, useContext, useState } from 'react';
import ConversationService from '../services/ConversationService';
import ExtendedConversation from '../entities/Messages/ExtendedConversation';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    // const [conversations, setConversations] = useState([]);
    // const [selectedConversation, setSelectedConversation] = useState(null);

    // const getConversation = async (adId, userId) => {
    //     const conversation = await ConversationService.findConversationByAdId(
    //         adId,
    //         userId
    //     );
    //     setSelectedConversation(conversation);
    //     return conversation;
    // };

    // const startConversation = async (adId, participants) => {
    //     let conversation = await getConversation(adId, participants[0]);

    //     if (!conversation) {
    //         conversation = await ConversationService.createConversation(
    //             adId,
    //             participants
    //         );
    //         setConversations((prev) => [...prev, conversation]);
    //     }

    //     setSelectedConversation(conversation);
    //     return conversation;
    // };

    //Методы, который начали делать с нуля со второй попытки

    // Метод начать разговор
    const [currentConversation, setCurrentConversation] = useState(null);

    const startConversation = async (adId, participants) => {
        try {
            // Ищем разговор по adId
            let conversation = await ConversationService.getConversationByAdId(
                adId
            );

            if (!conversation) {
                // Если разговор не найден, создаем новый
                conversation = await ConversationService.createConversation(
                    adId,
                    participants
                );
            }

            // Получаем все сообщения для данного разговора
            const messages =
                await ConversationService.getMessagesByConversationId(
                    conversation.conversationId
                );

            // Создаем расширенный разговор (ExtendedConversation) с полным массивом объектов сообщений
            const extendedConversation = new ExtendedConversation(
                conversation.conversationId,
                conversation.adId,
                conversation.participants,
                messages
            );

            // Сохраняем текущий расширенный разговор в состоянии
            setCurrentConversation(extendedConversation);

            return extendedConversation;
        } catch (error) {
            console.error('Ошибка при запуске разговора:', error);
            throw error;
        }
    };

    // const [conversations, setConversations] = useState({});
    const sendMessage = (
        conversationId,
        senderId,
        recipientId,
        adId,
        text,
        isDeliveryRequest = false
    ) => {
        // Создаем временное сообщение, чтобы сразу обновить интерфейс
        const tempMessage = {
            messageId: `temp-${Date.now()}`, // Временный ID
            conversationId,
            senderId,
            recipientId,
            adId,
            text,
            timestamp: Date.now(),
            isRead: false,
            isDeliveryRequest,
        };

        // Обновляем интерфейс сразу
        setCurrentConversation((prevConversation) => ({
            ...prevConversation,
            messages: [...prevConversation.messages, tempMessage],
        }));

        // Асинхронно отправляем сообщение на сервер
        ConversationService.addMessage(
            conversationId,
            senderId,
            recipientId,
            adId,
            text,
            isDeliveryRequest
        )
            .then((message) => {
                // Заменяем временное сообщение на сообщение из базы, если оно успешно записано
                setCurrentConversation((prevConversation) => ({
                    ...prevConversation,
                    messages: prevConversation.messages.map((msg) =>
                        msg.messageId === tempMessage.messageId ? message : msg
                    ),
                }));
            })
            .catch((error) => {
                console.error('Ошибка при отправке сообщения:', error);
                // Обрабатываем ошибку, если нужно удалить временное сообщение или показать уведомление
            });
    };

    return (
        <ConversationContext.Provider
            value={{
                // conversations,
                // selectedConversation,
                // getConversation,
                // setSelectedConversation,

                startConversation,
                currentConversation,
                sendMessage,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export default ConversationContext;
