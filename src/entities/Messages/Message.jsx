// src/entities/Messages/Message.js
class Message {
    constructor(
        messageId,
        conversationId,
        senderId,
        recipientId,
        adId,
        text,
        timestamp = Date.now(),
        isRead = false,
        isDeliveryRequest = false
    ) {
        this.messageId = messageId; // Уникальный идентификатор сообщения
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.adId = adId; // ID объявления, к которому относится сообщение
        this.text = text;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.isDeliveryRequest = isDeliveryRequest;
    }

    toFirebaseObject() {
        return {
            messageId: this.messageId, // Добавляем messageId в сохранение
            conversationId: this.conversationId,
            senderId: this.senderId,
            recipientId: this.recipientId,
            adId: this.adId,
            text: this.text,
            timestamp: this.timestamp,
            isRead: this.isRead,
            isDeliveryRequest: this.isDeliveryRequest,
        };
    }
}

export default Message;
