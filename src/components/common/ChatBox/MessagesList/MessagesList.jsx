// src/components/MessagesList.js
import React, { useContext, useEffect, useRef } from 'react';
import './MessagesList.css';
import UserContext from '../../../../hooks/UserContext';

const MessagesList = ({ conversation }) => {
    const { user } = useContext(UserContext);
    const { userId } = user;

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
                        msg.senderId === userId ? 'own' : 'other'
                    }`} // Условный класс
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
