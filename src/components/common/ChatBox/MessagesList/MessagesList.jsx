// src/components/MessagesList.js
import React, { useContext, useEffect, useRef } from 'react';
import UserContext from '../../../../hooks/UserContext';
import './MessagesList.css';

import { formatTimestamp } from '../../../../utils/formatTimestamp';

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
                    }`} 
                >
                    <div
                        className='message-text'
                        dangerouslySetInnerHTML={{
                            __html: msg.text.replace(/\n/g, '<br />'), // Преобразуем \n в <br />
                        }}
                    />
                    <span className='timestamp'>
                        {formatTimestamp(msg.timestamp)}
                    </span>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessagesList;
