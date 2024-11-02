export class TransportAd {
    constructor({
        adId,
        ownerId,
        ownerName,
        ownerPhotoUrl,
        ownerRating,
        availabilityDate,
        departureCity,
        destinationCity,
        price,
        paymentUnit,
        readyToNegotiate,
        paymentOptions = [],
        status,
        truckId,
        truckName,
        truckPhotoUrls = [],
        transportType,
        loadingTypes = [],
        truckWeight,
        truckHeight,
        truckWidth,
        truckDepth,
    }) {
        this.adId = adId; // уникальный идентификатор объявления
        this.ownerId = ownerId; // идентификатор владельца машины
        this.ownerName = ownerName;
        this.ownerPhotoUrl = ownerPhotoUrl;
        this.ownerRating = ownerRating;
        //Статус объявления
        this.status = status;
        // Детали маршрута
        this.availabilityDate = availabilityDate; // дата, когда машина доступна
        this.departureCity = departureCity; // город, где находится транспортное средство
        this.destinationCity = destinationCity; // предполагаемое направление (если есть)
        // Детали оплаты
        this.price = price; // стоимость перевозки
        this.paymentUnit = paymentUnit; // единица стоимости (тыс.руб, руб, руб/км и т.д.)
        this.readyToNegotiate = readyToNegotiate; // готовность к торгу
        this.paymentOptions = paymentOptions; // условия оплаты: нал, б/нал, с НДС, без НДС и т.д.
        // Детали транспорта
        this.truckId = truckId; // id карточки машины в базе машин
        this.truckName = truckName; // имя карточки машины

        // this.truckPhotoUrls = truckPhotoUrls; // ссылка на фото машины
        // Создаем глубокую копию массива `truckPhotoUrls` для безопасности
        this.truckPhotoUrls = Array.isArray(truckPhotoUrls)
            ? [...truckPhotoUrls]
            : '';

        this.transportType = transportType; // тип транспортного средства (например, грузовик, фура)
        this.loadingTypes = loadingTypes; // тип загрузки
        this.truckWeight = truckWeight; // вес загрузки
        this.truckHeight = truckHeight; // высота
        this.truckWidth = truckWidth; // ширина
        this.truckDepth = truckDepth; // глубина
    }
}
