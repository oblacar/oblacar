// src/components/ChatBox.js
import React, { useState } from 'react';
import MessagesList from './MessagesList/MessagesList';
import MessageInput from './MessageInput/MessageInput';
import './ChatBox.css';

const ChatBox = ({ conversation, onClose }) => {
    const [messages, setMessages] = useState(conversation.messages);

    const handleSendMessage = (text) => {
        const newMessage = {
            messageId: `msg${messages.length + 1}`,
            senderId: 'self',
            text,
            timestamp: Date.now(),
        };
        setMessages([...messages, newMessage]);
    };

    return (
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
            <MessagesList conversation={{ ...conversation, messages }} />
            <MessageInput onSend={handleSendMessage} />
        </div>
    );
};

export default ChatBox;
