// src/entities/Messages/ExtendedConversation.js
// participants - массив из двух объектов типа: { userId: '', userName: '', userPhotoUrl: '' }
// В качестве аргумента получаем объект,
// что бы мы могли передавать параметры в любом порядке и любом, даже не полном наборе.
// Например:
// const conversation = new ExtendedConversation({
//     adId: 'someAdId',
//     conversationId: 'someConversationId',
//     participants: [{ userId: '1', userName: 'User1', userPhotoUrl: 'url1' }],
//     messages: [],
//     availabilityDate: '2023-11-01',
// });
class ExtendedConversation {
    constructor({
        conversationId = '',
        adId = '',
        availabilityDate = '',
        departureCity = '',
        destinationCity = '',
        priceAndPaymentUnit = '',
        participants = [],
        messages = [],
        lastMessage = null,
    } = {}) {
        this.conversationId = conversationId;
        this.adId = adId;
        this.availabilityDate = availabilityDate;
        this.departureCity = departureCity;
        this.destinationCity = destinationCity;
        this.priceAndPaymentUnit = priceAndPaymentUnit;
        this.participants = participants;
        this.messages = messages;
        this.lastMessage = lastMessage;
    }
}

export default ExtendedConversation;
