// src/services/CargoAdService.js
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

const cargoAdsRef = ref(db, 'cargoAds');

// === NEW: строим патч для миграции автора ===
function buildOwnerMigrationPatch(raw = {}) {
  const patch = {};
  let changed = false;

  // Текущее состояние
  const ownerObj = raw.owner && typeof raw.owner === 'object' ? { ...raw.owner } : {};

  // Источники
  const ownerIdTop = raw.ownerId ?? null;
  const ownerNameTop = raw.ownerName ?? null;
  const ownerPhotoTop = raw.ownerPhotoUrl ?? null;
  const ownerRatingTop = raw.ownerRating ?? null;

  // Текущее внутри owner
  const ownerIdObj = ownerObj.id ?? null;
  const ownerNameObj = ownerObj.name ?? null;
  const ownerPhotoObj = ownerObj.photoUrl ?? null;
  const ownerAvatarObj = ownerObj.avatarUrl ?? null; // лишнее, хотим убрать
  const ownerRatingObj = ownerObj.rating ?? null;

  // Целевые значения
  const targetOwner = {
    id: ownerIdObj ?? ownerIdTop ?? null,
    name: ownerNameObj ?? ownerNameTop ?? null,
    photoUrl: ownerPhotoObj ?? ownerAvatarObj ?? ownerPhotoTop ?? null,
    rating: ownerRatingObj ?? ownerRatingTop ?? null,
  };

  // Если что-то меняется — запишем owner целиком (merge-ом)
  // Записываем только те, что != текущих
  const ownerPatch = {};
  if (targetOwner.id !== ownerIdObj) { ownerPatch.id = targetOwner.id; changed = true; }
  if (targetOwner.name !== ownerNameObj) { ownerPatch.name = targetOwner.name; changed = true; }
  if (targetOwner.photoUrl !== ownerPhotoObj) { ownerPatch.photoUrl = targetOwner.photoUrl; changed = true; }
  if (targetOwner.rating !== ownerRatingObj) { ownerPatch.rating = targetOwner.rating; changed = true; }

  if (Object.keys(ownerPatch).length) {
    patch['owner'] = { ...(patch['owner'] || {}), ...ownerPatch };
  }

  // Удаления верхнеуровневых легаси-ключей (явно через null)
  if ('ownerName' in raw) { patch['ownerName'] = null; changed = true; }
  if ('ownerPhotoUrl' in raw) { patch['ownerPhotoUrl'] = null; changed = true; }
  if ('ownerRating' in raw) { patch['ownerRating'] = null; changed = true; }

  // Удаление legacy owner.avatarUrl, если был
  if ('owner' in raw && raw.owner && 'avatarUrl' in raw.owner) {
    patch['owner/avatarUrl'] = null;
    changed = true;
  }

  // Гарантируем соответствие ownerId и owner.id (ownerId оставляем топ-левел, но синхронизируем)
  if (targetOwner.id != null && ownerIdTop !== targetOwner.id) {
    patch['ownerId'] = targetOwner.id;
    changed = true;
  }

  return { patch, changed };
}

/* ===================== ХЕЛПЕРЫ ===================== */

// 1) Миграция автора ПОСЛЕ чтения из БД
function migrateOwnerInSnapshot(raw = {}) {
  const ad = { ...raw };
  let changed = false;

  const legacy = {
    name: ad.ownerName,
    photoUrl: ad.ownerPhotoUrl,
    rating: ad.ownerRating,
  };

  if (!ad.owner) ad.owner = {};

  if (legacy.name != null && ad.owner.name == null) { ad.owner.name = legacy.name; changed = true; }
  if (legacy.photoUrl != null && ad.owner.photoUrl == null) { ad.owner.photoUrl = legacy.photoUrl; changed = true; }
  if (legacy.rating != null && ad.owner.rating == null) { ad.owner.rating = legacy.rating; changed = true; }

  if ('ownerName' in ad) { delete ad.ownerName; changed = true; }
  if ('ownerPhotoUrl' in ad) { delete ad.ownerPhotoUrl; changed = true; }
  if ('ownerRating' in ad) { delete ad.ownerRating; changed = true; }

  // (опц.) migrate preferredLoadingTypes: объект -> массив
  if (ad.preferredLoadingTypes && !Array.isArray(ad.preferredLoadingTypes) && typeof ad.preferredLoadingTypes === 'object') {
    ad.preferredLoadingTypes = Object.keys(ad.preferredLoadingTypes).filter(k => !!ad.preferredLoadingTypes[k]);
    changed = true;
  }

  return { ad, changed };
}

// 2) Нормализация автора ПЕРЕД записью в БД
function normalizeOwnerForWrite(payload = {}) {
  const p = { ...payload };

  const legacyName = p.ownerName ?? null;
  const legacyPhoto = p.ownerPhotoUrl ?? null;
  const legacyRating = p.ownerRating ?? null;

  if (!p.owner) p.owner = {};
  if (legacyName != null && p.owner.name == null) p.owner.name = legacyName;
  if (legacyPhoto != null && p.owner.photoUrl == null) p.owner.photoUrl = legacyPhoto;
  if (legacyRating != null && p.owner.rating == null) p.owner.rating = legacyRating;

  // подчистим легаси-ключи (null в update() = удалить поле)
  p.ownerName = null;
  p.ownerPhotoUrl = null;
  p.ownerRating = null;

  return p;
}

// 3) Общая нормализация перед записью
function normalizeForDb(ad = {}) {
  let copy = { ...ad };

  // Свести легаси-поля автора к owner + подчистить
  copy = normalizeOwnerForWrite(copy);

  // Гарантируем owner.id == ownerId (если есть)
  if (copy.owner && copy.owner.id == null && copy.ownerId != null) {
    copy.owner = { ...copy.owner, id: copy.ownerId };
  }
  if (copy.owner && copy.owner.id != null && copy.ownerId == null) {
    copy.ownerId = copy.owner.id;
  }

  // массив -> объект для preferredLoadingTypes
  if (Array.isArray(copy.preferredLoadingTypes)) {
    const map = {};
    copy.preferredLoadingTypes.forEach((k) => { if (k) map[k] = true; });
    copy.preferredLoadingTypes = map;
  }

  return copy;
}


/* ===================== МЕТОДЫ ===================== */

// Прочитать все + авто-миграция автора
// getAll
async function getAll() {
  const snap = await get(cargoAdsRef);
  if (!snap.exists()) return [];

  const result = [];
  const updates = [];

  snap.forEach((childSnap) => {
    const key = childSnap.key;
    const raw = childSnap.val();

    const { patch, changed } = buildOwnerMigrationPatch(raw);

    if (changed) {
      const adRef = child(cargoAdsRef, key);
      updates.push(update(adRef, patch));
      // смержим raw с тем, что применим (для возврата «уже мигрированного» объекта)
      const merged = {
        ...raw,
        owner: { ...(raw.owner || {}), ...(patch.owner || {}) }
      };
      // применим null-удаления в локальном merged
      if ('ownerName' in patch) delete merged.ownerName;
      if ('ownerPhotoUrl' in patch) delete merged.ownerPhotoUrl;
      if ('ownerRating' in patch) delete merged.ownerRating;
      if ('owner/avatarUrl' in patch && merged.owner) delete merged.owner.avatarUrl;
      if ('ownerId' in patch) merged.ownerId = patch.ownerId;

      result.push({ adId: key, ...merged });
    } else {
      result.push({ adId: key, ...raw });
    }
  });

  try { await Promise.all(updates); } catch (_) { }
  return result;
}


// Получить по id + авто-миграция автора
// getById
async function getById(adId) {
  if (!adId) return null;
  const adRef = child(cargoAdsRef, adId);
  const snap = await get(adRef);
  if (!snap.exists()) return null;

  const raw = snap.val();
  const { patch, changed } = buildOwnerMigrationPatch(raw);

  if (changed) {
    try { await update(adRef, patch); } catch (_) { }
    const merged = {
      ...raw,
      owner: { ...(raw.owner || {}), ...(patch.owner || {}) }
    };
    if ('ownerName' in patch) delete merged.ownerName;
    if ('ownerPhotoUrl' in patch) delete merged.ownerPhotoUrl;
    if ('ownerRating' in patch) delete merged.ownerRating;
    if ('owner/avatarUrl' in patch && merged.owner) delete merged.owner.avatarUrl;
    if ('ownerId' in patch) merged.ownerId = patch.ownerId;

    return { adId, ...merged };
  }

  return { adId, ...raw };
}


// Создать
async function create(adData = {}) {
  const newRef = push(cargoAdsRef);
  const payload = normalizeForDb({
    ...adData,
    adId: newRef.key,
    createdAt: serverTimestamp(),
    status: adData.status || 'active',
  });
  await set(newRef, payload);
  const snap = await get(newRef);
  return { adId: newRef.key, ...snap.val() };
}

// Обновить
async function updateById(adId, patch = {}) {
  if (!adId) throw new Error('updateById: adId is required');
  const adRef = child(cargoAdsRef, adId);
  const payload = normalizeForDb({
    ...patch,
    updatedAt: serverTimestamp(),
  });
  await update(adRef, payload);
  const snap = await get(adRef);
  return { adId, ...snap.val() };
}

// Удалить
async function deleteById(adId) {
  if (!adId) throw new Error('deleteById: adId is required');
  const adRef = child(cargoAdsRef, adId);
  await remove(adRef);
  return true;
}

const CargoAdService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,
};

export default CargoAdService;
