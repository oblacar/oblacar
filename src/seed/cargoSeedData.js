// src/seed/cargoSeedData.js
import { pickOwner } from "./cargoOwnersPool";

const today = () => new Date().toLocaleDateString("ru-RU"); // dd.MM.yyyy
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("ru-RU");
};

// Варианты для разнообразия
const CITIES_FROM = ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Нижний Новгород", "Самара", "Ростов-на-Дону", "Челябинск"];
const CITIES_TO   = ["Краснодар", "Воронеж", "Уфа", "Новосибирск", "Пермь", "Тюмень", "Саратов", "Волгоград"];

const rnd = (min, max, step = 1) =>
  Math.round((Math.random() * (max - min) + min) / step) * step;

const oneOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

const CARGO_TYPES = [
  "строительные материалы",
  "мебель",
  "продукты",
  "промтовары",
  "насыпной",
  "наливной",
  "ADR",
  "электроника",
  "оборудование",
  "прочее",
];

const PACKS = [
  "pallet","box","crate","bag","bigbag","bale","drum","ibc","roll","container","long","loose","piece"
];

const LOADINGS = ["верхняя","боковая","задняя","гидроборт","аппарели","без ворот"];
const UNITS = ["руб","₽"];
const TEMP_MODES = ["ambient","chilled","frozen"];

// Генератор одного объявления
function makeAd(i) {
  const owner = pickOwner();
  const ct = oneOf(CARGO_TYPES);
  const from = oneOf(CITIES_FROM);
  const to = oneOf(CITIES_TO);
  const pk = inDays(rnd(0, 5));
  const dl = Math.random() < 0.7 ? inDays(rnd(6, 20)) : ""; // иногда пусто

  const tempMode = oneOf(TEMP_MODES);
  const temp =
    tempMode === "ambient"
      ? { mode: "ambient", minC: "", maxC: "" }
      : tempMode === "chilled"
      ? { mode: "chilled", minC: "0", maxC: "+6" }
      : { mode: "frozen", minC: "-20", maxC: "-10" };

  const packCount = rnd(1, 3);
  const packagingTypes = Array.from({ length: packCount }).map(() => oneOf(PACKS))
    // убираем дубли
    .filter((v, idx, a) => a.indexOf(v) === idx);

  const preferredLoadingTypes = Array.from({ length: rnd(1, 3) })
    .map(() => oneOf(LOADINGS))
    .filter((v, idx, a) => a.indexOf(v) === idx);

  const isADR = ct.toLowerCase() === "adr";
  const adrClass = isADR ? String(oneOf([2,3,4,5,8,9])) : "";

  return {
    // система / мета
    status: Math.random() < 0.1 ? "draft" : "active",
    createdAt: today(),      // всё равно перезапишется serverTimestamp, но в UI может пригодиться
    updatedAt: today(),

    // автор
    ownerId: owner.ownerId,
    ownerName: owner.ownerName,
    ownerPhotoUrl: owner.ownerPhotoUrl,
    ownerRating: owner.ownerRating,

    // маршрут/сроки
    departureCity: from,
    destinationCity: to,
    pickupDate: pk,
    deliveryDate: dl,

    // бюджет
    price: String(rnd(20000, 180000, 500)),
    paymentUnit: oneOf(UNITS),
    readyToNegotiate: Math.random() < 0.6,

    // груз
    title: `${ct[0].toUpperCase()}${ct.slice(1)} • партия #${i + 1}`,
    cargoType: ct,
    description:
      "Тестовое объявление для отладки интерфейса. Данные сгенерированы автоматически.",
    photos: [],

    weightTons: String((rnd(5, 22, 1) / 10).toFixed(1)), // 0.5 — 2.2 т
    dimensionsMeters: {
      height: String((rnd(10, 25) / 10).toFixed(1)),     // 1.0 — 2.5 м
      width:  String((rnd(8, 20) / 10).toFixed(1)),      // 0.8 — 2.0 м
      depth:  String((rnd(8, 30) / 10).toFixed(1)),      // 0.8 — 3.0 м
    },
    quantity: String(rnd(1, 22)),
    packagingTypes,               // массив ключей (совместим с твоим мультиселектом)
    isFragile: Math.random() < 0.25,
    isStackable: Math.random() < 0.55,
    adrClass,

    temperature: temp,

    // погрузка
    preferredLoadingTypes,
    needTailLift: Math.random() < 0.2,
    hasForkliftAtPickup: Math.random() < 0.4,
    hasForkliftAtDelivery: Math.random() < 0.35,

    // пожелания к ТС (опц)
    transportPreferences: {
      transportType: "",
      loadingTypes: [],
    },
  };
}

export const CARGO_SEED_20 = Array.from({ length: 20 }).map((_, i) => makeAd(i));
