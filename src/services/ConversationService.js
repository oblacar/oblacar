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
    // Метод createConversation создает новый разговор в базе данных
    // Создаем новый разговор в концепции объектов.
    // метод createConversation, который преобразует participants в объект с userId в качестве ключа:
    // -+ проходит тестирование
    async createConversation(adId, participantsArray) {
        console.log('Проверка данных перед созданием разговора:', {
            adId,
            participantsArray,
        });

        try {
            const conversationsRef = dbRef(db, 'conversations');
            const newConversationRef = push(conversationsRef);
            const conversationId = newConversationRef.key;

            // Преобразуем массив участников в объект
            const participants = participantsArray.reduce((acc, user) => {
                acc[user.userId] = {
                    userName: user.userName,
                    userPhotoUrl: user.userPhotoUrl,
                    userId: user.userId,
                };
                return acc;
            }, {});

            // Создаем данные для разговора
            const conversationData = {
                conversationId,
                adId,
                participants, // Теперь это объект, а не массив
                messages: {}, // Пустой объект для хранения сообщений по ключу
                lastMessage: null,
            };

            // Сохраняем разговор в Firebase
            await set(newConversationRef, conversationData);

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

    // const ConversationService = {
    //     //Метод createConversation будет создавать новый разговор в базе данных
    //     async createConversation(adId, participants) {
    //         console.log('Проверка данных перед созданием разговора:', {
    //             adId,
    //             participants,
    //         });

    //         try {
    //             const conversationsRef = dbRef(db, 'conversations');
    //             const newConversationRef = push(conversationsRef);
    //             const conversationId = newConversationRef.key; // Получаем ID разговора

    //             // Создаем новый разговор с conversationId
    //             const conversationData = new Conversation(
    //                 conversationId,
    //                 adId,
    //                 participants,
    //                 []
    //             );

    //             // Сохраняем разговор в Firebase
    //             await set(newConversationRef, conversationData.toFirebaseObject());
    //             console.log(
    //                 'Разговор успешно создан с ID:',
    //                 conversationData.conversationId
    //             );
    //             return conversationData;
    //         } catch (error) {
    //             console.error('Ошибка при создании разговора:', error);
    //             throw error;
    //         }
    //     },

    //метод добавляет сообщение в коллекцию сообщений, а также добавляет messageId в коллекцию unreadMessages
    // + перевели на строковую систему хранения ключей
    // async addMessage(
    //     conversationId,
    //     senderId,
    //     recipientId,
    //     adId,
    //     text,
    //     isDeliveryRequest = false
    // ) {
    //     try {
    //         const messagesRef = dbRef(db, 'messages');
    //         const newMessageRef = push(messagesRef);
    //         const messageData = new Message(
    //             newMessageRef.key, // messageId, генерируемый Firebase
    //             conversationId,
    //             senderId,
    //             recipientId,
    //             adId,
    //             text,
    //             Date.now(),
    //             false, // По умолчанию сообщение считается непрочитанным
    //             isDeliveryRequest
    //         );

    //         // Сохраняем сообщение в Firebase
    //         await set(newMessageRef, messageData.toFirebaseObject());

    //         // Обновляем массив messageIds в разговоре
    //         const conversationMessagesRef = dbRef(
    //             db,
    //             `conversations/${conversationId}/messages`
    //         );
    //         const conversationSnapshot = await get(conversationMessagesRef);

    //         let messageIds = [];
    //         if (conversationSnapshot.exists()) {
    //             const messagesData = conversationSnapshot.val();
    //             messageIds = Array.isArray(messagesData) ? messagesData : []; // Проверяем, что messages — это массив
    //         }

    //         // Добавляем новый messageId как строку в массив
    //         messageIds.push(messageData.messageId);

    //         await update(dbRef(db, `conversations/${conversationId}`), {
    //             messages: messageIds,
    //         });

    //         // Добавляем messageId в непрочитанные для получателя
    //         await this.markMessageAsUnread(messageData.messageId);

    //         // Обновляем последнее сообщение в разговоре
    //         await this.updateLastMessageInConversation(conversationId, text);

    //         return messageData;
    //     } catch (error) {
    //         console.error('Ошибка при отправке сообщения:', error);
    //         throw error;
    //     }
    // },

    // Метод метод addMessage, который работает с объектом сообщений вместо массива.
    // В этом методе мы добавляем новый messageId в объект, где ключом является messageId,
    // а значением true (для отметки присутствия сообщения в разговоре).
    // -+ проходит тестирование
    async addMessage(
        conversationId,
        senderId,
        recipientId,
        adId,
        text,
        isDeliveryRequest = false
    ) {
        try {
            console.log('Создаем новое сообщение...');

            // Создаем новое сообщение
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
            console.log('Данные нового сообщения:', messageData);

            // Сохраняем сообщение в Firebase
            await set(newMessageRef, messageData.toFirebaseObject());
            console.log('Сообщение сохранено в базе данных.');

            // Добавляем messageId в объект messages в разговоре
            const conversationMessagesRef = dbRef(
                db,
                `conversations/${conversationId}/messages/${messageData.messageId}`
            );
            console.log('Добавляем messageId в разговор:', conversationId);

            await set(conversationMessagesRef, true);
            console.log('messageId добавлен в разговор.');

            // Отмечаем messageId как непрочитанный для получателя
            await this.markMessageAsUnread(messageData.messageId);
            console.log('Сообщение отмечено как непрочитанное для получателя.');

            // Обновляем последнее сообщение в разговоре
            await this.updateLastMessageInConversation(conversationId, text);
            console.log('Последнее сообщение обновлено в разговоре.');

            return messageData;
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            throw error;
        }
    },

    // async addMessage(
    //     conversationId,
    //     senderId,
    //     recipientId,
    //     adId,
    //     text,
    //     isDeliveryRequest = false
    // ) {
    //     try {
    //         // Создаем новое сообщение
    //         const messagesRef = dbRef(db, 'messages');
    //         const newMessageRef = push(messagesRef);
    //         const messageData = new Message(
    //             newMessageRef.key, // messageId, генерируемый Firebase
    //             conversationId,
    //             senderId,
    //             recipientId,
    //             adId,
    //             text,
    //             Date.now(),
    //             false, // По умолчанию сообщение считается непрочитанным
    //             isDeliveryRequest
    //         );

    //         // Сохраняем сообщение в Firebase
    //         await set(newMessageRef, messageData.toFirebaseObject());

    //         // Добавляем messageId в объект messages в разговоре
    //         const conversationMessagesRef = dbRef(
    //             db,
    //             `conversations/${conversationId}/messages/${messageData.messageId}`
    //         );

    //         await set(conversationMessagesRef, true);

    //         // Отмечаем messageId как непрочитанный для получателя
    //         await this.markMessageAsUnread(messageData.messageId);

    //         // Обновляем последнее сообщение в разговоре
    //         await this.updateLastMessageInConversation(conversationId, text);

    //         return messageData;
    //     } catch (error) {
    //         console.error('Ошибка при отправке сообщения:', error);
    //         throw error;
    //     }
    // },

    // Добавляет messageId в непрочитанные сообщения для пользователя
    // Проверка существования сообщения - предотвратит случайные добавления несуществующих messageId.
    // Обновление статуса isRead: false для сообщения.
    // + перевели на строковую систему хранения ключей

    // Метод markMessageAsUnread, который сохраняет непрочитанные сообщения как объекты
    // -+ вроде бы работает
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

            // Получаем текущий объект непрочитанных сообщений для пользователя
            const unreadMessagesRef = dbRef(
                db,
                `unreadMessages/${recipientId}`
            );
            const unreadSnapshot = await get(unreadMessagesRef);

            // Если данные уже существуют, преобразуем в объект или создаем новый объект
            const unreadMessageIds = unreadSnapshot.exists()
                ? unreadSnapshot.val()
                : {};

            // Проверяем, если messageId еще нет в непрочитанных, добавляем его
            if (!unreadMessageIds[messageId]) {
                unreadMessageIds[messageId] = true;
            }

            // Обновляем список непрочитанных сообщений
            await set(unreadMessagesRef, unreadMessageIds);
            console.log(
                `Сообщение ${messageId} добавлено в непрочитанные для пользователя ${recipientId}`
            );
        } catch (error) {
            console.error(
                'Ошибка при добавлении сообщения в непрочитанные:',
                error
            );
            throw error;
        }
    },

    // async markMessageAsUnread(messageId) {
    //     try {
    //         // Получаем данные сообщения для определения recipientId
    //         const messageRef = dbRef(db, `messages/${messageId}`);
    //         const snapshot = await get(messageRef);

    //         if (!snapshot.exists()) {
    //             console.error(`Сообщение с ID ${messageId} не найдено.`);
    //             return;
    //         }

    //         const { recipientId } = snapshot.val();

    //         // Обновление статуса isRead в самом сообщении
    //         await update(messageRef, { isRead: false });

    //         // Получаем текущий список непрочитанных сообщений для пользователя
    //         const unreadMessagesRef = dbRef(
    //             db,
    //             `unreadMessages/${recipientId}`
    //         );
    //         const unreadSnapshot = await get(unreadMessagesRef);
    //         let unreadMessageIds = [];

    //         // Проверяем существование массива и добавляем новое сообщение, если оно отсутствует
    //         if (unreadSnapshot.exists()) {
    //             unreadMessageIds = unreadSnapshot.val();
    //         }

    //         if (!unreadMessageIds.includes(messageId)) {
    //             unreadMessageIds.push(messageId);
    //         }

    //         // Обновляем список непрочитанных сообщений
    //         await set(unreadMessagesRef, unreadMessageIds);
    //     } catch (error) {
    //         console.error(
    //             'Ошибка при добавлении сообщения в непрочитанные:',
    //             error
    //         );
    //         throw error;
    //     }
    // },

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

            const snapshot = await get(conversationQuery);
            const conversations = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();

                    // Преобразуем объект `messages` в массив идентификаторов сообщений
                    const messageIds = data.messages
                        ? Object.keys(data.messages)
                        : [];

                    // Преобразуем объект `participants` в массив участников
                    const participantsArray = Object.values(data.participants);

                    conversations.push({
                        conversationId: childSnapshot.key,
                        adId: data.adId,
                        participants: participantsArray, // Передаем в виде массива, как ожидает Контекст
                        messageIds: messageIds, // Передаем идентификаторы сообщений как массив
                        lastMessage: data.lastMessage || null, // Последнее сообщение, если оно существует
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

    // async getConversationsByAdId(adId) {
    //     try {
    //         const conversationsRef = dbRef(db, 'conversations');
    //         const conversationQuery = query(
    //             conversationsRef,
    //             orderByChild('adId'),
    //             equalTo(adId)
    //         );

    //         // Запрос данных
    //         const snapshot = await get(conversationQuery);
    //         const conversations = [];

    //         if (snapshot.exists()) {
    //             snapshot.forEach((childSnapshot) => {
    //                 const data = childSnapshot.val();
    //                 conversations.push({
    //                     conversationId: childSnapshot.key,
    //                     adId: data.adId,
    //                     participants: data.participants,
    //                     messageIds: Array.isArray(data.messages)
    //                         ? data.messages.map(String)
    //                         : Object.keys(data.messages || {}),
    //                 });
    //             });
    //             console.log(`Разговоры для adId ${adId}:`, conversations);
    //             return conversations;
    //         } else {
    //             console.log(`Разговоры для adId ${adId} не найдены.`);
    //             return [];
    //         }
    //     } catch (error) {
    //         console.error('Ошибка при выполнении запроса:', error);
    //         throw error;
    //     }
    // },

    // Метод ищет конкретный разговор, основанный на adId и массиве participantsId из двух userId собеседников:
    // -- не проверен
    async getConversationByAdIdAndParticipantsId(adId, participantsId) {
        console.log('adId:', adId, 'participantsId:', participantsId);

        try {
            const conversationsRef = dbRef(db, 'conversations');
            const conversationQuery = query(
                conversationsRef,
                orderByChild('adId'),
                equalTo(adId)
            );

            // Запрос данных
            const snapshot = await get(conversationQuery);
            console.log('snapshot.exists():', snapshot.exists());

            if (snapshot.exists()) {
                let foundConversation = null;
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    console.log('Conversation data:', data);

                    // Проверяем существование и структуру участников
                    const conversationParticipants = data.participants
                        ? Object.values(data.participants)
                              .map((p) => p.userId)
                              .sort()
                        : [];
                    console.log(
                        'conversationParticipants:',
                        conversationParticipants
                    );

                    // Сравниваем участников
                    if (
                        conversationParticipants.length ===
                            participantsId.length &&
                        conversationParticipants.every(
                            (id, index) =>
                                id === participantsId.slice().sort()[index]
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
                        console.log(
                            'Matching conversation found:',
                            foundConversation
                        );
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
    //-+ через объекты, тестируем
    async getUnreadMessageIds(userId) {
        try {
            const unreadMessagesRef = dbRef(db, `unreadMessages/${userId}`);
            const snapshot = await get(unreadMessagesRef);

            if (snapshot.exists()) {
                // Извлекаем ключи (ID сообщений) из объекта непрочитанных сообщений
                const unreadMessageIds = Object.keys(snapshot.val());
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

    // async getUnreadMessageIds(userId) {
    //     try {
    //         const unreadMessagesRef = dbRef(db, `unreadMessages/${userId}`);
    //         const snapshot = await get(unreadMessagesRef);

    //         if (snapshot.exists()) {
    //             // Извлекаем массив `messageId`, который хранится как массив строк
    //             const unreadMessageIds = snapshot.val();
    //             console.log('Непрочитанные сообщения:', unreadMessageIds);
    //             return unreadMessageIds;
    //         } else {
    //             console.log(
    //                 `Нет непрочитанных сообщений для пользователя ${userId}`
    //             );
    //             return [];
    //         }
    //     } catch (error) {
    //         console.error(
    //             'Ошибка при получении непрочитанных сообщений:',
    //             error
    //         );
    //         throw error;
    //     }
    // },

    //Метод выполняет запрос для каждого messageId из массива пропсов,
    //извлекая его данные и возвращая массив объектов Message.
    //++ вроде бы нормальное работает со строками - ключами
    // -+ метод с работой с объектами
    async getMessagesByIds(messageIds) {
        try {
            const messages = [];

            console.log('in method messageIds: ', messageIds);

            for (const messageId of messageIds) {
                const messageRef = dbRef(db, `messages/${messageId}`);
                const snapshot = await get(messageRef);

                if (snapshot.exists()) {
                    const messageData = snapshot.val();
                    messages.push({
                        messageId,
                        conversationId: messageData.conversationId,
                        senderId: messageData.senderId,
                        recipientId: messageData.recipientId,
                        adId: messageData.adId,
                        text: messageData.text,
                        timestamp: messageData.timestamp,
                        isRead: messageData.isRead,
                        isDeliveryRequest: messageData.isDeliveryRequest,
                    });
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

    // async getMessagesByIds(messageIds) {
    //     try {
    //         const messages = [];

    //         for (const messageId of messageIds) {
    //             const messageRef = dbRef(db, `messages/${messageId}`);
    //             const snapshot = await get(messageRef);

    //             if (snapshot.exists()) {
    //                 const messageData = snapshot.val();
    //                 const message = new Message(
    //                     messageId,
    //                     messageData.conversationId,
    //                     messageData.senderId,
    //                     messageData.recipientId,
    //                     messageData.adId,
    //                     messageData.text,
    //                     messageData.timestamp,
    //                     messageData.isRead,
    //                     messageData.isDeliveryRequest
    //                 );
    //                 messages.push(message);
    //             } else {
    //                 console.warn(`Сообщение с ID ${messageId} не найдено`);
    //             }
    //         }

    //         return messages;
    //     } catch (error) {
    //         console.error(
    //             'Ошибка при получении сообщений по messageIds:',
    //             error
    //         );
    //         throw error;
    //     }
    // },

    //Метод обновляет статус isRead для сообщения и убирает его из списка непрочитанных.
    // + обновили для работы с ключами в виде текстовых строк
    // -+ объекты - не проверен
    async markMessageAsRead(messageId) {
        try {
            console.log(`Отмечаем сообщение ${messageId} как прочитанное...`);

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
            console.log(
                `Статус сообщения ${messageId} обновлен на прочитанный.`
            );

            // Получаем текущий объект непрочитанных сообщений для пользователя
            const unreadMessagesRef = dbRef(
                db,
                `unreadMessages/${recipientId}/${messageId}`
            );
            const unreadSnapshot = await get(unreadMessagesRef);

            // Если сообщение присутствует в непрочитанных, удаляем его
            if (unreadSnapshot.exists()) {
                await remove(unreadMessagesRef);
                console.log(
                    `Сообщение ${messageId} удалено из списка непрочитанных.`
                );
            } else {
                console.log(
                    `Сообщение ${messageId} уже не числится среди непрочитанных.`
                );
            }
        } catch (error) {
            console.error(
                'Ошибка при отметке сообщения как прочитанного:',
                error
            );
            throw error;
        }
    },

    // async markMessageAsRead(messageId) {
    //     try {
    //         // Получаем данные сообщения для определения recipientId
    //         const messageRef = dbRef(db, `messages/${messageId}`);
    //         const messageSnapshot = await get(messageRef);

    //         if (!messageSnapshot.exists()) {
    //             console.error(`Сообщение с ID ${messageId} не найдено.`);
    //             return;
    //         }

    //         const { recipientId } = messageSnapshot.val();

    //         // Обновляем статус isRead в самом сообщении
    //         await update(messageRef, { isRead: true });

    //         // Получаем текущий список непрочитанных сообщений для пользователя
    //         const unreadMessagesRef = dbRef(
    //             db,
    //             `unreadMessages/${recipientId}`
    //         );
    //         const unreadSnapshot = await get(unreadMessagesRef);
    //         let unreadMessageIds = [];

    //         // Проверяем, существует ли массив и удаляем `messageId`, если он там есть
    //         if (unreadSnapshot.exists()) {
    //             unreadMessageIds = unreadSnapshot.val();
    //             unreadMessageIds = unreadMessageIds.filter(
    //                 (id) => id !== messageId
    //             );
    //         }

    //         // Если после удаления массив пуст, записываем пустой массив, чтобы сохранить структуру
    //         // скорее всего это запись лишняя, т.к. firebase обнулит данную ячейку, если в ней не будет данных
    //         // и это нормально, пусть путой удаляет.
    //         await set(unreadMessagesRef, unreadMessageIds);

    //         console.log(
    //             `Сообщение ${messageId} отмечено как прочитанное и удалено из списка непрочитанных для пользователя ${recipientId}`
    //         );
    //     } catch (error) {
    //         console.error(
    //             'Ошибка при отметке сообщения как прочитанного:',
    //             error
    //         );
    //         throw error;
    //     }
    // },

    // Метод возвращает все разговоры, в которых участвует пользователь.
    // Этот метод сначала загружает все разговоры, а затем фильтрует их,
    // чтобы выбрать только те, где userId присутствует в списке участников.
    // Поле participants рассматривается как массив объектов { userId, userName, userPhotoUrl },
    // и проверка на участие происходит через метод some, который ищет совпадение по userId

    // Переделываем на объекты:
    //-+ не отлажен еще

    async getUserConversations(userId) {
        try {
            const conversationsRef = dbRef(db, 'conversations');
            const snapshot = await get(conversationsRef);

            const conversations = [];
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();

                // Проверяем, является ли userId одним из участников
                const isParticipant =
                    data.participants && data.participants[userId];

                if (isParticipant) {
                    // Преобразуем объект `messages` в массив идентификаторов сообщений
                    const messageIds = data.messages
                        ? Object.keys(data.messages)
                        : [];

                    console.log('В поиске разговоров сообщений: ', messageIds); // Все хорошо работает

                    // Преобразуем объект `participants` в массив участников
                    const participantsArray = Object.values(data.participants);

                    console.log(
                        'В поиске разгзоворов собеседники: ',
                        participantsArray
                    ); // Все хорошо работает

                    conversations.push({
                        conversationId: childSnapshot.key,
                        adId: data.adId,
                        participants: participantsArray, // Передаем в виде массива для Контекста
                        messages: messageIds, // Передаем идентификаторы сообщений как массив
                        lastMessage: data.lastMessage || null, // Последнее сообщение, если оно существует
                    });
                }
            });

            console.log('вытащенные разговоры: ', conversations);

            return conversations;
        } catch (error) {
            console.error(
                'Ошибка при получении разговоров пользователя:',
                error
            );
            throw error;
        }
    },

    // async getUserConversations(userId) {
    //     try {
    //         const conversationsRef = dbRef(db, 'conversations');
    //         const snapshot = await get(conversationsRef);

    //         const conversations = [];
    //         snapshot.forEach((childSnapshot) => {
    //             const data = childSnapshot.val();

    //             // Проверяем, является ли userId одним из участников
    //             const isParticipant = data.participants.some(
    //                 (participant) => participant.userId === userId
    //             );

    //             if (isParticipant) {
    //                 const conversation = {
    //                     conversationId: childSnapshot.key,
    //                     ...data,
    //                 };
    //                 conversations.push(conversation);
    //             }
    //         });

    //         return conversations;
    //     } catch (error) {
    //         console.error(
    //             'Ошибка при получении разговоров пользователя:',
    //             error
    //         );
    //         throw error;
    //     }
    // },

    // Метод удаления из messages, unreadMessages и удаление messageId из conversation:
    // Если после удаления id из массива messages в conversation - массив пуст, присваиваем messages значение '' (пустая строка).
    //++ с горем пополам, но вроде бы заработало через строки, но к сожалению, не получается просто удалить из массива разговора
    // самый проблемый метод
    // -- переделываем на объектный вариант

    async deleteMessage(messageId) {
        try {
            console.log(`Удаление сообщения с ID: ${messageId}...`);

            // Получаем данные сообщения, чтобы найти conversationId и recipientId
            const messageRef = dbRef(db, `messages/${messageId}`);
            const messageSnapshot = await get(messageRef);

            if (!messageSnapshot.exists()) {
                console.error(`Сообщение с ID ${messageId} не найдено.`);
                return;
            }

            const { conversationId, recipientId } = messageSnapshot.val();

            // Удаляем сообщение из объекта messages в разговоре
            const conversationMessagesRef = dbRef(
                db,
                `conversations/${conversationId}/messages/${messageId}`
            );
            await remove(conversationMessagesRef);
            console.log(
                `Сообщение ${messageId} удалено из объекта сообщений в разговоре.`
            );

            // Удаляем само сообщение из коллекции сообщений
            await remove(messageRef);
            console.log(
                `Сообщение ${messageId} удалено из коллекции сообщений.`
            );

            // Удаляем сообщение из списка непрочитанных, если оно там есть
            const unreadRef = dbRef(
                db,
                `unreadMessages/${recipientId}/${messageId}`
            );
            await remove(unreadRef);
            console.log(
                `Сообщение ${messageId} удалено из списка непрочитанных.`
            );

            console.log(
                `Сообщение ${messageId} полностью удалено из разговора ${conversationId}.`
            );
        } catch (error) {
            console.error('Ошибка при удалении сообщения:', error);
            throw error;
        }
    },

    // async deleteMessage(messageId) {
    //     try {
    //         // Получаем данные сообщения, чтобы найти conversationId и recipientId
    //         const messageRef = dbRef(db, `messages/${messageId}`);
    //         const messageSnapshot = await get(messageRef);

    //         if (!messageSnapshot.exists()) {
    //             console.error(`Сообщение с ID ${messageId} не найдено.`);
    //             return;
    //         }

    //         const { conversationId, recipientId } = messageSnapshot.val();

    //         // Получаем все сообщения по conversationId
    //         const messages = await this.getMessagesByConversationId(
    //             conversationId
    //         );

    //         console.log('массив до удаления: ', messages);
    //         // Формируем массив messageId
    //         let messageIds = messages.map((msg) => msg.messageId);

    //         console.log('массив до удаления: ', messageIds);

    //         // Удаляем нужный messageId из массива
    //         messageIds = messageIds.filter((id) => id !== messageId);
    //         console.log('Массив messageIds после удаления:', messageIds);

    //         // Обновляем массив messageIds в разговоре или присваиваем пустую строку
    //         const conversationRef = dbRef(
    //             db,
    //             `conversations/${conversationId}`
    //         );
    //         await update(conversationRef, {
    //             messages: messageIds.length > 0 ? messageIds : '',
    //         });

    //         // Удаляем сообщение из коллекции сообщений
    //         await remove(messageRef);

    //         // Удаляем сообщение из списка непрочитанных, если оно там есть
    //         const unreadRef = dbRef(
    //             db,
    //             `unreadMessages/${recipientId}/${messageId}`
    //         );
    //         await remove(unreadRef);

    //         console.log(
    //             `Сообщение ${messageId} удалено из разговора ${conversationId}`
    //         );
    //     } catch (error) {
    //         console.error('Ошибка при удалении сообщения:', error);
    //         throw error;
    //     }
    // },

    //При отправке нового сообщения метод обновляет поле lastMessage в разговоре.
    // работает в конепции объекта
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

    //Получаем список непрочитанных сообщений: Берем messageId непрочитанных сообщений из unreadMessages/${userId}.
    //Извлекаем сообщения: Используем Promise.all, чтобы загрузить все сообщения по идентификаторам.
    //Фильтрация: Если какое-то сообщение отсутствует, оно будет исключено из результирующего массива.
    //Возвращаем массив сообщений: Результат — массив объектов сообщений с их содержимым, готовых к отображению.
    //-+ переделка на объекты
    async getUnreadMessagesByUserId(userId) {
        try {
            // Получаем список ID непрочитанных сообщений для пользователя
            const unreadMessageIds = await this.getUnreadMessageIds(userId);

            if (unreadMessageIds && unreadMessageIds.length > 0) {
                // Загружаем сообщения по ID
                const unreadMessages = await Promise.all(
                    unreadMessageIds.map(async (messageId) => {
                        const messageRef = dbRef(db, `messages/${messageId}`);
                        const messageSnapshot = await get(messageRef);

                        if (messageSnapshot.exists()) {
                            return { messageId, ...messageSnapshot.val() };
                        } else {
                            console.warn(
                                `Сообщение с ID ${messageId} не найдено.`
                            );
                            return null;
                        }
                    })
                );

                // Фильтруем null-значения, если какие-то сообщения не найдены
                return unreadMessages.filter((message) => message !== null);
            } else {
                console.log(
                    `Нет непрочитанных сообщений для пользователя с ID ${userId}`
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

    // async getUnreadMessagesByUserId(userId) {
    //     try {
    //         // Получаем ссылку на непрочитанные сообщения пользователя
    //         const unreadMessageIds = await this.getUnreadMessageIds(userId);

    //         if (unreadMessageIds) {
    //             // Загружаем сами сообщения по id
    //             const unreadMessages = await Promise.all(
    //                 unreadMessageIds.map(async (messageId) => {
    //                     const messageRef = dbRef(db, `messages/${messageId}`);
    //                     const messageSnapshot = await get(messageRef);

    //                     if (messageSnapshot.exists()) {
    //                         return { messageId, ...messageSnapshot.val() };
    //                     } else {
    //                         console.warn(
    //                             `Сообщение с ID ${messageId} не найдено.`
    //                         );
    //                         return null;
    //                     }
    //                 })
    //             );

    //             // Фильтруем возможные null-значения, если какие-то сообщения не найдены
    //             return unreadMessages.filter((message) => message !== null);
    //         } else {
    //             console.log(
    //                 `Нет непрочитанных сообщений для пользователя с ID ${userId}`
    //             );
    //             return [];
    //         }
    //     } catch (error) {
    //         console.error(
    //             'Ошибка при получении непрочитанных сообщений:',
    //             error
    //         );
    //         throw error;
    //     }
    // },
};

export default ConversationService;
