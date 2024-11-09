// ActiveConversation.js
import React, { useContext, useState } from 'react';
import './ActiveConversation.css';
import MessagesList from '../common/ChatBox/MessagesList/MessagesList';
import MessageInput from '../common/ChatBox/MessageInput/MessageInput';
import ConversationContext from '../../hooks/ConversationContext';
import UserContext from '../../hooks/UserContext';

const ActiveConversation = ({ conversation }) => {
    const { sendChatInterfaceMessage } = useContext(ConversationContext);
    const { user } = useContext(UserContext);

    const handleSendMessage = (messageText) => {
        if (messageText.trim()) {
            const chatPartnerIindex =
                user.userId === conversation.participants[0].userId ? 1 : 0;

            sendChatInterfaceMessage(
                conversation.adId,
                user.userId,
                conversation.participants[chatPartnerIindex].userId,
                messageText.trim()
            );
        }
    };

    return (
        <div className='active-conversation'>
            {conversation ? (
                <>
                    <MessagesList messages={conversation?.messages || []} />
                    <MessageInput onSend={handleSendMessage} />
                </>
            ) : (
                <div className='no-conversation'>
                    Выберите диалог, чтобы начать чат
                </div>
            )}
        </div>
    );
};

export default ActiveConversation;
