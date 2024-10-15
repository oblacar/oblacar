// src/scripts/addTransportAds.js
import { db } from '../firebase'; // Импортируйте ваш экземпляр Firebase
import { ref, set, push } from 'firebase/database';
import {transportAds} from './testTransportAds'

// const transportAds = [
//     {
//         ownerId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
//         vehicleType: 'Грузовик',
//         availabilityDate: '2024-10-15',
//         location: 'Москва',
//         destination: 'Санкт-Петербург',
//         price: 15000,
//         description: 'В хорошем состоянии, готов к перевозке.',
//         contactInfo: 'user1@example.com',
//     },
//     {
//         ownerId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
//         vehicleType: 'Фура',
//         availabilityDate: '2024-10-16',
//         location: 'Екатеринбург',
//         destination: 'Казань',
//         price: 20000,
//         description: 'Мощный и надежный.',
//         contactInfo: 'user1@example.com',
//     },
//     {
//         ownerId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
//         vehicleType: 'Минивэн',
//         availabilityDate: '2024-10-20',
//         location: 'Москва',
//         destination: 'Нижний Новгород',
//         price: 12000,
//         description: 'Подходит для семейных поездок.',
//         contactInfo: 'user1@example.com',
//     },
//     {
//         ownerId: 'RFE2sA5BdYcvhHzLXEwKZoB53Tc2',
//         vehicleType: 'Газель',
//         availabilityDate: '2024-10-18',
//         location: 'Калуга',
//         destination: 'Москва',
//         price: 8000,
//         description: 'Удобно для перевозки мебели.',
//         contactInfo: 'user2@example.com',
//     },
//     {
//         ownerId: 'RFE2sA5BdYcvhHzLXEwKZoB53Tc2',
//         vehicleType: 'Тентованный грузовик',
//         availabilityDate: '2024-10-25',
//         location: 'Казань',
//         destination: 'Самара',
//         price: 17000,
//         description: 'Защита от дождя и снега.',
//         contactInfo: 'user2@example.com',
//     },
//     {
//         ownerId: 'RFE2sA5BdYcvhHzLXEwKZoB53Tc2',
//         vehicleType: 'Пикап',
//         availabilityDate: '2024-10-22',
//         location: 'Саратов',
//         destination: 'Оренбург',
//         price: 11000,
//         description: 'Идеально подходит для строительных материалов.',
//         contactInfo: 'user2@example.com',
//     },
//     {
//         ownerId: 'bTh6laDni4Yn2J6L6hveFPR6byy2',
//         vehicleType: 'Фургон',
//         availabilityDate: '2024-10-19',
//         location: 'Тула',
//         destination: 'Липецк',
//         price: 9500,
//         description: 'Хорошее состояние, просторный.',
//         contactInfo: 'user3@example.com',
//     },
//     {
//         ownerId: 'bTh6laDni4Yn2J6L6hveFPR6byy2',
//         vehicleType: 'Специальный транспорт',
//         availabilityDate: '2024-10-28',
//         location: 'Сочи',
//         destination: 'Краснодар',
//         price: 25000,
//         description: 'Для перевозки тяжелых грузов.',
//         contactInfo: 'user3@example.com',
//     },
//     {
//         ownerId: 'bTh6laDni4Yn2J6L6hveFPR6byy2',
//         vehicleType: 'Автобус',
//         availabilityDate: '2024-10-30',
//         location: 'Ростов-на-Дону',
//         destination: 'Волгоград',
//         price: 30000,
//         description: 'Вместимость 50 человек.',
//         contactInfo: 'user3@example.com',
//     },
//     {
//         ownerId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
//         vehicleType: 'Микроавтобус',
//         availabilityDate: '2024-11-01',
//         location: 'Кострома',
//         destination: 'Ярославль',
//         price: 14000,
//         description: 'Удобен для групповых поездок.',
//         contactInfo: 'user1@example.com',
//     },
//     {
//         ownerId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
//         vehicleType: 'Седельный тягач',
//         availabilityDate: '2024-11-05',
//         location: 'Пенза',
//         destination: 'Курск',
//         price: 22000,
//         description: 'Идеально для международных перевозок.',
//         contactInfo: 'user1@example.com',
//     },
//     {
//         ownerId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
//         vehicleType: 'Грузовой автобус',
//         availabilityDate: '2024-11-10',
//         location: 'Тверь',
//         destination: 'Москва',
//         price: 18000,
//         description: 'Специально оборудованный.',
//         contactInfo: 'user1@example.com',
//     },
//     {
//         ownerId: 'RFE2sA5BdYcvhHzLXEwKZoB53Tc2',
//         vehicleType: 'Бортовой грузовик',
//         availabilityDate: '2024-11-12',
//         location: 'Челябинск',
//         destination: 'Екатеринбург',
//         price: 16000,
//         description: 'Нагрузка до 5 тонн.',
//         contactInfo: 'user2@example.com',
//     },
//     {
//         ownerId: 'RFE2sA5BdYcvhHzLXEwKZoB53Tc2',
//         vehicleType: 'Автоцистерна',
//         availabilityDate: '2024-11-15',
//         location: 'Пермь',
//         destination: 'Свердловская область',
//         price: 35000,
//         description: 'Перевозка жидких грузов.',
//         contactInfo: 'user2@example.com',
//     },
//     {
//         ownerId: 'RFE2sA5BdYcvhHzLXEwKZoB53Tc2',
//         vehicleType: 'Легковой автомобиль',
//         availabilityDate: '2024-11-18',
//         location: 'Уфа',
//         destination: 'Набережные Челны',
//         price: 10000,
//         description: 'Подходит для небольших грузов.',
//         contactInfo: 'user2@example.com',
//     },
//     {
//         ownerId: 'bTh6laDni4Yn2J6L6hveFPR6byy2',
//         vehicleType: 'Доставка на велосипедах',
//         availabilityDate: '2024-11-20',
//         location: 'Москва',
//         destination: 'ЦАО',
//         price: 3000,
//         description: 'Быстрая доставка на малые расстояния.',
//         contactInfo: 'user3@example.com',
//     },
//     {
//         ownerId: 'bTh6laDni4Yn2J6L6hveFPR6byy2',
//         vehicleType: 'Транспорт с подъемником',
//         availabilityDate: '2024-11-25',
//         location: 'Воронеж',
//         destination: 'Саратов',
//         price: 21000,
//         description: 'Удобен для крупных грузов.',
//         contactInfo: 'user3@example.com',
//     },
//     {
//         ownerId: 'bTh6laDni4Yn2J6L6hveFPR6byy2',
//         vehicleType: 'Квадроцикл',
//         availabilityDate: '2024-12-01',
//         location: 'Астрахань',
//         destination: 'Каспийск',
//         price: 8000,
//         description: 'Подходит для туристических перевозок.',
//         contactInfo: 'user3@example.com',
//     },
//     {
//         ownerId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
//         vehicleType: 'Мотоцикл',
//         availabilityDate: '2024-12-03',
//         location: 'Симферополь',
//         destination: 'Ялта',
//         price: 5000,
//         description: 'Скоростная доставка.',
//         contactInfo: 'user1@example.com',
//     },
//     {
//         ownerId: 'A9lTs7ZeBsOHADGE1MGlFCKx08u1',
//         vehicleType: 'Лодка',
//         availabilityDate: '2024-12-10',
//         location: 'Калуга',
//         destination: 'Кострома',
//         price: 30000,
//         description: 'Подходит для доставки по водным маршрутам.',
//         contactInfo: 'user1@example.com',
//     },
//     {
//         ownerId: 'RFE2sA5BdYcvhHzLXEwKZoB53Tc2',
//         vehicleType: 'Вездеход',
//         availabilityDate: '2024-12-12',
//         location: 'Санкт-Петербург',
//         destination: 'Мурманск',
//         price: 40000,
//         description: 'Специально для сложных маршрутов.',
//         contactInfo: 'user2@example.com',
//     },
//     {
//         ownerId: 'RFE2sA5BdYcvhHzLXEwKZoB53Tc2',
//         vehicleType: 'Снегоход',
//         availabilityDate: '2024-12-15',
//         location: 'Челябинск',
//         destination: 'Тюмень',
//         price: 15000,
//         description: 'Подходит для зимних перевозок.',
//         contactInfo: 'user2@example.com',
//     },
//     {
//         ownerId: 'bTh6laDni4Yn2J6L6hveFPR6byy2',
//         vehicleType: 'Транспортный кран',
//         availabilityDate: '2024-12-20',
//         location: 'Краснодар',
//         destination: 'Ростов',
//         price: 50000,
//         description: 'Идеален для строительных площадок.',
//         contactInfo: 'user3@example.com',
//     },
// ];

export const addTransportAds = async () => {
    const transportAdsRef = ref(db, 'transportAds'); // Ссылка на раздел transportAds в Realtime Database

    for (const ad of transportAds) {
        try {
            const newAdRef = push(transportAdsRef); // Создает уникальный ключ для нового объявления
            await set(newAdRef, ad); // Сохраняет данные в базе
            console.log('Объявление добавлено:', ad);
        } catch (error) {
            console.error('Ошибка при добавлении объявления:', error);
        }
    }
};
