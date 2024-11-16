class AdTransportationRequest {
    constructor({
        adId,
        adData = {
            locationFrom: '',
            locationTo: '',
            date: '',
            price: 0,
            paymentUnit: '',
            owner: {
                id: '',
                name: '',
                photoUrl: '',
                contact: '',
            },
        },
        requestData = {
            description: '',//TODO добавляем тест запроса
            requestId: '',
            sender: {
                id: '',
                name: '',
                photoUrl: '',
                contact: '',
            },
            dateSent: '',
            status: 'none', // Статусы: pending, accepted, declined, cancelled, inProgress, completed, failed
        },
    }) {
        this.adId = adId;
        this.adData = adData;
        this.requestData = requestData;
    }
}

export default AdTransportationRequest;
