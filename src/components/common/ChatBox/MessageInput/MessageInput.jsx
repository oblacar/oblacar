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

            // Сбрасываем высоту после отправки
            const textarea = document.querySelector('.message-input textarea');
            textarea.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Добавляем перевод строки, если нажато Shift + Enter
                e.preventDefault(); // Предотвращаем добавление новой строки
                setText((prevText) => prevText + '\n');
            } else {
                // Отправляем сообщение, если нажато только Enter
                e.preventDefault(); // Предотвращаем добавление новой строки
                handleSend();
            }
        }
    };

    const handleInputChange = (e) => {
        setText(e.target.value); // Обновляем текст сначала
        e.target.style.height = 'auto'; // Сбрасываем высоту перед расчетом

        requestAnimationFrame(() => {
            e.target.style.height = `${e.target.scrollHeight}px`; // Устанавливаем высоту после обновления текста
        });
    };

    return (
        <div className='message-input'>
            <textarea
                value={text}
                onChange={handleInputChange} // Автоматическое изменение высоты
                onKeyDown={handleKeyDown}
                placeholder='Напишите сообщение...'
                rows='1' // Начальная высота
                style={{ resize: 'none', overflow: 'hidden' }} // Отключаем ручное изменение размера
            />
            <ArrowUpCircleIcon
                className={`
                    chat-send-icon-btn ${text === '' ? '' : 'chat-text-exist'}
                    
                    `}
                onClick={handleSend}
            />
        </div>
    );
};

export default MessageInput;
