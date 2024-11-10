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
    constructor(conversationData, messages, adData) {
        if (
            typeof conversationData === 'object' &&
            conversationData !== null &&
            !Array.isArray(conversationData)
        ) {
            // Если передан объект conversationData в готовом виде
            this.conversationId = conversationData.conversationId || '';
            this.adId = conversationData.adId || '';
            this.availabilityDate = conversationData.availabilityDate || '';
            this.departureCity = conversationData.departureCity || '';
            this.destinationCity = conversationData.destinationCity || '';
            this.priceAndPaymentUnit =
                conversationData.priceAndPaymentUnit || '';
            this.participants = conversationData.participants || [];
            this.messages = conversationData.messages || [];
            this.lastMessage = conversationData.lastMessage || null;
        } else if (conversationData && messages && adData) {
            // Если переданы conversation, messages и adData как отдельные параметры
            this.conversationId = conversationData.conversationId || '';
            this.adId = conversationData.adId || '';
            this.availabilityDate = adData.availabilityDate || '';
            this.departureCity = adData.departureCity || '';
            this.destinationCity = adData.destinationCity || '';
            this.priceAndPaymentUnit = `${adData.price || ''} ${
                adData.paymentUnit || ''
            }`;
            this.participants = conversationData.participants || [];
            this.messages = messages || [];
            this.lastMessage = conversationData.lastMessage || null;
        } else {
            throw new Error(
                'Invalid arguments passed to ExtendedConversation constructor'
            );
        }
    }
}

export default ExtendedConversation;
// // Примеры использования:

// // 1. Создание из готового объекта conversationData
// const convData = {
//     conversationId: '123',
//     adId: 'ad456',
//     availabilityDate: '2024-12-01',
//     departureCity: 'Город A',
//     destinationCity: 'Город B',
//     priceAndPaymentUnit: '1000 USD',
//     participants: [{ userId: 'u1' }, { userId: 'u2' }],
//     messages: [],
//     lastMessage: 'Последнее сообщение',
// };
// const extendedConv1 = new ExtendedConversation(convData);

// // 2. Создание из отдельных conversation, messages и adData
// const conversation = {
//     conversationId: '123',
//     adId: 'ad456',
//     participants: [{ userId: 'u1' }, { userId: 'u2' }],
//     lastMessage: 'Последнее сообщение',
// };
// const messages = [
//     { messageId: 'm1', text: 'Привет' },
//     { messageId: 'm2', text: 'Как дела?' },
// ];
// const adData = {
//     availabilityDate: '2024-12-01',
//     departureCity: 'Город A',
//     destinationCity: 'Город B',
//     price: '1000',
//     paymentUnit: 'USD',
// };
// const extendedConv2 = new ExtendedConversation(conversation, messages, adData);
