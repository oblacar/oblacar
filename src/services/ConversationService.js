// getConversations(userId): Получение списка переписок для пользователя.
// getMessages(conversationId): Получение сообщений для конкретной переписки.
// createConversation(participants): Создание новой переписки.
// sendMessage(conversationId, senderId, text): Отправка сообщения и обновление lastMessage в переписке.

import { db } from '../firebase'; // предполагается, что Firebase инициализирован в этом файле
import { ref, push, update, get, child } from 'firebase/database';
import { Conversation } from '../entities/Messages/Conversation';
import { Message } from '../entities/Messages/Message';

export class ConversationService {
    static async getConversations(userId) {
        // const conversationsRef = ref(db, 'conversations');
        // const snapshot = await get(child(conversationsRef, userId));

        // if (snapshot.exists()) {
        //     const conversationsData = snapshot.val();
        //     return Object.keys(conversationsData).map(
        //         (key) => new Conversation(conversationsData[key])
        //     );
        // } else {
        //     return [];
        // }
        try {
            console.log(`Fetching conversations for userId: ${userId}`); // Отладочный вывод
            const conversationsRef = ref(db, 'conversations'); // Убедитесь, что путь 'conversations' правильный
            const snapshot = await get(conversationsRef);

            if (snapshot.exists()) {
                const conversationsData = snapshot.val();
                console.log('Raw conversations data:', conversationsData); // Отладочный вывод всех данных из Firebase

                // Фильтрация переписок, в которых участвует userId
                const userConversations = Object.keys(conversationsData)
                    .map((key) => new Conversation(conversationsData[key]))
                    .filter((conv) => conv.participants.includes(userId));

                console.log('Filtered user conversations:', userConversations); // Отладочный вывод отфильтрованных данных

                return userConversations;
            } else {
                console.log('No conversations found.');
                return [];
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    static async getMessages(conversationId) {
        const messagesRef = ref(db, `conversations/${conversationId}/messages`);
        const snapshot = await get(messagesRef);

        if (snapshot.exists()) {
            const messagesData = snapshot.val();
            return Object.keys(messagesData).map(
                (key) => new Message(messagesData[key])
            );
        } else {
            return [];
        }
    }

    static async createConversation(participants) {
        const newConversationRef = push(ref(db, 'conversations'));
        const conversationId = newConversationRef.key;

        const conversation = new Conversation({
            conversationId,
            participants,
            messages: [],
        });

        await update(newConversationRef, { ...conversation });
        return conversation;
    }

    static async sendMessage(conversationId, senderId, text) {
        try {
            const message = new Message({ senderId, text }); // Объект Message гарантирует уникальный messageId
            const messagesRef = ref(
                db,
                `conversations/${conversationId}/messages`
            );
            const newMessageRef = push(messagesRef);

            // Убедимся, что messageId не undefined перед обновлением
            if (!message.messageId) {
                message.messageId = newMessageRef.key;
            }

            await update(newMessageRef, { ...message });
            return message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
}
