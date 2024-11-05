// src/components/MessageInput.js
import React, { useState } from 'react';
import './MessageInput.css';

import { ArrowUpCircleIcon } from '@heroicons/react/24/solid';

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText('');
        }
    };

    return (
        <div className='message-input'>
            <input
                type='text'
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='Напишите сообщение...'
            />
            <ArrowUpCircleIcon
                className={`
                    chat-send-icon-btn ${text===''?'':'chat-text-exist'}
                    
                    `}
                onClick={handleSend}
            />
        </div>
    );
};

export default MessageInput;
