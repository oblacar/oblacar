// src/dev/seedCargoAds.js
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { db } from '../firebase';

const CITIES = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Нижний Новгород', 'Новосибирск',
  'Екатеринбург', 'Самара', 'Ростов-на-Дону', 'Воронеж', 'Уфа'
];

const CARGO_TYPES = ['Паллеты', 'Оборудование', 'Стройматериалы', 'Продукты', 'Мебель'];
const LOADING_TYPES_ALL = ['верхняя', 'боковая', 'задняя', 'гидроборт', 'аппарели', 'без ворот', 'налив'];
const PAYMENT_UNITS = ['руб', '€', '₸'];

const FALLBACK_CITY = 'Россия';

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = (arr) => arr && arr.length ? arr[rnd(0, arr.length - 1)] : undefined;
const safeChoice = (arr, fallback) => {
  const v = choice(arr);
  return v === undefined || v === null || v === '' ? fallback : v;
};
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const pickSome = (arr, max = 3) => shuffle(arr).slice(0, rnd(1, Math.min(max, arr.length)));
const bool = (p = 0.5) => Math.random() < p;
const listToFlags = (arr) => arr.reduce((acc, k) => { acc[k] = true; return acc; }, {});
const toFixedNum = (n, d = 2) => Number(n.toFixed(d));

const genDateRange = () => {
  const startShift = rnd(0, 14);
  const endShift = startShift + rnd(0, 10);
  const d = (shift) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + shift);
    return dt.toLocaleDateString('ru-RU');
  };
  return { availabilityFrom: d(startShift), availabilityTo: d(endShift) };
};

// ✅ санитайзер: undefined → null (RTDB не принимает undefined)
const sanitizeForRTDB = (val) => {
  if (val === undefined) return null;
  if (val === null) return null;
  if (Array.isArray(val)) return val.map(sanitizeForRTDB);
  if (typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) out[k] = sanitizeForRTDB(v);
    return out;
  }
  return val;
};

const makeCargoAd = (ownerId, i = 0) => {
  // безопасно выбираем «откуда»
  const from = safeChoice(CITIES, FALLBACK_CITY);

  // безопасно выбираем «куда»: стараемся отличать, иначе fallback
  let toPool = CITIES.filter((c) => c !== from);
  if (toPool.length === 0) toPool = [FALLBACK_CITY];
  const to = safeChoice(toPool, FALLBACK_CITY);

  const { availabilityFrom, availabilityTo } = genDateRange();
  const cargoType = safeChoice(CARGO_TYPES, 'Груз');
  const loadingTypes = pickSome(LOADING_TYPES_ALL, 3);

  const weightT = toFixedNum(Math.max(0.4, Math.random() * 18), 1);
  const H = toFixedNum(1 + Math.random() * 2.5, 2);
  const W = toFixedNum(1 + Math.random() * 2.4, 2);
  const D = toFixedNum(1.2 + Math.random() * 7.2, 2);

  const price = rnd(25000, 180000);
  const paymentUnit = safeChoice(PAYMENT_UNITS, 'руб');
  const readyToNegotiate = bool(0.4);

  const title = `${cargoType} ${from} → ${to}`;
  const description = [
    `Груз: ${cargoType}.`,
    `Нужно перевезти из ${from} в ${to}.`,
    bool(0.3) ? 'Погрузка аккуратная, помощь погрузчика есть.' : 'Требуется аккуратная укладка.',
    bool(0.3) ? 'Нужны ремни/растяжки.' : 'Без особых требований.',
  ].join(' ');

  return {
    adId: null,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    ownerId,

    departureCity: from,
    destinationCity: to,
    availabilityFrom,
    availabilityTo,
    flexibleDates: bool(0.2),

    price,
    paymentUnit,
    readyToNegotiate,

    cargoTitle: title,
    cargoType,
    description,

    cargoWeight: weightT,
    cargoHeight: H,
    cargoWidth: W,
    cargoDepth: D,

    loadingTypes: listToFlags(loadingTypes),
    tags: listToFlags(pickSome(['хрупкий', 'паллеты', 'фура', '24т', 'договорная', 'откатные ворота'], 2)),
  };
};

export const seedCargoAds = async (ownerId, count = 20) => {
  if (!ownerId) throw new Error('seedCargoAds: требуется ownerId');
  const cargoAdsRef = ref(db, 'cargoAds');

  const results = [];
  for (let i = 0; i < count; i++) {
    const data = makeCargoAd(ownerId, i);
    const recRef = push(cargoAdsRef);
    const adId = recRef.key;
    const payload = sanitizeForRTDB({ ...data, adId });

    // На всякий — лог, если вдруг что-то осталось null/пустым
    // console.log('seed payload', payload);

    await set(recRef, payload);
    results.push(payload);
  }
  return results;
};

export default seedCargoAds;

if (typeof window !== 'undefined') {
  window.seedCargoAds = (uid, n = 20) => seedCargoAds(uid, n);
}
