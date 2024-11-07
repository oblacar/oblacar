// src/entities/Messages/ExtendedConversation.js
//participants - массив из двух объектов типа: { userId: '', userName: '', userPhotoUrl: '' }
class ExtendedConversation {
    constructor(conversationId, adId, participants, messages = []) {
        this.conversationId = conversationId;
        this.adId = adId;
        this.participants = participants;
        this.messages = messages; // Полный массив объектов сообщений
    }
}

export default ExtendedConversation;
