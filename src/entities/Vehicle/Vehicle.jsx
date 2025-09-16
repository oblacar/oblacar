// src/entities/transport.js

const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

export class Vehicle {
    /**
     * Все поля — без «магии», как вы любите.
     * ВНУТРИ ПРИЛОЖЕНИЯ: массивы (loadingTypes, truckPhotoUrls)
     */
    constructor({
        ownerId = '',
        truckId = Date.now(),
        truckName = '',
        transportType = '',
        loadingTypes = [], // string[]
        truckPhotoUrls = [], // string[] (URLs)
        truckWeight = 0, // т
        truckHeight = 0, // м
        truckWidth = 0, // м
        truckDepth = 0, // м
        isActive = true,
    } = {}) {
        this.ownerId = String(ownerId);
        this.truckId = Number(truckId);
        this.truckName = String(truckName).trim();
        this.transportType = String(transportType).trim();

        this.loadingTypes = Array.isArray(loadingTypes)
            ? [...loadingTypes]
            : [];
        this.truckPhotoUrls = Array.isArray(truckPhotoUrls)
            ? [...truckPhotoUrls]
            : [];

        this.truckWeight = toNum(truckWeight);
        this.truckHeight = toNum(truckHeight);
        this.truckWidth = toNum(truckWidth);
        this.truckDepth = toNum(truckDepth);

        this.isActive = !!isActive;
    }
}

/** Удобная фабрика из «сырых» данных формы */
export const createTransport = (ownerId, input = {}) =>
    new Vehicle({ ownerId, ...input });
