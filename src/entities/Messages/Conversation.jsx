// src/entities/Messages/Conversation.js
// participants - массив из двух объектов типа: { userId: '', userName: '', userPhotoUrl: '' }
// если массивы пустой, передаем пустую строку. При чтении нужно будет преобразовать в пустой массив.
class Conversation {
    constructor(id, adId, participants = [], messages = [], lastMessage = '') {
        this.conversationId = id;
        this.id = id;
        this.adId = adId;
        this.participants = participants.length > 0 ? participants : '';
        this.messages = messages.length > 0 ? messages : '';
        this.lastMessage = lastMessage || '';
    }

    toFirebaseObject() {
        return {
            conversationId: this.conversationId,
            adId: this.adId,
            participants: this.participants,
            messages: this.messages,
            lastMessage: this.lastMessage,
        };
    }
}

export default Conversation;
