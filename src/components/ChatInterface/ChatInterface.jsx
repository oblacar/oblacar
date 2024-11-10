// ChatInterface.js
import React, { useState, useContext, useEffect } from 'react';
import ConversationList from './ConversationList';
import ActiveConversation from './ActiveConversation';
import Preloader from '../common/Preloader/Preloader';

import ConversationContext from '../../hooks/ConversationContext';

import './ChatInterface.css';

const ChatInterface = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);

    const { conversations, isConversationsLoaded } =
        useContext(ConversationContext);

    useEffect(() => {
        if (!selectedConversation) {
            return;
        }

        const conversationId = selectedConversation.conversationId;
        const conversation = conversations.find(
            (con) => con.conversationId === conversationId
        );

        setSelectedConversation(conversation);
    }, [conversations]);

    return (
        <>
            {isConversationsLoaded ? (
                <div className='chat-interface'>
                    <ConversationList
                        conversations={conversations ? conversations : []}
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
