export class Message {
    constructor({ messageId, senderId, text, timestamp }) {
        this.messageId = messageId || `msg_${Date.now()}`; // Создаем уникальный messageId, если он не задан
        this.senderId = senderId; // ID отправителя
        this.text = text; // Текст сообщения
        this.timestamp = timestamp || new Date().toISOString(); // Метка времени
    }
}
