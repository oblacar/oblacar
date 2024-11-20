// ChatInterface.js
import React, { useState, useContext, useEffect } from 'react';
import ConversationList from './ConversationList';
import ActiveConversation from './ActiveConversation';
import Preloader from '../common/Preloader/Preloader';

import ConversationContext from '../../hooks/ConversationContext';

import './ChatInterface.css';

const ChatInterface = ({ adId = null }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [displayedConversations, setDisplayedConversations] = useState(null);

    const { conversations, getConversationsByAdId, isConversationsLoaded } =
        useContext(ConversationContext);

    useEffect(() => {
        if (!adId) {
            setDisplayedConversations(conversations);
        } else {
            const currentConversations = getConversationsByAdId(
                adId,
                conversations
            );

            setDisplayedConversations(currentConversations);
        }

        // if (!selectedConversation) {
        //     return;
        // }

        // const conversationId = selectedConversation.conversationId;
        // const conversation = conversations.find(
        //     (con) => con.conversationId === conversationId
        // );

        // const conversation = displayedConversations.find(
        //     (con) => con.conversationId === conversationId
        // );

        // setSelectedConversation(conversation);
    }, [conversations, adId, getConversationsByAdId]);

    useEffect(() => {
        if (!selectedConversation) {
            return;
        }

        const conversationId = selectedConversation.conversationId;
        // const conversation = conversations.find(
        //     (con) => con.conversationId === conversationId
        // );

        const conversation = displayedConversations.find(
            (con) => con.conversationId === conversationId
        );

        setSelectedConversation(conversation);
    }, [displayedConversations, selectedConversation]);

    return (
        <>
            {isConversationsLoaded ? (
                <div className='chat-interface'>
                    <ConversationList
                        // conversations={conversations ? conversations : []}
                        conversations={
                            displayedConversations ? displayedConversations : []
                        }
                        onSelectConversation={setSelectedConversation}
                    />
                    <ActiveConversation conversation={selectedConversation} />
                </div>
            ) : (
                <div className='chat-interface-preloader'>
                    <p>Ваши Диалоги загружаются.</p>
                    <Preloader />
                </div>
            )}
        </>
    );
};

export default ChatInterface;
