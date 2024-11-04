// src/components/ConversationsPage.js
import React, { useState } from 'react';
import ConversationsList from './ConversationsList';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import './ConversationsPage.css';

const ConversationsPage = ({ conversations }) => {
    const [selectedConversation, setSelectedConversation] = useState(null);

    return (
        <div className='conversations-page'>
            <ConversationsList
                conversations={conversations}
                onSelect={setSelectedConversation}
            />
            {selectedConversation ? (
                <div className='conversation-window'>
                    <MessagesList conversation={selectedConversation} />
                    <MessageInput
                        conversationId={selectedConversation.conversationId}
                    />
                </div>
            ) : (
                <div className='conversation-placeholder'>
                    Выберите беседу для просмотра
                </div>
            )}
        </div>
    );
};

export default ConversationsPage;
