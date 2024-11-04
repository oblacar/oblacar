// src/components/MessagesList.js
import React, { useEffect, useRef } from 'react';
import './MessagesList.css';

const MessagesList = ({ conversation }) => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation.messages]);

    return (
        <div className='messages-list'>
            {conversation.messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`message ${
                        msg.senderId === 'self' ? 'own' : ''
                    }`}
                >
                    <p>{msg.text}</p>
                    <span className='timestamp'>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessagesList;
