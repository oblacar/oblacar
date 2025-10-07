// Заголовок объявления ГРУЗА для узла cargoRequests/{ownerId}/{adId}
export default class CargoRequestMainData {
    constructor({
        adId,                      // ID объявления груза
        departureCity,             // "Москва"
        destinationCity,           // "Санкт-Петербург"
        date,                      // дата отгрузки (pickupDate) "dd.mm.yyyy" (или как у тебя в карточке)
        price,                     // число
        paymentUnit,               // "руб", "тыс. руб" и т.п.
        owner: {
            id,
            name,
            photoUrl,
            contact,
        },
    },                // { id, name, photourl, contact } — владелец груза
    ) {
        this.adId = adId;
        this.departureCity = departureCity;
        this.destinationCity = destinationCity;
        this.date = date;
        this.price = price;
        this.paymentUnit = paymentUnit;
        this.owner = owner;
    }
}
