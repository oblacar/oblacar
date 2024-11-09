// ConversationService.js
import { db } from '../firebase';
import {
    ref as dbRef,
    set,
    push,
    get,
    query,
    orderByChild,
    equalTo,
    update,
    remove,
} from 'firebase/database';

import Conversation from '../entities/Messages/Conversation';
import Message from '../entities/Messages/Message';

const ConversationService = {
    //Метод createConversation будет создавать новый разговор в базе данных
    async createConversation(adId, participants) {
        console.log('Проверка данных перед созданием разговора:', {
            adId,
            participants,
        });

        try {
            const conversationsRef = dbRef(db, 'conversations');
            const newConversationRef = push(conversationsRef);
            const conversationId = newConversationRef.key; // Получаем ID разговора

            // Создаем новый разговор с conversationId
            const conversationData = new Conversation(
                conversationId,
                adId,
                participants,
                []
            );

            // Сохраняем разговор в Firebase
            await set(newConversationRef, conversationData.toFirebaseObject());
            console.log(
                'Разговор успешно создан с ID:',
                conversationData.conversationId
            );
            return conversationData;
        } catch (error) {
            console.error('Ошибка при создании разговора:', error);
            throw error;
        }
    },

    //метод добавляет сообщение в коллекцию сообщений, а также добавляет messageId в коллекцию unreadMessages
    // + перевели на строковую систему хранения ключей
    async addMessage(
        conversationId,
        senderId,
        recipientId,
        adId,
        text,
        isDeliveryRequest = false
    ) {
        try {
            const messagesRef = dbRef(db, 'messages');
            const newMessageRef = push(messagesRef);
            const messageData = new Message(
                newMessageRef.key, // messageId, генерируемый Firebase
                conversationId,
                senderId,
                recipientId,
                adId,
                text,
                Date.now(),
                false, // По умолчанию сообщение считается непрочитанным
                isDeliveryRequest
            );

            // Сохраняем сообщение в Firebase
            await set(newMessageRef, messageData.toFirebaseObject());

            // Обновляем массив messageIds в разговоре
            const conversationMessagesRef = dbRef(
                db,
                `conversations/${conversationId}/messages`
            );
            const conversationSnapshot = await get(conversationMessagesRef);

            let messageIds = [];
            if (conversationSnapshot.exists()) {
                const messagesData = conversationSnapshot.val();
                messageIds = Array.isArray(messagesData) ? messagesData : []; // Проверяем, что messages — это массив
            }

            // Добавляем новый messageId как строку в массив
            messageIds.push(messageData.messageId);

            await update(dbRef(db, `conversations/${conversationId}`), {
                messages: messageIds,
            });

            // Добавляем messageId в непрочитанные для получателя
            await this.markMessageAsUnread(messageData.messageId);

            // Обновляем последнее сообщение в разговоре
            await this.updateLastMessageInConversation(conversationId, text);

            return messageData;
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            throw error;
        }
    },

    // Добавляет messageId в непрочитанные сообщения для пользователя
    // Проверка существования сообщения - предотвратит случайные добавления несуществующих messageId.
    // Обновление статуса isRead: false для сообщения.
    // + перевели на строковую систему хранения ключей
    async markMessageAsUnread(messageId) {
        try {
            // Получаем данные сообщения для определения recipientId
            const messageRef = dbRef(db, `messages/${messageId}`);
            const snapshot = await get(messageRef);

            if (!snapshot.exists()) {
                console.error(`Сообщение с ID ${messageId} не найдено.`);
                return;
            }

            const { recipientId } = snapshot.val();

            // Обновление статуса isRead в самом сообщении
            await update(messageRef, { isRead: false });

            // Получаем текущий список непрочитанных сообщений для пользователя
            const unreadMessagesRef = dbRef(
                db,
                `unreadMessages/${recipientId}`
            );
            const unreadSnapshot = await get(unreadMessagesRef);
            let unreadMessageIds = [];

            // Проверяем существование массива и добавляем новое сообщение, если оно отсутствует
            if (unreadSnapshot.exists()) {
                unreadMessageIds = unreadSnapshot.val();
            }

            if (!unreadMessageIds.includes(messageId)) {
                unreadMessageIds.push(messageId);
            }

            // Обновляем список непрочитанных сообщений
            await set(unreadMessagesRef, unreadMessageIds);
        } catch (error) {
            console.error(
                'Ошибка при добавлении сообщения в непрочитанные:',
                error
            );
            throw error;
        }
    },

    // Метод возвращает данные о разговоре и массив messageId (без подгрузки самих сообщений):
    // Этот метод вернет conversationId, adId, participants и массив messageId из поля messages.
    //-+ метод не проверен
    async getConversationsByAdId(adId) {
        try {
            const conversationsRef = dbRef(db, 'conversations');
            const conversationQuery = query(
                conversationsRef,
                orderByChild('adId'),
                equalTo(adId)
            );

            // Запрос данных
            const snapshot = await get(conversationQuery);
            const conversations = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    conversations.push({
                        conversationId: childSnapshot.key,
                        adId: data.adId,
                        participants: data.participants,
                        messageIds: Array.isArray(data.messages)
                            ? data.messages.map(String)
                            : Object.keys(data.messages || {}),
                    });
                });
                console.log(`Разговоры для adId ${adId}:`, conversations);
                return conversations;
            } else {
                console.log(`Разговоры для adId ${adId} не найдены.`);
                return [];
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            throw error;
        }
    },

    // Метод ищет конкретный разговор, основанный на adId и массиве participantsId из двух userId собеседников:
    // -- не проверен
    async getConversationByAdIdAndParticipantsId(adId, participantsId) {
        try {
            const conversationsRef = dbRef(db, 'conversations');
            const conversationQuery = query(
                conversationsRef,
                orderByChild('adId'),
                equalTo(adId)
            );

            // Запрос данных
            const snapshot = await get(conversationQuery);

            if (snapshot.exists()) {
                let foundConversation = null;
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    const conversationParticipants = data.participants
                        .map((p) => p.userId)
                        .sort();

                    // Сравниваем участников
                    if (
                        conversationParticipants.length ===
                            participantsId.length &&
                        conversationParticipants.every(
                            (id, index) => id === participantsId.sort()[index]
                        )
                    ) {
                        foundConversation = {
                            conversationId: childSnapshot.key,
                            adId: data.adId,
                            participants: data.participants,
                            messageIds: Array.isArray(data.messages)
                                ? data.messages.map(String)
                                : Object.keys(data.messages || {}),
                        };
                    }
                });

                if (foundConversation) {
                    console.log(
                        `Найден разговор для adId ${adId} и участников ${participantsId}:`,
                        foundConversation
                    );
                    return foundConversation;
                } else {
                    console.log(
                        `Разговор для adId ${adId} и участников ${participantsId} не найден.`
                    );
                    return null;
                }
            } else {
                console.log(`Разговоры для adId ${adId} не найдены.`);
                return null;
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            throw error;
        }
    },

    //Метод, который принимает conversationId и возвращает массив сообщений.
    //
    async getMessagesByConversationId(conversationId) {
        try {
            const messagesRef = dbRef(db, 'messages');
            const messagesQuery = query(
                messagesRef,
                orderByChild('conversationId'),
                equalTo(conversationId)
            );
            const snapshot = await get(messagesQuery);

            const messages = [];
            snapshot.forEach((childSnapshot) => {
                const messageData = childSnapshot.val();
                const message = new Message(
                    childSnapshot.key, // messageId
                    messageData.conversationId,
                    messageData.senderId,
                    messageData.recipientId,
                    messageData.adId,
                    messageData.text,
                    messageData.timestamp,
                    messageData.isRead,
                    messageData.isDeliveryRequest
                );
                messages.push(message);
            });

            console.log(`Сообщения для разговора ${conversationId}:`, messages);
            return messages;
        } catch (error) {
            console.error(
                'Ошибка при получении сообщений по conversationId:',
                error
            );
            throw error;
        }
    },

    //Метод для получения непрочитанных сообщений по userId
    //++ ключи текстовые
    async getUnreadMessageIds(userId) {
        try {
            const unreadMessagesRef = dbRef(db, `unreadMessages/${userId}`);
            const snapshot = await get(unreadMessagesRef);

            if (snapshot.exists()) {
                // Извлекаем массив `messageId`, который хранится как массив строк
                const unreadMessageIds = snapshot.val();
                console.log('Непрочитанные сообщения:', unreadMessageIds);
                return unreadMessageIds;
            } else {
                console.log(
                    `Нет непрочитанных сообщений для пользователя ${userId}`
                );
                return [];
            }
        } catch (error) {
            console.error(
                'Ошибка при получении непрочитанных сообщений:',
                error
            );
            throw error;
        }
    },

    //Метод выполняет запрос для каждого messageId из массива пропсов,
    //извлекая его данные и возвращая массив объектов Message.
    //++ вроде бы нормальное работает со строками - ключами
    async getMessagesByIds(messageIds) {
        try {
            const messages = [];

            for (const messageId of messageIds) {
                const messageRef = dbRef(db, `messages/${messageId}`);
                const snapshot = await get(messageRef);

                if (snapshot.exists()) {
                    const messageData = snapshot.val();
                    const message = new Message(
                        messageId,
                        messageData.conversationId,
                        messageData.senderId,
                        messageData.recipientId,
                        messageData.adId,
                        messageData.text,
                        messageData.timestamp,
                        messageData.isRead,
                        messageData.isDeliveryRequest
                    );
                    messages.push(message);
                } else {
                    console.warn(`Сообщение с ID ${messageId} не найдено`);
                }
            }

            return messages;
        } catch (error) {
            console.error(
                'Ошибка при получении сообщений по messageIds:',
                error
            );
            throw error;
        }
    },

    //Метод обновляет статус isRead для сообщения и убирает его из списка непрочитанных.
    // + обновили для работы с ключами в виде текстовых строк
    async markMessageAsRead(messageId) {
        try {
            // Получаем данные сообщения для определения recipientId
            const messageRef = dbRef(db, `messages/${messageId}`);
            const messageSnapshot = await get(messageRef);

            if (!messageSnapshot.exists()) {
                console.error(`Сообщение с ID ${messageId} не найдено.`);
                return;
            }

            const { recipientId } = messageSnapshot.val();

            // Обновляем статус isRead в самом сообщении
            await update(messageRef, { isRead: true });

            // Получаем текущий список непрочитанных сообщений для пользователя
            const unreadMessagesRef = dbRef(
                db,
                `unreadMessages/${recipientId}`
            );
            const unreadSnapshot = await get(unreadMessagesRef);
            let unreadMessageIds = [];

            // Проверяем, существует ли массив и удаляем `messageId`, если он там есть
            if (unreadSnapshot.exists()) {
                unreadMessageIds = unreadSnapshot.val();
                unreadMessageIds = unreadMessageIds.filter(
                    (id) => id !== messageId
                );
            }

            // Если после удаления массив пуст, записываем пустой массив, чтобы сохранить структуру
            // скорее всего это запись лишняя, т.к. firebase обнулит данную ячейку, если в ней не будет данных
            // и это нормально, пусть путой удаляет.
            await set(unreadMessagesRef, unreadMessageIds);

            console.log(
                `Сообщение ${messageId} отмечено как прочитанное и удалено из списка непрочитанных для пользователя ${recipientId}`
            );
        } catch (error) {
            console.error(
                'Ошибка при отметке сообщения как прочитанного:',
                error
            );
            throw error;
        }
    },

    // Метод возвращает все разговоры, в которых участвует пользователь.
    // Этот метод сначала загружает все разговоры, а затем фильтрует их,
    // чтобы выбрать только те, где userId присутствует в списке участников.
    // Поле participants рассматривается как массив объектов { userId, userName, userPhotoUrl },
    // и проверка на участие происходит через метод some, который ищет совпадение по userId
    async getUserConversations(userId) {
        try {
            const conversationsRef = dbRef(db, 'conversations');
            const snapshot = await get(conversationsRef);

            const conversations = [];
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();

                // Проверяем, является ли userId одним из участников
                const isParticipant = data.participants.some(
                    (participant) => participant.userId === userId
                );

                if (isParticipant) {
                    const conversation = {
                        conversationId: childSnapshot.key,
                        ...data,
                    };
                    conversations.push(conversation);
                }
            });

            return conversations;
        } catch (error) {
            console.error(
                'Ошибка при получении разговоров пользователя:',
                error
            );
            throw error;
        }
    },

    // Метод удаления из messages, unreadMessages и удаление messageId из conversation:
    // Если после удаления id из массива messages в conversation - массив пуст, присваиваем messages значение '' (пустая строка).
    //++ с горем пополам, но вроде бы заработало через строки, но к сожалению, не получается просто удалить из массива разговора
    async deleteMessage(messageId) {
        try {
            // Получаем данные сообщения, чтобы найти conversationId и recipientId
            const messageRef = dbRef(db, `messages/${messageId}`);
            const messageSnapshot = await get(messageRef);

            if (!messageSnapshot.exists()) {
                console.error(`Сообщение с ID ${messageId} не найдено.`);
                return;
            }

            const { conversationId, recipientId } = messageSnapshot.val();

            // Получаем все сообщения по conversationId
            const messages = await this.getMessagesByConversationId(
                conversationId
            );

            console.log('массив до удаления: ', messages);
            // Формируем массив messageId
            let messageIds = messages.map((msg) => msg.messageId);

            console.log('массив до удаления: ', messageIds);

            // Удаляем нужный messageId из массива
            messageIds = messageIds.filter((id) => id !== messageId);
            console.log('Массив messageIds после удаления:', messageIds);

            // Обновляем массив messageIds в разговоре или присваиваем пустую строку
            const conversationRef = dbRef(
                db,
                `conversations/${conversationId}`
            );
            await update(conversationRef, {
                messages: messageIds.length > 0 ? messageIds : '',
            });

            // Удаляем сообщение из коллекции сообщений
            await remove(messageRef);

            // Удаляем сообщение из списка непрочитанных, если оно там есть
            const unreadRef = dbRef(
                db,
                `unreadMessages/${recipientId}/${messageId}`
            );
            await remove(unreadRef);

            console.log(
                `Сообщение ${messageId} удалено из разговора ${conversationId}`
            );
        } catch (error) {
            console.error('Ошибка при удалении сообщения:', error);
            throw error;
        }
    },

    //При отправке нового сообщения метод обновляет поле lastMessage в разговоре.
    async updateLastMessageInConversation(conversationId, lastMessage) {
        try {
            const conversationRef = dbRef(
                db,
                `conversations/${conversationId}`
            );
            await update(conversationRef, { lastMessage });
        } catch (error) {
            console.error(
                'Ошибка при обновлении последнего сообщения в разговоре:',
                error
            );
            throw error;
        }
    },
};

export default ConversationService;
