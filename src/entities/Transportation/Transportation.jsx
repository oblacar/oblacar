class Transportation {
    constructor({
        transportationId,
        adId,
        cargoOwner = {},
        truckOwner = {},
        status = 'pending',
        requestDetails = '',
        startDate = null,
        endDate = null,
        pickupPhotos = {},
        deliveryPhotos = {},
        chatId = null,
    }) {
        this.transportationId = transportationId;
        this.adId = adId;
        this.cargoOwner = cargoOwner;
        this.truckOwner = truckOwner;
        this.status = status;
        this.requestDetails = requestDetails;
        this.startDate = startDate;
        this.endDate = endDate;
        this.pickupPhotos = pickupPhotos;
        this.deliveryPhotos = deliveryPhotos;
        this.chatId = chatId;
    }
}

export default Transportation;
