// Realtime DB сервис для объявлений о грузах (cargoAds)
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
import { db } from '../firebase'; // <-- используем уже инициализированный db

const cargoAdsRef = ref(db, 'cargoAds');


// Вспомогательное: массивы -> объекты (твой формат хранения в RTDB)
const normalizeForDb = (ad = {}) => {
  const copy = { ...ad };

  // loadingTypes: ['задняя','боковая'] -> { 'задняя': true, 'боковая': true }
  if (Array.isArray(copy.loadingTypes)) {
    const map = {};
    copy.loadingTypes.forEach((k) => (map[k] = true));
    copy.loadingTypes = map;
  }

  // фото, если придут массивом -> в объект с ключами ph1, ph2...
  if (Array.isArray(copy.cargoPhotoUrls)) {
    const obj = {};
    copy.cargoPhotoUrls.forEach((url, i) => (obj[`ph${i + 1}`] = url));
    copy.cargoPhotoUrls = obj;
  }

  return copy;
};

// Прочитать все объявления (плоским массивом)
const getAll = async () => {
  const snap = await get(cargoAdsRef);
  if (!snap.exists()) return [];
  const result = [];
  snap.forEach((childSnap) => {
    result.push({ adId: childSnap.key, ...childSnap.val() });
  });
  return result;
};

// Создать новое объявление (вернёт объект с adId)
const create = async (adData = {}) => {
  const newRef = push(cargoAdsRef);
  const payload = normalizeForDb({
    ...adData,
    adId: newRef.key,
    createdAt: serverTimestamp(),
    status: adData.status || 'active',
  });
  await set(newRef, payload);
  // Читаем обратно — чтобы получить проставленный serverTimestamp (по желанию)
  const snap = await get(newRef);
  return { adId: newRef.key, ...snap.val() };
};

// Обновить объявление по id (патчем)
const updateById = async (adId, patch = {}) => {
  if (!adId) throw new Error('updateById: adId is required');
  const adRef = child(cargoAdsRef, adId);
  const payload = normalizeForDb({ ...patch, updatedAt: serverTimestamp() });
  await update(adRef, payload);
  const snap = await get(adRef);
  return { adId, ...snap.val() };
};

// Удалить объявление по id
const deleteById = async (adId) => {
  if (!adId) throw new Error('deleteById: adId is required');
  const adRef = child(cargoAdsRef, adId);
  await remove(adRef);
  return true;
};

// (опц.) Получить по id
const getById = async (adId) => {
  if (!adId) return null;
  const adRef = child(cargoAdsRef, adId);
  const snap = await get(adRef);
  if (!snap.exists()) return null;
  return { adId, ...snap.val() };
};

const CargoAdService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};

export default CargoAdService;
