// ConversationContext.js
import React, { createContext, useContext, useState } from 'react';
import ConversationService from '../services/ConversationService';

const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);

    const getConversation = async (adId, userId) => {
        const conversation = await ConversationService.findConversationByAdId(
            adId,
            userId
        );
        setSelectedConversation(conversation);
        return conversation;
    };

    const startConversation = async (adId, participants) => {
        let conversation = await getConversation(adId, participants[0]);

        if (!conversation) {
            conversation = await ConversationService.createConversation(
                adId,
                participants
            );
            setConversations((prev) => [...prev, conversation]);
        }

        setSelectedConversation(conversation);
        return conversation;
    };

    //Методы, который начали делать с нуля со второй попытки

    

    return (
        <ConversationContext.Provider
            value={{
                conversations,
                selectedConversation,
                getConversation,
                startConversation,
                setSelectedConversation,
            }}
        >
            {children}
        </ConversationContext.Provider>
    );
};

export default ConversationContext;
