import TransportationRequestMainData from './TransportationRequestMainData';
import TransportationRequest from './TransportationRequest';

class AdTransportationRequests {
    constructor({ mainData, requests = [] }) {
        this.mainData = mainData; // TransportationRequestMainData
        this.requests = requests; // Массив TransportationRequest
    }

    // Метод для добавления запроса
    addRequest(request) {
        this.requests.push(request);
    }
}

export default AdTransportationRequests;
