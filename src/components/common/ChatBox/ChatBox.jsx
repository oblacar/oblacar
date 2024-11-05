// src/components/ChatBox.js
import React, { useEffect, useContext } from 'react';
import ConversationContext from '../../../hooks/ConversationContext';

import MessagesList from './MessagesList/MessagesList';
import MessageInput from './MessageInput/MessageInput';
import './ChatBox.css';

import AuthContext from '../../../hooks/Authorization/AuthContext';

const ChatBox = ({ onClose }) => {
    const { selectedConversation, messages, sendMessage } =
        useContext(ConversationContext);
    const { userId } = useContext(AuthContext);

    const handleSendMessage = (text) => {
        if (selectedConversation) {
            sendMessage(selectedConversation.conversationId, userId, text);
        }
    };

    useEffect(() => {
        if (!selectedConversation) {
            onClose(); // Закрываем ChatBox, если нет выбранной переписки
        }
    }, [selectedConversation, onClose]);

    return (
        selectedConversation && (
            <div className='chatbox'>
                <div className='chatbox-header'>
                    <span>Переписка</span>
                    <button
                        className='chatbox-close'
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <MessagesList
                    conversation={{ ...selectedConversation, messages }}
                />
                <MessageInput onSend={handleSendMessage} />
            </div>
        )
    );
};

export default ChatBox;
