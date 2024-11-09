// ChatInterface.js
import React, { useState, useContext, useEffect } from 'react';
import ConversationList from './ConversationList';
import ActiveConversation from './ActiveConversation';

import ConversationContext from '../../hooks/ConversationContext';
import UserContext from '../../hooks/UserContext';

import './ChatInterface.css';

const ChatInterface = () => {
    const { user } = useContext(UserContext);
    const [selectedConversation, setSelectedConversation] = useState(null);

    const { conversations, getUserConversations } =
        useContext(ConversationContext);

    useEffect(() => {
        if (user.userId) {
            getUserConversations(user.userId);
        }
    }, [user.userId]);

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
        <div className='chat-interface'>
            <ConversationList
                conversations={conversations ? conversations : []}
                onSelectConversation={setSelectedConversation}
            />
            <ActiveConversation conversation={selectedConversation} />
        </div>
    );
};

export default ChatInterface;
