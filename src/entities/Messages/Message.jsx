export class Message {
    constructor({ messageId, senderId, text, timestamp }) {
        this.messageId = messageId; // Уникальный ID сообщения
        this.senderId = senderId; // ID отправителя
        this.text = text; // Текст сообщения
        this.timestamp = timestamp || new Date().toISOString(); // Метка времени
    }
}
