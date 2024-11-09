// ActiveConversation.js
import React, { useState } from 'react';
import './ActiveConversation.css';
import MessagesList from '../common/ChatBox/MessagesList/MessagesList';
import MessageInput from '../common/ChatBox/MessageInput/MessageInput';

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
                    {/* <div className='message-list'> */}
                    <MessagesList messages={conversation?.messages || []} />
                    {/* </div> */}
                    {/* <div className='message-input'> */}
                    <MessageInput onSend={handleSendMessage} />
                    {/* </div> */}
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
