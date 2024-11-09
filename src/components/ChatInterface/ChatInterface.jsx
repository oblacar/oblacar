// ChatInterface.js
import React, { useState, useContext, useEffect } from 'react';
import ConversationList from './ConversationList';
import ActiveConversation from './ActiveConversation';
import MessagesList from '../common/ChatBox/MessagesList/MessagesList';
import MessageInput from '../common/ChatBox/MessageInput/MessageInput';

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

    const handleSendMessage = (text) => {
        console.log(text); //imitation of sendMessage
    };
    return (
        <div className='chat-interface'>
            <ConversationList
                conversations={conversations ? conversations : []}
                onSelectConversation={setSelectedConversation}
            />
            <ActiveConversation conversation={selectedConversation} />
            {/* <MessagesList messages={selectedConversation?.messages || []} />
            <MessageInput onSend={handleSendMessage} /> */}
        </div>
    );
};

export default ChatInterface;
