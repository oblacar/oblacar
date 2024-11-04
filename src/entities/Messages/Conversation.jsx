import { Message } from './Message';

export class Conversation {
    constructor({
        conversationId,
        participants,
        messages = [],
        lastMessage = null,
    }) {
        this.conversationId = conversationId; // Уникальный ID переписки
        this.participants = participants; // Массив ID участников
        this.messages = messages.map((msg) => new Message(msg)); // Список сообщений как объекты Message
        this.lastMessage = lastMessage ? new Message(lastMessage) : null; // Последнее сообщение
    }

    // Метод для добавления нового сообщения
    addMessage(messageData) {
        const newMessage = new Message(messageData);
        this.messages.push(newMessage);
        this.lastMessage = newMessage;
    }
}
