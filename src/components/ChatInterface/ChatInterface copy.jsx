// ChatInterface.js работающий компонет, сохраняем, что бы перенести области чата, который уже настроен
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
        console.log('список разговоров в интефейсе: ', conversations);
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
