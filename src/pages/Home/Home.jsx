// src/pages/Home/Home.js
import React, { useContext, useState } from 'react';
import styles from './Home.module.css'; // Подключаем стили

import TransportAdContext from '../../hooks/TransportAdContext';

import TransportAdService from '../../services/TransportAdService';
import { db, storage } from '../../firebase'; // Измените импорт
import { ref, set, push, update } from 'firebase/database'; // Импортируйте необходимые функции
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage'; // Импортируйте необходимые функции

import ConversationContext from '../../hooks/ConversationContext';
import ConversationService from '../../services/ConversationService';

import { addTransportAds } from '../../scripts/addTransportAds';

import CreateTransportAd from '../../components/CreateTransportAd/CreateTransportAd';

import SearchTransport from '../../components/SearchTransport/SearchTransport';
import TransportAdsList from '../../components/TransportAds/TransportAdsList';

import AdProfile from '../../components/AdProfile/AdProfile';
import MultiPhotoUploader from '../../components/MultiPhotoUploader/MultiPhotoUploader';

import ChatBox from '../../components/common/ChatBox/ChatBox';

function Home() {
    const { ads } = useContext(TransportAdContext);

    const handleUploadAds = async () => {
        await TransportAdService.uploadAdsToFirebase(ads); // Вызываем функцию загрузки из сервиса

        // await TransportAdService.uploadAdsToFirebase(ads); // Вызываем функцию загрузки из сервиса
    };

    const { startConversation, selectedConversation } =
        useContext(ConversationContext);
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);

    const handleStartConversation = () => {
        startConversation([
            '4yFCj7s6pBTNsZnRs0Ek3pNUsYb2',
            'f5uTdFZacmRrWZAVkkyskfmYpFn1',
        ]); // Замените "user1" и "user2" на реальные userId
        setIsChatBoxOpen(true); // Открываем ChatBox после создания
    };

    //методы для наастройки сообщений. после отладаки удалить
    const handleCreateConversation = async () => {
        const adId = '-OAgoNAJhgOAvR-JtzlK'; // Задаем тестовый adId
        const participants = [
            {
                userId: '4yFCj7s6pBTNsZnRs0Ek3pNUsYb2',
                userName: '',
                userPhotoUrl: '',
            },
            {
                userId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
                userName: '',
                userPhotoUrl: '',
            },
        ]; // Тестовые ID пользователей

        try {
            const conversation = await ConversationService.createConversation(
                adId,
                participants
            );
            console.log('Создан разговор:', conversation);
        } catch (error) {
            console.error('Ошибка при создании разговора:', error);
        }
    };

    const handleSendMessage = async () => {
        const conversationId = '-OB3_3p3rApdweRHB07u'; // Укажите ID тестового разговора
        const senderId = '4yFCj7s6pBTNsZnRs0Ek3pNUsYb2';
        const recipientId = 'A9lTs7ZeBsOHADGE1MGlFCKx08u1';
        const adId = '-OAgoNAJhgOAvR-JtzlK'; // ID объявления
        const text = 'Тестовое сообщение-2'; // Текст сообщения
        const isDeliveryRequest = false; // Можно переключить на true для теста запроса поставки

        try {
            const message = await ConversationService.addMessage(
                conversationId,
                senderId,
                recipientId,
                adId,
                text,
                isDeliveryRequest
            );
            console.log('Сообщение успешно отправлено:', message);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    };

    const handleTestClick = async () => {
        try {
            const conversation =
                await ConversationService.getConversationByAdId(
                    '-OAgoNAJhgOAvR-JtzlK'
                );
            console.log('Полученный разговор:', conversation);
        } catch (error) {
            console.error('Ошибка при получении разговора:', error);
        }
    };
    const handleTestClick2 = async () => {
        try {
            const messages =
                await ConversationService.getMessagesByConversationId(
                    '-OB3_3p3rApdweRHB07u' // conversationIid
                );
            console.log('Полученные сообщений по id Разговора:', messages);
        } catch (error) {
            console.error('Ошибка при получении сообщений:', error);
        }
    };

    const handleTestClick3 = async () => {
        try {
            const unreadMessageIds =
                await ConversationService.getUnreadMessageIds(
                    'A9lTs7ZeBsOHADGE1MGlFCKx08u1'
                );
            console.log('Непрочитанные сообщения:', unreadMessageIds);

            setMessageIds(unreadMessageIds);
        } catch (error) {
            console.error(
                'Ошибка при получении непрочитанных сообщений:',
                error
            );
        }
    };

    const [messageIds, setMessageIds] = useState([]);

    const handleTestClick4 = async () => {
        try {
            const messages = await ConversationService.getMessagesByIds(
                messageIds
            );
            console.log('Непрочитанные сообщения по messageIds:', messages);
        } catch (error) {
            console.error(
                'Ошибка при получении сообщений по messageIds:',
                error
            );
        }
    };

    const handleMarkAsUnread = async () => {
        try {
            await ConversationService.markMessageAsUnread(
                '-OB5--mv6iVw8vsTQwDJ'
            );
            console.log(
                `Сообщение '-OB5--mv6iVw8vsTQwDJ' добавлено в непрочитанные `
            );
        } catch (error) {
            console.error(
                'Ошибка при добавлении сообщения в непрочитанные:',
                error
            );
        }
    };

    const handleMarkAsRead = async () => {
        try {
            await ConversationService.markMessageAsRead('-OB5--mv6iVw8vsTQwDJ');
            console.log(
                `Сообщение '-OB5--mv6iVw8vsTQwDJ' отмечено как прочитанное `
            );
        } catch (error) {
            console.error(
                'Ошибка при отметке сообщения как прочитанного:',
                error
            );
        }
    };

    const handleDeleteMessage = async () => {
        try {
            await ConversationService.deleteMessage('-OB5MfSdiQJu5uzy4aqY');
            console.log(`Сообщение '-OB5MfSdiQJu5uzy4aqY' удалено`);
        } catch (error) {
            console.error('Ошибка при удалении сообщения:', error);
        }
    };

    //

    return (
        <>
            <button onClick={handleCreateConversation}>Создать разговор</button>
            <button onClick={handleSendMessage}>
                + Отправить тестовое сообщение
            </button>
            <button onClick={handleTestClick}>
                + Тестировать getConversationByAdId
            </button>
            <button onClick={handleTestClick2}>
                + Тестировать получение сообщений по id метода
            </button>
            <button onClick={handleTestClick3}>
                + Тестировать получение непрочитанных сообщений
            </button>
            <button onClick={handleTestClick4}>
                + Тестировать получение сообщений по messageIds
            </button>
            <button onClick={handleMarkAsUnread}>
                + Отметить сообщение как непрочитанное
            </button>
            <button onClick={handleMarkAsRead}>
                + Отметить сообщение как прочитанное
            </button>
            <button onClick={handleDeleteMessage}>+ Удалить сообщение</button>
            <div className={styles.container}>
                {/* <div> */}
                {/* Другие элементы вашего компонента */}
                {/* <button onClick={handleUploadAds}>
                        Выгрузить объявления на Firebase
                    </button> */}
                {/* </div> */}

                {/* <h2>Welcome to Oblacar</h2> */}
                <p>
                    {/* Your reliable platform for finding transportation services. */}
                    {/* <button onClick={addTransportAds}>
                        загрузить тестовую базу
                    </button> */}
                </p>
                {/* <CreateTransportAd /> */}
                {/* <SearchTransport /> */}
                {/* <p>
                    1. добавить раздел: фото водителя и рейтинг, проверенный ли
                    водитель, проверенная ли машшина. 2. возле цены можно
                    заместить важную инфомрацию по оплате, кроме цены
                </p> */}

                {/* <button onClick={handleUploadAds}>
                    Add ACTIVE for all ads
                </button> */}

                {/* <MultiPhotoUploader /> */}

                {/* <AdProfile
                    onSendRequest={handleSendRequest}
                    onMessage={handleMessage}
                    userType='cargoOwner' // или "transportOwner"
                    ad={ads.length > 0 ? ads[0].ad : null}
                /> */}

                <TransportAdsList />

                {/* <button onClick={handleStartConversation}>
                    Начать переписку
                </button>
                {isChatBoxOpen && selectedConversation && (
                    <ChatBox onClose={() => setIsChatBoxOpen(false)} />
                )} */}
            </div>
        </>
    );
}

export default Home;
