// transport.js
class Transport {
    constructor(
        id,
        name,
        type,
        loadingType,
        photo,
        ownerId,
        capacityVolume,
        capacityWeight
    ) {
        this.id = id; // уникальный идентификатор транспортного средства
        this.name = name; // название, заданное пользователем
        this.type = type; // тип грузовика (например, "Еврофура")
        this.loadingType = loadingType; // тип загрузки - массив возможных вариантов загрузки
        this.photo = photo; // URL фото транспортного средства
        this.ownerId = ownerId; // идентификатор владельца
        this.capacityVolume = capacityVolume; // объем, который может перевозить машина (например, в кубометрах)
        this.capacityWeight = capacityWeight; // вес, который может перевозить машина (например, в тоннах)
    }
}
