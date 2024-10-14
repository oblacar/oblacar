// models/TransportAd.js

class TransportAd {
    constructor(
        adId,
        ownerId,
        vehicleType,
        availabilityDate,
        location,
        destination,
        price,
        description,
        contactInfo
    ) {
        this.adId = adId; // уникальный идентификатор объявления
        this.ownerId = ownerId; // идентификатор владельца машины
        this.vehicleType = vehicleType; // тип транспортного средства (например, грузовик, фура)
        this.availabilityDate = availabilityDate; // дата, когда машина доступна
        this.location = location; // город, где находится транспортное средство
        this.destination = destination; // предполагаемое направление (если есть)
        this.price = price; // стоимость перевозки
        this.description = description; // описание состояния и особенностей машины
        this.contactInfo = contactInfo; // информация для связи с владельцем
    }
}

export default TransportAd;
