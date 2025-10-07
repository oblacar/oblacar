export default class AdCargoRequest {
    constructor({ adId, adData, requestData }) {
        this.adId = adId;          // для поиска и сопоставления
        this.adData = adData;      // копия заголовка (departureCity, destinationCity, ...)
        this.requestData = requestData; // объект CargoRequest ИЛИ его «плоская» форма
    }
}
