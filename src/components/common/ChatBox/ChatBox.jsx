// src/components/ChatBox.js
import React, { useEffect, useContext, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ConversationContext from '../../../hooks/ConversationContext';

import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

import MessagesList from './MessagesList/MessagesList';
import MessageInput from './MessageInput/MessageInput';
import './ChatBox.css';

import AuthContext from '../../../hooks/Authorization/AuthContext';
import UserContext from '../../../hooks/UserContext';

const ChatBox = ({
    onClose,
    adId,
    chatPartnerId = '',
    chatPartnerName = '',
    chatPartnerPhoto = '',
}) => {
    const { user } = useContext(UserContext);
    const {
        currentConversation,
        sendMessage,
        setBasicConversationData,
        findConversation,

        clearCurrentConversation,
    } = useContext(ConversationContext);

    const [height, setHeight] = useState(400); // Начальная высота чата
    const chatBoxRef = useRef(null);
    const startYRef = useRef(0); // Используем useRef для стартовой позиции

    const handleClose = () => {
        clearCurrentConversation(); // Выполняем дополнительную логику
        if (onClose) onClose(); // Вызываем переданный обработчик
    };

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
        // const test = {
        //     adId: adId,
        //     userId: userId,
        //     chatPartnerId: chatPartnerId,
        //     text: text,
        // };

        // console.log('test: ', test);

        const chatPartner1 = {
            userId: user.userId,
            userName: user.userName,
            userPhotoUrl: user.userPhoto,
        };
        const chatPartner2 = {
            userId: chatPartnerId,
            userName: chatPartnerName,
            userPhotoUrl: chatPartnerPhoto,
        };

        // setBasicConversationData(adId, [chatPartner1, chatPartner2]);

        // findConversation(adId, [chatPartnerId, user.userId]);

        sendMessage(adId, chatPartner1, chatPartner2, text);
    };

    return ReactDOM.createPortal(
        <div
            className='chatbox'
            ref={chatBoxRef}
            style={{ height: `${height}px` }}
        >
            <div className='chatbox-header'>
                <div
                    className='resize-handle'
                    onMouseDown={handleMouseDown}
                />
                <div className='chatbox-chat-partner-photo-name'>
                    <div className='chatbox-chat-partner-photo'>
                        {chatPartnerPhoto ? ( // Проверяем, есть ли фото
                            <img
                                src={chatPartnerPhoto}
                                alt='Собеседник'
                                className='chatbox-chat-partner-photo-img'
                            />
                        ) : (
                            <UserIcon className='chatbox-chat-partner-photo-icon' />
                        )}
                    </div>
                    <div className='chatbox-chat-partner-name'>
                        {chatPartnerName}
                    </div>
                </div>

                <XMarkIcon
                    className='close-chat-icon-btn'
                    onClick={handleClose}
                />
            </div>
            <MessagesList messages={currentConversation?.messages || []} />
            <MessageInput onSend={handleSendMessage} />
        </div>,
        document.body // Рендерим чат в body
    );
};

export default ChatBox;
