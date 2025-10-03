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

/* ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===================== */
// массив -> объект { key: true }
function arrToMap(arr) {
  const map = {};
  (Array.isArray(arr) ? arr : []).forEach((k) => {
    if (k != null && k !== '') map[String(k)] = true;
  });
  return map;
}
// объект { key: true } -> массив ['key', ...]
function mapToArr(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj).filter((k) => !!obj[k]);
}

/* =============== МИГРАЦИЯ АВТОРА (BUILD PATCH) =============== */
/** Формирует patch для перевода легаси-полей автора в owner{} */
function buildOwnerMigrationPatch(raw = {}) {
  const patch = {};
  let changed = false;

  const ownerObj = raw.owner && typeof raw.owner === 'object' ? { ...raw.owner } : {};

  // Топ-левел
  const ownerIdTop = raw.ownerId ?? null;
  const ownerNameTop = raw.ownerName ?? null;
  const ownerPhotoTop = raw.ownerPhotoUrl ?? null;
  const ownerRatingTop = raw.ownerRating ?? null;

  // Внутри owner
  const ownerIdObj = ownerObj.id ?? null;
  const ownerNameObj = ownerObj.name ?? null;
  const ownerPhotoObj = ownerObj.photoUrl ?? null;
  const ownerAvatarObj = ownerObj.avatarUrl ?? null; // legacy
  const ownerRatingObj = ownerObj.rating ?? null;

  // Целевые значения
  const targetOwner = {
    id: ownerIdObj ?? ownerIdTop ?? null,
    name: ownerNameObj ?? ownerNameTop ?? null,
    photoUrl: ownerPhotoObj ?? ownerAvatarObj ?? ownerPhotoTop ?? null,
    rating: ownerRatingObj ?? ownerRatingTop ?? null,
  };

  // Собираем patch внутрь owner
  const ownerPatch = {};
  if (targetOwner.id !== ownerIdObj) { ownerPatch.id = targetOwner.id; changed = true; }
  if (targetOwner.name !== ownerNameObj) { ownerPatch.name = targetOwner.name; changed = true; }
  if (targetOwner.photoUrl !== ownerPhotoObj) { ownerPatch.photoUrl = targetOwner.photoUrl; changed = true; }
  if (targetOwner.rating !== ownerRatingObj) { ownerPatch.rating = targetOwner.rating; changed = true; }

  if (Object.keys(ownerPatch).length) {
    patch['owner'] = { ...(patch['owner'] || {}), ...ownerPatch };
  }

  // Удаляем легаси-поля на верхнем уровне
  if ('ownerName' in raw) { patch['ownerName'] = null; changed = true; }
  if ('ownerPhotoUrl' in raw) { patch['ownerPhotoUrl'] = null; changed = true; }
  if ('ownerRating' in raw) { patch['ownerRating'] = null; changed = true; }

  // Удаляем legacy avatarUrl внутри owner
  if ('owner' in raw && raw.owner && 'avatarUrl' in raw.owner) {
    patch['owner/avatarUrl'] = null;
    changed = true;
  }

  // Синхронизация ownerId на верхнем уровне
  if (targetOwner.id != null && ownerIdTop !== targetOwner.id) {
    patch['ownerId'] = targetOwner.id;
    changed = true;
  }

  return { patch, changed };
}

/* =============== МИГРАЦИЯ МУЛЬТИСЕЛЕКТОВ (BUILD PATCH) =============== */
/** Формирует patch для перевода массивов мультиселекта в map-объекты */
function buildMultiSelectMigrationPatch(raw = {}) {
  const patch = {};
  let changed = false;

  // preferredLoadingTypes: [] -> {key:true}
  if (Array.isArray(raw.preferredLoadingTypes)) {
    patch['preferredLoadingTypes'] = arrToMap(raw.preferredLoadingTypes);
    changed = true;
  }
  // packagingTypes: [] -> {key:true}
  if (Array.isArray(raw.packagingTypes)) {
    patch['packagingTypes'] = arrToMap(raw.packagingTypes);
    changed = true;
  }
  // (на случай, если где-то попадались массивы)
  if (Array.isArray(raw.loadingTypes)) {
    patch['loadingTypes'] = arrToMap(raw.loadingTypes);
    changed = true;
  }

  return { patch, changed };
}

/* ===================== НОРМАЛИЗАЦИЯ ПЕРЕД ЗАПИСЬЮ ===================== */
/** Нормализуем автора перед записью: переносим легаси в owner, чистим легаси-ключи */
function normalizeOwnerForWrite(payload = {}) {
  const p = { ...payload };

  const legacyName = p.ownerName ?? null;
  const legacyPhoto = p.ownerPhotoUrl ?? null;
  const legacyRating = p.ownerRating ?? null;

  if (!p.owner) p.owner = {};
  if (legacyName != null && p.owner.name == null) p.owner.name = legacyName;
  if (legacyPhoto != null && p.owner.photoUrl == null) p.owner.photoUrl = legacyPhoto;
  if (legacyRating != null && p.owner.rating == null) p.owner.rating = legacyRating;

  // подчистка легаси-ключей (null в update() удалит поле)
  p.ownerName = null;
  p.ownerPhotoUrl = null;
  p.ownerRating = null;

  return p;
}

/** Общая нормализация payload перед записью в БД */
function normalizeForDb(ad = {}) {
  let copy = { ...ad };

  // Автор
  copy = normalizeOwnerForWrite(copy);

  // Синхронизация owner.id <-> ownerId
  if (copy.owner && copy.owner.id == null && copy.ownerId != null) {
    copy.owner = { ...copy.owner, id: copy.ownerId };
  }
  if (copy.owner && copy.owner.id != null && copy.ownerId == null) {
    copy.ownerId = copy.owner.id;
  }

  // === МУЛЬТИСЕЛЕКТЫ: UI может прислать массивы — в БД храним map ===
  if (Array.isArray(copy.preferredLoadingTypes)) {
    copy.preferredLoadingTypes = arrToMap(copy.preferredLoadingTypes);
  }
  if (Array.isArray(copy.packagingTypes)) {
    copy.packagingTypes = arrToMap(copy.packagingTypes);
  }
  if (Array.isArray(copy.loadingTypes)) {
    copy.loadingTypes = arrToMap(copy.loadingTypes);
  }

  return copy;
}

/* ===================== ПРИВЕДЕНИЕ К ФОРМАТУ UI ===================== */
/** Конвертирует поля из формата БД (map) в формат UI (array) */
function toClientArrays(raw = {}) {
  const ad = { ...raw };

  ad.preferredLoadingTypes = mapToArr(raw.preferredLoadingTypes ?? raw.preferred_loading_types);
  ad.packagingTypes = mapToArr(raw.packagingTypes);
  // Если UI где-то ожидает loadingTypes как массив — тоже вернём массив
  ad.loadingTypes = Array.isArray(raw.loadingTypes) ? raw.loadingTypes : mapToArr(raw.loadingTypes);

  return ad;
}

/* ===================== МЕТОДЫ ===================== */

/** Прочитать все объявления + авто-миграция (автор + мультиселекты). Наружу — массивы. */
async function getAll() {
  const snap = await get(cargoAdsRef);
  if (!snap.exists()) return [];

  const result = [];
  const updates = [];

  snap.forEach((childSnap) => {
    const key = childSnap.key;
    const raw = childSnap.val();

    // собираем общий patch (автор + мультиселекты)
    const { patch: ownerPatch, changed: ownerChanged } = buildOwnerMigrationPatch(raw);
    const { patch: msPatch, changed: msChanged } = buildMultiSelectMigrationPatch(raw);
    const patch = { ...ownerPatch, ...msPatch };
    const needUpdate = ownerChanged || msChanged;

    if (needUpdate) {
      const adRef = child(cargoAdsRef, key);
      updates.push(update(adRef, patch).catch(() => { }));

      const merged = {
        ...raw,
        ...(patch || {}),
        owner: { ...(raw.owner || {}), ...(patch.owner || {}) },
      };
      if ('ownerName' in patch) delete merged.ownerName;
      if ('ownerPhotoUrl' in patch) delete merged.ownerPhotoUrl;
      if ('ownerRating' in patch) delete merged.ownerRating;
      if ('owner/avatarUrl' in patch && merged.owner) delete merged.owner.avatarUrl;
      if ('ownerId' in patch) merged.ownerId = patch.ownerId;

      result.push({ adId: key, ...toClientArrays(merged) });
    } else {
      result.push({ adId: key, ...toClientArrays(raw) });
    }
  });

  try { await Promise.all(updates); } catch (_) { /* игнорируем ошибки миграции */ }
  return result;
}

/** Прочитать по id + авто-миграция. Наружу — массивы. */
async function getById(adId) {
  if (!adId) return null;
  const adRef = child(cargoAdsRef, adId);
  const snap = await get(adRef);
  if (!snap.exists()) return null;

  const raw = snap.val();

  const { patch: ownerPatch, changed: ownerChanged } = buildOwnerMigrationPatch(raw);
  const { patch: msPatch, changed: msChanged } = buildMultiSelectMigrationPatch(raw);
  const patch = { ...ownerPatch, ...msPatch };
  const needUpdate = ownerChanged || msChanged;

  if (needUpdate) {
    try { await update(adRef, patch); } catch (_) { /* ignore */ }

    const merged = {
      ...raw,
      ...(patch || {}),
      owner: { ...(raw.owner || {}), ...(patch.owner || {}) },
    };
    if ('ownerName' in patch) delete merged.ownerName;
    if ('ownerPhotoUrl' in patch) delete merged.ownerPhotoUrl;
    if ('ownerRating' in patch) delete merged.ownerRating;
    if ('owner/avatarUrl' in patch && merged.owner) delete merged.owner.avatarUrl;
    if ('ownerId' in patch) merged.ownerId = patch.ownerId;

    return { adId, ...toClientArrays(merged) };
  }

  return { adId, ...toClientArrays(raw) };
}

/** Создать объявление (в БД — map'ы, наружу — массивы) */
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
  const raw = snap.val() || {};
  return { adId: newRef.key, ...toClientArrays(raw) };
}

/** Обновить объявление (partial update). В БД — map'ы, наружу — массивы. */
async function updateById(adId, patch = {}) {
  if (!adId) throw new Error('updateById: adId is required');
  const adRef = child(cargoAdsRef, adId);
  const payload = normalizeForDb({
    ...patch,
    updatedAt: serverTimestamp(),
  });
  await update(adRef, payload);
  const snap = await get(adRef);
  const raw = snap.val() || {};
  return { adId, ...toClientArrays(raw) };
}

/** Жёстко удалить объявление (обычно — только админам) */
async function deleteById(adId) {
  if (!adId) throw new Error('deleteById: adId is required');
  const adRef = child(cargoAdsRef, adId);
  await remove(adRef);
  return true;
}

/* ============ СТАТУСЫ (закрыть/архивировать/активировать) ============ */
/** Базовый сеттер статуса; extra — дополнительные поля (причины и т.п.) */
async function setStatusById(adId, status, extra = {}) {
  if (!adId || !status) throw new Error('setStatusById: adId и status обязательны');
  const adRef = child(cargoAdsRef, adId);

  const patch = normalizeForDb({
    status,
    updatedAt: serverTimestamp(),
    ...extra,
  });

  await update(adRef, patch);
  const snap = await get(adRef);
  if (!snap.exists()) throw new Error('Объявление не найдено');
  const raw = snap.val() || {};
  return { adId, ...toClientArrays(raw) };
}

/** Закрыть объявление (доставлено/завершено) */
async function closeById(adId, reason) {
  return setStatusById(adId, 'completed', { closedReason: reason ?? '' });
}

/** Архивировать (скрыть) объявление */
async function archiveById(adId, reason) {
  return setStatusById(adId, 'archived', { archivedReason: reason ?? '' });
}

/** Снова сделать активным */
async function reopenById(adId) {
  return setStatusById(adId, 'active', { closedReason: '', archivedReason: '' });
}

const CargoAdService = {
  getAll,
  getById,
  create,
  updateById,
  deleteById,

  // статусные операции
  setStatusById,
  closeById,
  archiveById,
  reopenById,
};

export default CargoAdService;
