// src/components/MessagesList.js
import React, { useContext, useEffect, useRef } from 'react';
import UserContext from '../../../../hooks/UserContext';
import './MessagesList.css';

import { formatTimestamp } from '../../../../utils/formatTimestamp';

const MessagesList = ({ messages }) => {
    const { user } = useContext(UserContext);
    const { userId } = user;

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className='messages-list'>
            {messages.map((msg, idx) => {
                const isOwnMessage = msg.senderId === userId; // Определяем, чье это сообщение

                return (
                    <div
                        key={idx}
                        className={`message ${isOwnMessage ? 'own' : 'other'}`}
                    >
                        {/* Основной блок с текстом */}
                        <div className='message-main'>
                            <div
                                className='message-text'
                                dangerouslySetInnerHTML={{
                                    __html: msg.text.replace(/\n/g, '<br />'), // Преобразуем \n в <br />
                                }}
                            />
                            <span className='timestamp'>
                                {formatTimestamp(msg.timestamp)}
                            </span>
                            {/* Правый узкий блок (только для сообщений пользователя) */}
                            {isOwnMessage && (
                                <div className='message-narrow-point-shaper right'>
                                    <div></div>
                                </div>
                            )}
                            {/* Левый узкий блок (только для сообщений собеседника) */}
                            {!isOwnMessage && (
                                <div className='message-narrow-point-shaper left'>
                                    <div></div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessagesList;
