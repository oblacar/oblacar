// src/components/MessageInput.js
import React, { useState, useRef } from 'react';
import './MessageInput.css';
import { ArrowUpCircleIcon } from '@heroicons/react/24/solid';

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState('');
    const inputRef = useRef(null);

    const handleInput = () => {
        setText(inputRef.current.innerText);
    };

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText('');
            inputRef.current.innerText = '';
            inputRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                e.preventDefault();
                document.execCommand('insertLineBreak'); // Вставляем перенос строки
            } else {
                e.preventDefault();
                handleSend();
            }
        }
    };

    return (
        <div className='message-input'>
            <div
                ref={inputRef}
                contentEditable='true'
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                data-placeholder='Напишите сообщение...'
                className='input-field'
                style={{
                    resize: 'none',
                    overflowY: 'auto',
                    maxHeight: '150px',
                    minHeight: '24px',
                }}
            />
            <ArrowUpCircleIcon
                className={`chat-send-icon-btn ${
                    text === '' ? '' : 'chat-text-exist'
                }`}
                onClick={handleSend}
            />
        </div>
    );
};

export default MessageInput;
