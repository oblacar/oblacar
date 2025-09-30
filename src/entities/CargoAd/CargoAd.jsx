// src/entities/CargoAd.js
/**
 * Единая модель объявления о грузоперевозке.
 * Покрывает поля формы и даёт совместимость со старыми полями.
 */
class CargoAd {
  constructor(input = {}) {
    // ===== базовые метаданные =====
    this.adId = input.adId ?? String(Date.now());
    this.status = input.status ?? 'active';              // active | draft | closed
    this.createdAt = normIso(input.createdAt)              // ISO-строка
      ?? new Date().toISOString();
    this.updatedAt = normIso(input.updatedAt)
      ?? this.createdAt;

    // ===== владелец =====
    // оставляем и плоские поля (ownerId, ownerName...) и нормализованный snapshot в this.owner
    const ownerId = input.owner?.id ?? input.ownerId ?? '';
    this.ownerId = ownerId;

    this.owner = {
      id: ownerId,
      name: input.owner?.name ?? input.ownerName ?? input.userName ?? 'Пользователь',
      avatarUrl: input.owner?.avatarUrl ?? input.ownerPhotoUrl ?? input.userPhoto ?? '',
      rating: numOrNull(input.owner?.rating ?? input.ownerRating ?? input.rating),
      // можно доп. поля, если будут нужны:
      // email:  input.owner?.email  ?? input.ownerEmail  ?? '',
      // phone:  input.owner?.phone  ?? input.ownerPhone  ?? '',
    };

    // ===== что везём (cargo) =====
    const dimensionsMeters = input.dimensionsMeters ?? input.cargo?.dims ?? {
      height: input.cargo?.h ?? '',
      width: input.cargo?.w ?? '',
      depth: input.cargo?.d ?? '',
    };

    // упаковка — теперь массив ключей; поддержим прежний packagingType (строка)
    const packagingTypes = Array.isArray(input.packagingTypes)
      ? input.packagingTypes.slice(0)
      : (input.packagingType ? [input.packagingType] : []);

    this.cargo = {
      title: input.title ?? input.cargo?.title ?? '',
      type: input.cargoType ?? input.cargo?.type ?? '',
      description: input.description ?? input.cargo?.description ?? '',

      weightTons: strOrNum(input.weightTons ?? input.cargo?.weightTons ?? input.cargo?.weight ?? ''),
      dimensionsMeters: {
        height: strOrNum(dimensionsMeters.height ?? ''),
        width: strOrNum(dimensionsMeters.width ?? ''),
        depth: strOrNum(dimensionsMeters.depth ?? ''),
      },
      quantity: strOrNum(input.quantity ?? ''),

      packagingTypes,                  // новый канонический вид
      // ↓ алиас для обратной совместимости: первый элемент массива
      packagingType: packagingTypes[0] ?? '',

      isFragile: !!(input.isFragile ?? input.cargo?.fragile),
      isStackable: !!(input.isStackable ?? input.cargo?.isStackable),
      adrClass: emptyToNull(input.adrClass ?? input.cargo?.adrClass),

      temperature: {
        mode: (input.temperature?.mode ?? 'ambient'),      // ambient | chilled | frozen
        minC: strOrNum(input.temperature?.minC ?? ''),
        maxC: strOrNum(input.temperature?.maxC ?? ''),
      },
    };

    // ===== маршрут и сроки =====
    this.route = {
      from: input.route?.from ?? input.departureCity ?? input.from ?? '',
      to: input.route?.to ?? input.destinationCity ?? input.to ?? '',
    };

    // даты в интерфейсе — в формате dd.MM.yyyy; храним как есть,
    // но дублируем в availabilityFrom/To для совместимости с рендером
    const pickupDate = input.pickupDate ?? input.availabilityFrom ?? input.dates?.pickupDate ?? '';
    const deliveryDate = input.deliveryDate ?? input.availabilityTo ?? input.dates?.deliveryDate ?? '';

    this.pickupDate = pickupDate;
    this.deliveryDate = deliveryDate;

    // алиасы (поддержка старых полей)
    this.availabilityFrom = pickupDate || '';
    this.availabilityTo = deliveryDate || '';

    // ===== условия погрузки =====
    this.loadingTypes = Array.isArray(input.preferredLoadingTypes)
      ? input.preferredLoadingTypes.slice(0)
      : Array.isArray(input.loadingTypes) ? input.loadingTypes.slice(0) : [];

    // опциональные флаги (оставим — вдруг пригодятся)
    this.needTailLift = !!input.needTailLift;
    this.hasForkliftAtPickup = !!input.hasForkliftAtPickup;
    this.hasForkliftAtDelivery = !!input.hasForkliftAtDelivery;

    // ===== цена =====
    this.price = {
      value: strOrNum(input.price ?? input.price?.value ?? ''),
      unit: input.paymentUnit ?? input.price?.unit ?? 'руб',
      readyToNegotiate: !!(input.readyToNegotiate ?? input.price?.readyToNegotiate ?? true),
    };

    // ===== фото =====
    // Нормализуем к виду [{id, url}] где url — dataURL/https
    const rawPhotos = input.photos ?? input.cargo?.photos ?? [];
    this.photos = normalizePhotos(rawPhotos);

    // ===== пожелания к ТС (опционально) =====
    this.transportPreferences = {
      transportType: input.transportPreferences?.transportType ?? '',
      loadingTypes: Array.isArray(input.transportPreferences?.loadingTypes)
        ? input.transportPreferences.loadingTypes.slice(0)
        : [],
    };
  }

  /** Обновить updatedAt */
  touch() {
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /** Удобная дата для UI: dd.MM.yyyy (из createdAt ISO) */
  get createdAtRu() {
    const t = Date.parse(this.createdAt);
    return isFinite(t) ? new Date(t).toLocaleDateString('ru-RU') : (this.createdAt || '');
  }

  /** Плоский вид для БД (минимум лишнего, но с алиасами для совместимости) */
  toJSON() {
    return {
      adId: this.adId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,

      // владелец (и плоско, и снапшот)
      ownerId: this.ownerId,
      ownerName: this.owner.name,
      ownerPhotoUrl: this.owner.avatarUrl,
      ownerRating: this.owner.rating,
      owner: { ...this.owner },

      // маршрут
      departureCity: this.route.from,
      destinationCity: this.route.to,
      route: { ...this.route },

      // даты
      pickupDate: this.pickupDate,
      deliveryDate: this.deliveryDate,
      availabilityFrom: this.availabilityFrom,
      availabilityTo: this.availabilityTo,

      // груз
      title: this.cargo.title,
      cargoType: this.cargo.type,
      description: this.cargo.description,

      weightTons: this.cargo.weightTons,
      dimensionsMeters: { ...this.cargo.dimensionsMeters },
      quantity: this.cargo.quantity,

      packagingTypes: this.cargo.packagingTypes.slice(0),
      packagingType: this.cargo.packagingType, // алиас (первый элемент)

      isFragile: this.cargo.isFragile,
      isStackable: this.cargo.isStackable,
      adrClass: this.cargo.adrClass,
      temperature: { ...this.cargo.temperature },

      // условия погрузки
      preferredLoadingTypes: this.loadingTypes.slice(0),
      loadingTypes: this.loadingTypes.slice(0),

      needTailLift: this.needTailLift,
      hasForkliftAtPickup: this.hasForkliftAtPickup,
      hasForkliftAtDelivery: this.hasForkliftAtDelivery,

      // бюджет
      price: this.price.value,
      paymentUnit: this.price.unit,
      readyToNegotiate: this.price.readyToNegotiate,

      // транспортные пожелания
      transportPreferences: {
        transportType: this.transportPreferences.transportType,
        loadingTypes: this.transportPreferences.loadingTypes.slice(0),
      },

      // фото (для БД оставим url + id)
      photos: this.photos.map(p => ({ id: p.id, url: p.url })),
    };
  }

  /** Утилита: создать из данных формы (formData из CreateCargoAdForm) */
  static fromForm(formData = {}) {
    const nowIso = new Date().toISOString();
    return new CargoAd({
      ...formData,
      createdAt: formData.createdAtIso ?? nowIso,    // если форма положила ru-дату, всё равно дадим ISO
      updatedAt: nowIso,
      // keep compatibility for dates:
      availabilityFrom: formData.availabilityFrom ?? formData.pickupDate,
      availabilityTo: formData.availabilityTo ?? formData.deliveryDate,
    });
  }
}

export default CargoAd;

/* ================= helpers ================= */

function normIso(v) {
  if (!v) return null;
  const t = Date.parse(v);
  return isFinite(t) ? new Date(t).toISOString() : null;
}

function strOrNum(v) {
  if (v === null || v === undefined) return '';
  const n = Number(v);
  return Number.isFinite(n) ? n : String(v);
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function emptyToNull(v) {
  if (v === '' || v === undefined) return null;
  return v;
}

function normalizePhotos(arr) {
  // допускаем:
  // - ["https://..", "data:image.."]
  // - [{id,url}, {id,src}]
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === 'string') {
      return { id: genId(), url: item };
    }
    const id = item.id ?? genId();
    const url = item.url ?? item.src ?? '';
    return { id, url };
  }).filter(p => p.url);
}

function genId() {
  return (globalThis.crypto?.randomUUID?.() ?? `p_${Math.random().toString(36).slice(2)}`);
}
