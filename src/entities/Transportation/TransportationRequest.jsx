class TransportationRequest {
    constructor({
        requestId,
        sender = {},
        dateSent,
        status = 'pending',
        dateConfirmed = null,
        description = '',
    }) {
        this.requestId = requestId; // Уникальный ID запроса
        this.sender = sender; // Объект отправителя
        this.dateSent = dateSent; // Дата отправки (формат dd.mm.yyyy)
        this.status = status; // Статус запроса
        this.dateConfirmed = dateConfirmed; // Дата подтверждения (если есть)
        this.description = description; //TODO добавляем. Пока не отлажено. Описание груза-машины в запросе
    }

    // Метод для обновления статуса
    updateStatus(newStatus, dateConfirmed = null) {
        this.status = newStatus;
        if (dateConfirmed) {
            this.dateConfirmed = dateConfirmed;
        }
    }
}

export default TransportationRequest;

// import TransportationRequest from '../entities/TransportationRequest';

// const newRequest = new TransportationRequest({
//     requestId: 'req003',
//     sender: {
//         id: 'user004',
//         name: 'Анна Кузнецова',
//         photoUrl: 'https://example.com/sender3.jpg',
//         contact: '+1122334455',
//     },
//     dateSent: '16.11.2024',
//     status: 'pending',
// });

// console.log(newRequest);

// newRequest.updateStatus('accepted', '17.11.2024');
// console.log(newRequest);

// тестовые данные:
// {
//     adId: "ad123",               // ID объявления
//     locationFrom: "Москва",      // Откуда
//     locationTo: "Санкт-Петербург", // Куда
//     date: "15.11.2024",          // Когда (формат dd.mm.yyyy)
//     price: 10000,                // За сколько
//     paymentUnit: "RUB",          // Единица измерения (например, RUB, USD, BYN)

//     owner: {                     // Владелец объявления
//         id: "user001",
//         name: "Иван Иванов",
//         photoUrl: "https://example.com/photo.jpg",
//         contact: "+1234567890"
//     },

//     requests: {                  // Объект запросов
//         "req001": {
//             requestId: "req001", // Уникальный ID запроса
//             sender: {            // Отправитель запроса
//                 id: "user002",
//                 name: "Сергей Петров",
//                 photoUrl: "https://example.com/sender.jpg",
//                 contact: "+0987654321"
//             },
//             dateSent: "15.11.2024",   // Дата отправки
//             status: "pending",        // Статус: pending, accepted, declined
//             dateConfirmed: null       // Дата подтверждения (если есть, в формате dd.mm.yyyy)
//         },
//         "req002": {
//             requestId: "req002",
//             sender: {
//                 id: "user003",
//                 name: "Петр Васильев",
//                 photoUrl: "https://example.com/sender2.jpg",
//                 contact: "+9876543210"
//             },
//             dateSent: "15.11.2024",
//             status: "pending",
//             dateConfirmed: null
//         }
//     }
// }
