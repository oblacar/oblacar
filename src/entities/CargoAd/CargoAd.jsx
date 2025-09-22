// src/entities/CargoAd.js
class CargoAd {
  constructor({
    adId = Date.now(),
    ownerId = '',
    status = 'active',       // active | draft | closed
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),

    // что везём
    title = '',
    cargoType = '',          // категория
    description = '',

    photos = [],             // массив строк (dataURL/https) — в БД сохраним объектом

    // параметры
    weightTons = '',         // строка/число — общий вес
    dimensionsMeters = {     // габариты одного места (или общего — если одно)
      height: '',
      width: '',
      depth: '',
    },
    quantity = '',           // кол-во мест/паллет
    packagingType = '',      // паллеты/коробки/насыпной/наливной и т.п.
    isFragile = false,
    isStackable = false,
    adrClass = null,         // например "3" или null
    temperature = {          // опционально
      mode: 'ambient',       // ambient | chilled | frozen
      minC: '',
      maxC: '',
    },

    // маршрут/сроки
    departureCity = '',
    destinationCity = '',
    pickupDate = '',         // dd.MM.yyyy (как в вашем RouteSection)
    deliveryDate = '',       // опционально

    // погрузка/выгрузка
    preferredLoadingTypes = [], // массив строк — в БД объектом
    needTailLift = false,
    hasForkliftAtPickup = false,
    hasForkliftAtDelivery = false,

    // бюджет
    price = '',
    paymentUnit = 'руб',
    readyToNegotiate = true,

    // пожелания к ТС (опционально)
    transportPreferences = {
      transportType: '',     // из ваших truckTypesWithLoading.name, если важно
      loadingTypes: [],      // массив строк
    },
  } = {}) {
    this.adId = adId;
    this.ownerId = ownerId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.title = title;
    this.cargoType = cargoType;
    this.description = description;

    this.photos = Array.isArray(photos) ? photos.slice() : [];

    this.weightTons = weightTons;
    this.dimensionsMeters = { ...dimensionsMeters };
    this.quantity = quantity;
    this.packagingType = packagingType;
    this.isFragile = !!isFragile;
    this.isStackable = !!isStackable;
    this.adrClass = adrClass;
    this.temperature = { ...temperature };

    this.departureCity = departureCity;
    this.destinationCity = destinationCity;
    this.pickupDate = pickupDate;
    this.deliveryDate = deliveryDate;

    this.preferredLoadingTypes = Array.isArray(preferredLoadingTypes)
      ? preferredLoadingTypes.slice() : [];
    this.needTailLift = !!needTailLift;
    this.hasForkliftAtPickup = !!hasForkliftAtPickup;
    this.hasForkliftAtDelivery = !!hasForkliftAtDelivery;

    this.price = price;
    this.paymentUnit = paymentUnit;
    this.readyToNegotiate = !!readyToNegotiate;

    this.transportPreferences = {
      transportType: transportPreferences?.transportType || '',
      loadingTypes: Array.isArray(transportPreferences?.loadingTypes)
        ? transportPreferences.loadingTypes.slice() : [],
    };
  }
}

export default CargoAd;
