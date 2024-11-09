// ConversationList.js
import React, { useContext, useState, useEffect } from 'react';
import './ConversationList.css';
import UserContext from '../../hooks/UserContext';

const ConversationList = ({ onSelectConversation, conversations }) => {
    const { user } = useContext(UserContext);

    const [selectedConversationId, setSelectedConversationId] = useState(null);

    const handleSelectConversation = (conversation) => {
        setSelectedConversationId(conversation.conversationId);
        onSelectConversation(conversation);
    };

    return (
        <div className='conversation-list'>
            <h2>Диалоги</h2>
            {conversations &&
                conversations.map((conversation) => {
                    const chatPartnerIindex =
                        user.userId === conversation.participants[0].userId
                            ? 1
                            : 0;

                    const isSelected =
                        selectedConversationId === conversation.conversationId;
                    return (
                        <div
                            key={conversation.conversationId}
                            className={`conversation-item ${
                                isSelected ? 'selected' : ''
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleSelectConversation(conversation);
                            }}
                            tabIndex='-1' // Обнуляем tabindex
                        >
                            <img
                                src={
                                    conversation.participants[chatPartnerIindex]
                                        .userPhotoUrl
                                }
                                alt='Фото собеседника'
                                className='conversation-photo'
                            />
                            <div className='conversation-details'>
                                <h4>
                                    {
                                        conversation.participants[
                                            chatPartnerIindex
                                        ].userName
                                    }
                                </h4>
                                <p>{conversation.lastMessage}</p>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default ConversationList;
