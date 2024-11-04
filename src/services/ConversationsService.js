// getConversations(userId): Получение списка переписок для пользователя.
// getMessages(conversationId): Получение сообщений для конкретной переписки.
// createConversation(participants): Создание новой переписки.
// sendMessage(conversationId, senderId, text): Отправка сообщения и обновление lastMessage в переписке.

import { db } from '../firebase'; // предполагается, что Firebase инициализирован в этом файле
import { ref, push, update, get, child } from 'firebase/database';
import { Conversation, Message } from '../entities';

export class ConversationsService {
    static async getConversations(userId) {
        const conversationsRef = ref(db, 'Conversations');
        const snapshot = await get(child(conversationsRef, userId));

        if (snapshot.exists()) {
            const conversationsData = snapshot.val();
            return Object.keys(conversationsData).map(
                (key) => new Conversation(conversationsData[key])
            );
        } else {
            return [];
        }
    }

    static async getMessages(conversationId) {
        const messagesRef = ref(db, `Conversations/${conversationId}/messages`);
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
        const newConversationRef = push(ref(db, 'Conversations'));
        const conversationId = newConversationRef.key;
        const conversation = new Conversation({ conversationId, participants });

        await update(newConversationRef, { ...conversation });
        return conversation;
    }

    static async sendMessage(conversationId, senderId, text) {
        const message = new Message({ senderId, text });
        const messagesRef = ref(db, `Conversations/${conversationId}/messages`);
        const newMessageRef = push(messagesRef);

        await update(newMessageRef, { ...message });

        // Обновляем lastMessage
        await update(ref(db, `Conversations/${conversationId}`), {
            lastMessage: { ...message },
        });

        return message;
    }
}
