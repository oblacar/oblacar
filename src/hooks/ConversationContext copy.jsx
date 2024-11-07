// src/contexts/ConversationContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ConversationService } from '../services/ConversationService';

import AuthContext from './Authorization/AuthContext';

const ConversationContext = createContext();

// export const useConversationContext = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }) => {
    const { userId, isAuthenticated } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Загружаем переписки только если пользователь аутентифицирован
        const loadConversations = async () => {
            if (isAuthenticated && userId) {
                const data = await ConversationService.getConversations(userId);

                setConversations(data);
                console.log(data);
            }
        };

        loadConversations();
    }, [userId, isAuthenticated]);

    useEffect(() => {
        const loadMessages = async () => {
            if (selectedConversation) {
                const data = await ConversationService.getMessages(
                    selectedConversation.conversationId
                );
                setMessages(data);
            }
        };
        loadMessages();
    }, [selectedConversation]);

    const createConversation = async (participants) => {
        const conversation = await ConversationService.createConversation(
            participants
        );
        setConversations((prev) => [...prev, conversation]);

        // setSelectedConversation(conversation); // Устанавливаем новую переписку как выбранную
        return conversation;
    };

    const startConversation = async (participants) => {
        // Выходим, если пользователь не аутентифицирован
        if (!isAuthenticated) return;
        
        // Проверка, существует ли уже переписка
        const existingConversation = conversations.find((conv) =>
            participants.every((participant) =>
                conv.participants.includes(participant)
            )
        );

        if (existingConversation) {
            // Если переписка существует, устанавливаем ее как выбранную
            console.log('Found existing conversation:', existingConversation);

            setSelectedConversation(existingConversation);
            return existingConversation;
        } else {
            // Если переписка не найдена, создаем новую
            console.log('No existing conversation found, creating a new one');

            const newConversation = await createConversation(participants);
            setSelectedConversation(newConversation);
            return newConversation;
        }
    };

    const sendMessage = async (conversationId, senderId, text) => {
        const message = await ConversationService.sendMessage(
            conversationId,
            senderId,
            text
        );
        setMessages((prev) => [...prev, message]);

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
                startConversation,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export default ConversationContext;
