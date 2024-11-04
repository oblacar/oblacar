// Объяснение работы ConversationContext
// Состояние:
// conversations: список переписок пользователя.
// selectedConversation: текущая выбранная переписка.
// messages: сообщения текущей выбранной переписки.

// Хуки:
// useEffect для загрузки переписок при инициализации (по userId).
// useEffect для загрузки сообщений при изменении selectedConversation.

// Функции:
// createConversation: создает новую переписку и добавляет ее в conversations.
// sendMessage: отправляет сообщение, добавляет его в messages, обновляет lastMessage.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConversationsService } from '../services/ConversationsService';

const ConversationContext = createContext();

export const useConversationContext = () => useContext(ConversationContext);

export const ConversationProvider = ({ children, userId }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    // Загрузка списка переписок при загрузке контекста
    useEffect(() => {
        const loadConversations = async () => {
            const data = await ConversationsService.getConversations(userId);
            setConversations(data);
        };

        if (userId) loadConversations();
    }, [userId]);

    // Загрузка сообщений при выборе переписки
    useEffect(() => {
        const loadMessages = async () => {
            if (selectedConversation) {
                const data = await ConversationsService.getMessages(
                    selectedConversation.conversationId
                );
                setMessages(data);
            }
        };

        loadMessages();
    }, [selectedConversation]);

    const createConversation = async (participants) => {
        const conversation = await ConversationsService.createConversation(
            participants
        );
        setConversations((prev) => [...prev, conversation]);
        return conversation;
    };

    const sendMessage = async (conversationId, senderId, text) => {
        const message = await ConversationsService.sendMessage(
            conversationId,
            senderId,
            text
        );
        setMessages((prev) => [...prev, message]);

        // Обновляем последнюю переписку в списке
        setConversations((prev) =>
            prev.map((conv) =>
                conv.conversationId === conversationId
                    ? { ...conv, lastMessage: message }
                    : conv
            )
        );
    };

    return (
        <ConversationContext.Provider
            value={{
                conversations,
                selectedConversation,
                setSelectedConversation,
                messages,
                createConversation,
                sendMessage,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};
