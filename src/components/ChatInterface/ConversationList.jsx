// ConversationList.js
import React, { useEffect } from 'react';
import './ConversationList.css';

const ConversationList = ({ onSelectConversation, conversations }) => {

    return (
        <div className='conversation-list'>
            <h2>Диалоги</h2>
            {conversations &&
                conversations.map((conversation) => (
                    <div
                        key={conversation.conversationId}
                        className='conversation-item'
                        onClick={() => onSelectConversation(conversation)}
                    >
                        <img
                            src={conversation.participants[1].userPhotoUrl}
                            alt='Фото собеседника'
                            className='conversation-photo'
                        />
                        <div className='conversation-details'>
                            <h4>{conversation.participants[1].userName}</h4>
                            <p>{conversation.lastMessage}</p>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default ConversationList;
