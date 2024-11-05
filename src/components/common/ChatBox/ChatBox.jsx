// src/components/ChatBox.js
import React, { useEffect, useContext, useRef, useState } from 'react';
import ConversationContext from '../../../hooks/ConversationContext';

import { XMarkIcon } from '@heroicons/react/24/outline';

import MessagesList from './MessagesList/MessagesList';
import MessageInput from './MessageInput/MessageInput';
import './ChatBox.css';

import AuthContext from '../../../hooks/Authorization/AuthContext';

const ChatBox = ({ onClose }) => {
    const { userId } = useContext(AuthContext);
    const { selectedConversation, messages, sendMessage } =
        useContext(ConversationContext);

    const [height, setHeight] = useState(400); // Начальная высота чата
    const chatBoxRef = useRef(null);
    const startYRef = useRef(0); // Используем useRef для стартовой позиции

    /// Растягивание области чата мышкой--->>>
    const handleMouseDown = (e) => {
        e.preventDefault();
        startYRef.current = e.clientY; // Сохраняем начальную позицию мыши в startYRef
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        const deltaY = startYRef.current - e.clientY; // Смещение мыши вверх/вниз
        setHeight((prevHeight) => Math.max(200, prevHeight + deltaY));
        startYRef.current = e.clientY; // Обновляем позицию мыши для плавного изменения
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    //<<<---

    //Отправка сообщений
    const handleSendMessage = (text) => {
        if (selectedConversation) {
            sendMessage(selectedConversation.conversationId, userId, text);
        }
    };

    useEffect(() => {
        if (!selectedConversation) {
            onClose(); // Закрываем ChatBox, если нет выбранной переписки
        }
    }, [selectedConversation, onClose]);

    return (
        selectedConversation && (
            <div
                className='chatbox'
                ref={chatBoxRef}
                style={{ height: `${height}px` }}
            >
                <div
                    className='resize-handle'
                    onMouseDown={handleMouseDown}
                />
                <div className='chatbox-header'>
                    <span>Переписка</span>

                    <XMarkIcon
                        className='close-chat-icon-btn'
                        onClick={onClose}
                    />
                </div>
                <MessagesList
                    conversation={{ ...selectedConversation, messages }}
                />
                <MessageInput onSend={handleSendMessage} />
            </div>
        )
    );
};

export default ChatBox;
