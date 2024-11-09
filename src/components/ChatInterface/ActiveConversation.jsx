// ActiveConversation.js
import React, { useState } from 'react';
import './ActiveConversation.css';

const ActiveConversation = ({ conversation }) => {
    const [messageText, setMessageText] = useState('');

    const handleSendMessage = () => {
        if (messageText.trim()) {
            // Логика отправки сообщения
            setMessageText('');
        }
    };

    return (
        <div className='active-conversation'>
            {conversation ? (
                <>
                    <div className='message-list'>
                        {conversation.messages.map((message, index) => (
                            <div
                                // key={message.messageId}
                                key={index}
                                className={`message ${
                                    message.senderId ===
                                    conversation.participants[0].userId
                                        ? 'own-message'
                                        : 'other-message'
                                }`}
                            >
                                <p>{message.text}</p>
                                <span className='timestamp'>
                                    {new Date(
                                        message.timestamp
                                    ).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className='message-input'>
                        <input
                            type='text'
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder='Введите сообщение...'
                        />
                        <button onClick={handleSendMessage}>Отправить</button>
                    </div>
                </>
            ) : (
                <div className='no-conversation'>
                    Выберите диалог, чтобы начать чат
                </div>
            )}
        </div>
    );
};

export default ActiveConversation;
