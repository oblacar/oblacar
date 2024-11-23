// ConversationList.js
import React, { useContext, useState, useEffect } from 'react';

import './ConversationList.css';
import UserContext from '../../hooks/UserContext';
import ConversationContext from '../../hooks/ConversationContext';

const ConversationList = ({ onSelectConversation, conversations }) => {
    const { user } = useContext(UserContext);
    const { countUnreadMessages } = useContext(ConversationContext);

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

                    const countUserUnreadMessages = countUnreadMessages(
                        conversation.messages,
                        conversation.adId,
                        user.userId // Используем ID текущего пользователя как получателя
                    );

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
                                <p>
                                    {
                                        conversation.participants[
                                            chatPartnerIindex
                                        ].userName
                                    }
                                </p>

                                <h4>{conversation.availabilityDate}</h4>
                                <h4>
                                    {conversation.departureCity} -{' '}
                                    {conversation.destinationCity}
                                </h4>
                                <p>{conversation.priceAndPaymentUnit}</p>
                            </div>

                            {countUserUnreadMessages && (
                                <div className='count-unread-messages-container'>
                                    <div className='count-unread-messages'>
                                        {countUserUnreadMessages}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    );
};

export default ConversationList;
