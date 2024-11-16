class TransportationRequestMainData {
    constructor({
        adId,
        locationFrom,
        locationTo,
        date,
        price,
        paymentUnit,
        owner = {},
    }) {
        this.adId = adId; // ID объявления
        this.locationFrom = locationFrom; // Откуда
        this.locationTo = locationTo; // Куда
        this.date = date; // Когда (формат dd.mm.yyyy)
        this.price = price; // За сколько
        this.paymentUnit = paymentUnit; // Единица измерения
        this.owner = owner; // Данные владельца объявления
    }
}

export default TransportationRequestMainData;

// const mainData = new TransportationRequestMainData({
//     adId: 'ad123',
//     locationFrom: 'Москва',
//     locationTo: 'Санкт-Петербург',
//     date: '15.11.2024',
//     price: 10000,
//     paymentUnit: 'RUB',
//     owner: {
//         id: 'user001',
//         name: 'Иван Иванов',
//         photoUrl: 'https://example.com/photo.jpg',
//         contact: '+1234567890',
//     },
// });
