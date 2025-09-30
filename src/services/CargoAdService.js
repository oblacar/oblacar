// src/services/cargoAdsService.js
// Realtime DB сервис для объявлений о грузах (cargoAds)

import {
  ref,
  child,
  get,
  set,
  push,
  update,
  remove,
  serverTimestamp,
} from 'firebase/database';
import { db } from '../firebase';
import CargoAd from '../entities/CargoAd/CargoAd'; // <-- энтити-адаптер

const cargoAdsRef = ref(db, 'cargoAds');

/* =========================
   ВСПОМОГАТЕЛЬНЫЕ АДАПТЕРЫ
   ========================= */

/** map{key:true} -> [key,...] (устойчиво к мусору) */
const mapToArray = (m) =>
  m && typeof m === 'object'
    ? Object.keys(m).filter((k) => !!m[k])
    : [];

/** [key,...] -> map{key:true} */
const arrayToMap = (arr) => {
  const out = {};
  (Array.isArray(arr) ? arr : []).forEach((k) => {
    if (k != null && k !== '') out[String(k)] = true;
  });
  return out;
};

/** photos {id: src} -> [{id,src}] */
const photosObjToArray = (obj) =>
  obj && typeof obj === 'object'
    ? Object.entries(obj).map(([id, src]) => ({ id, src }))
    : [];

/** photos [{id,src}] -> {id: src} */
const photosArrayToObj = (arr) => {
  const out = {};
  (Array.isArray(arr) ? arr : []).forEach((p) => {
    if (!p) return;
    const id = p.id ?? (crypto.randomUUID?.() || String(Math.random()));
    const src = p.src ?? p.url ?? p.href ?? '';
    if (src) out[id] = src;
  });
  return out;
};

/** число (ms) / строка даты / serverTimestamp-«заглушка» → ISO-строка или '' */
const dbDateToISO = (v) => {
  if (typeof v === 'number') return new Date(v).toISOString();
  if (typeof v === 'string') {
    // если уже ISO — оставим как есть
    const t = Date.parse(v);
    return Number.isNaN(t) ? '' : new Date(t).toISOString();
  }
  // serverTimestamp placeholder (object) — вернётся как число после повторного чтения
  return '';
};

/** 
 * Декод из RTDB-строки в «плоский» объект приложения,
 * затем через CargoAd → финальный нормализованный JSON
 */
const decodeFromDb = (row = {}) => {
  const plain = {
    ...row,

    // Алиасы/совместимость: в нашем UI мы используем preferredLoadingTypes
    preferredLoadingTypes: Array.isArray(row.preferredLoadingTypes)
      ? row.preferredLoadingTypes
      : mapToArray(row.preferredLoadingTypes || row.loadingTypes),

    // packagingTypes может храниться массивом или map
    packagingTypes: Array.isArray(row.packagingTypes)
      ? row.packagingTypes
      : mapToArray(row.packagingTypes),

    // photos могли хранить как массив строк или объект {id:src}
    photos: Array.isArray(row.photos)
      ? row.photos.map((src, i) => ({
          id: `ph${i + 1}`,
          src,
        }))
      : photosObjToArray(row.photos),

    // Даты
    createdAt: dbDateToISO(row.createdAt) || row.createdAt || '',
    updatedAt: dbDateToISO(row.updatedAt) || row.updatedAt || '',
  };

  // Прогоняем через энтити, чтобы получить полностью согласованный объект
  return new CargoAd(plain).toJSON();
};

/**
 * Инкодер: из нормализованного объекта в формат хранения RTDB
 * (массива → map, photos → объект, даты → serverTimestamp при создании/апдейте)
 */
const encodeForDb = (ad = {}, { isCreate = false } = {}) => {
  // На вход ждём уже нормализованный объект (через CargoAd)
  const copy = { ...ad };

  // В БД храним map'ы вместо массивов:
  copy.preferredLoadingTypes = arrayToMap(copy.preferredLoadingTypes);
  copy.packagingTypes = arrayToMap(copy.packagingTypes);

  // В БД удобнее хранить photos как {id:src}
  copy.photos = photosArrayToObj(copy.photos);

  // Даты (serverTimestamp проставится на сервере)
  if (isCreate) {
    copy.createdAt = serverTimestamp();
  }
  copy.updatedAt = serverTimestamp();

  return copy;
};

/* =========================
   CRUD
   ========================= */

// Прочитать все объявления
const getAll = async () => {
  const snap = await get(cargoAdsRef);
  if (!snap.exists()) return [];
  const result = [];
  snap.forEach((childSnap) => {
    const raw = { adId: childSnap.key, ...childSnap.val() };
    result.push(decodeFromDb(raw));
  });
  // Сортировка по дате создания (новые сверху), если нужно:
  result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return result;
};

// Получить по id
const getById = async (adId) => {
  if (!adId) return null;
  const adRef = child(cargoAdsRef, adId);
  const snap = await get(adRef);
  if (!snap.exists()) return null;
  const raw = { adId, ...snap.val() };
  return decodeFromDb(raw);
};

// Создать новое объявление из formData (или уже готового plain-объекта)
const create = async (formLike = {}) => {
  // 1) нормализуем форму энтити
  const entityJSON =
    typeof CargoAd.fromForm === 'function'
      ? CargoAd.fromForm(formLike).toJSON()
      : new CargoAd(formLike).toJSON();

  // 2) готовим payload для БД
  const newRef = push(cargoAdsRef);
  const payload = encodeForDb(
    { ...entityJSON, adId: newRef.key, status: entityJSON.status || 'active' },
    { isCreate: true }
  );

  // 3) пишем и читаем назад (чтобы получить serverTimestamp числом)
  await set(newRef, payload);
  const snap = await get(newRef);
  return decodeFromDb({ adId: newRef.key, ...snap.val() });
};

// Обновить объявление по id
const updateById = async (adId, patch = {}) => {
  if (!adId) throw new Error('updateById: adId is required');

  // Текущую версию читаем (чтобы корректно слить и нормализовать)
  const current = await getById(adId);
  if (!current) throw new Error('updateById: ad not found');

  // Прогоняем через энтити, чтобы не потерять структуру
  const merged = new CargoAd({ ...current, ...patch }).toJSON();

  const adRef = child(cargoAdsRef, adId);
  const payload = encodeForDb(merged, { isCreate: false });

  await update(adRef, payload);
  const snap = await get(adRef);
  return decodeFromDb({ adId, ...snap.val() });
};

// Удалить объявление по id
const deleteById = async (adId) => {
  if (!adId) throw new Error('deleteById: adId is required');
  const adRef = child(cargoAdsRef, adId);
  await remove(adRef);
  return true;
};

const CargoAdService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};

export default CargoAdService;
