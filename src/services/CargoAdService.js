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

/* ===================== УТИЛИТЫ ===================== */
// массив -> map { key: true }
function arrToMap(arr) {
  const map = {};
  (Array.isArray(arr) ? arr : []).forEach((k) => {
    if (k != null && k !== '') map[String(k)] = true;
  });
  return map;
}
// map { key: true } -> массив ['key', ...]
function mapToArr(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj).filter((k) => !!obj[k]);
}

/** Локальная миграция автора в объекте после чтения (без записи в БД) */
function migrateOwnerInSnapshot(raw = {}) {
  const ad = { ...raw };

  const legacy = {
    name: ad.ownerName,
    photoUrl: ad.ownerPhotoUrl,
    rating: ad.ownerRating,
  };

  if (!ad.owner || typeof ad.owner !== 'object') ad.owner = {};

  if (legacy.name != null && ad.owner.name == null) ad.owner.name = legacy.name;
  if (legacy.photoUrl != null && ad.owner.photoUrl == null) ad.owner.photoUrl = legacy.photoUrl;
  if (legacy.rating != null && ad.owner.rating == null) ad.owner.rating = legacy.rating;

  if ('ownerName' in ad) delete ad.ownerName;
  if ('ownerPhotoUrl' in ad) delete ad.ownerPhotoUrl;
  if ('ownerRating' in ad) delete ad.ownerRating;

  return { ad, changed: true };
}

/** Приведение объявления к формату UI: автор + фото-алиасы + массивы мультиселектов */
function sanitizeAdForRead(raw = {}) {
  // 1) локально переносим легаси в owner
  const { ad } = migrateOwnerInSnapshot(raw);

  // 2) гарантируем owner-объект
  if (!ad.owner || typeof ad.owner !== 'object') ad.owner = {};

  // 3) name/photo — берём из всех возможных источников
  const resolvedName =
    ad.owner?.name ??
    ad.ownerName ??
    ad.userName ??
    ad.owner?.displayName ??
    'Пользователь';

  const resolvedPhoto =
    ad.owner?.photoUrl ??
    ad.ownerAvatar ??
    ad.ownerAvatarUrl ??
    ad.ownerPhotoUrl ??
    ad.userPhoto ??
    null;

  ad.owner.name = ad.owner.name ?? resolvedName;

  if (resolvedPhoto) {
    ad.owner.photoUrl = ad.owner.photoUrl ?? resolvedPhoto;
    // поддержка старых мест, если где-то ещё читается:
    ad.ownerAvatar = ad.ownerAvatar ?? resolvedPhoto;
    ad.ownerAvatarUrl = ad.ownerAvatarUrl ?? resolvedPhoto;
    ad.ownerPhotoUrl = ad.ownerPhotoUrl ?? resolvedPhoto; // топ-левел (legacy)
  }

  // 4) конвертируем поля мультиселектов в массивы для UI
  return toClientArrays(ad);
}

/* =============== МИГРАЦИЯ ДЛЯ ЗАПИСИ В БД (owner) =============== */
/** Сформировать patch для перевода легаси-полей автора в owner{} (с записью в БД) */
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

  // Цели
  const targetOwner = {
    id: ownerIdObj ?? ownerIdTop ?? null,
    name: ownerNameObj ?? ownerNameTop ?? null,
    photoUrl: ownerPhotoObj ?? ownerAvatarObj ?? ownerPhotoTop ?? null,
    rating: ownerRatingObj ?? ownerRatingTop ?? null,
  };

  const ownerPatch = {};
  if (targetOwner.id !== ownerIdObj) { ownerPatch.id = targetOwner.id; changed = true; }
  if (targetOwner.name !== ownerNameObj) { ownerPatch.name = targetOwner.name; changed = true; }
  if (targetOwner.photoUrl !== ownerPhotoObj) { ownerPatch.photoUrl = targetOwner.photoUrl; changed = true; }
  if (targetOwner.rating !== ownerRatingObj) { ownerPatch.rating = targetOwner.rating; changed = true; }

  if (Object.keys(ownerPatch).length) {
    patch['owner'] = { ...(patch['owner'] || {}), ...ownerPatch };
  }

  // Удаляем легаси на верхнем уровне
  if ('ownerName' in raw) { patch['ownerName'] = null; changed = true; }
  if ('ownerPhotoUrl' in raw) { patch['ownerPhotoUrl'] = null; changed = true; }
  if ('ownerRating' in raw) { patch['ownerRating'] = null; changed = true; }

  // Удаляем legacy owner.avatarUrl
  if ('owner' in raw && raw.owner && 'avatarUrl' in raw.owner) {
    patch['owner/avatarUrl'] = null;
    changed = true;
  }

  // Синхронизация ownerId (топ-левел) с owner.id
  if (targetOwner.id != null && ownerIdTop !== targetOwner.id) {
    patch['ownerId'] = targetOwner.id;
    changed = true;
  }

  return { patch, changed };
}

/* =============== МИГРАЦИЯ ДЛЯ ЗАПИСИ В БД (мультиселекты) =============== */
/** Массивы -> map в БД */
function buildMultiSelectMigrationPatch(raw = {}) {
  const patch = {};
  let changed = false;

  if (Array.isArray(raw.preferredLoadingTypes)) {
    patch['preferredLoadingTypes'] = arrToMap(raw.preferredLoadingTypes);
    changed = true;
  }
  if (Array.isArray(raw.packagingTypes)) {
    patch['packagingTypes'] = arrToMap(raw.packagingTypes);
    changed = true;
  }
  if (Array.isArray(raw.loadingTypes)) {
    patch['loadingTypes'] = arrToMap(raw.loadingTypes);
    changed = true;
  }

  return { patch, changed };
}

/* ===================== НОРМАЛИЗАЦИЯ ПЕРЕД ЗАПИСЬЮ ===================== */
/**
 * Переносим легаси-поля владельца в owner.*.
 * clearLegacy: чистить ли legacy-ключи на верхнем уровне (делаем это только если реально заполнили owner.*)
 */
function normalizeOwnerForWrite(payload = {}, { clearLegacy = true } = {}) {
  const p = { ...payload };

  const legacyName = p.ownerName ?? null;
  const legacyPhoto = p.ownerPhotoUrl ?? null;
  const legacyRating = p.ownerRating ?? null;

  if (!p.owner) p.owner = {};
  const before = { ...p.owner };

  if (legacyName != null && p.owner.name == null) p.owner.name = legacyName;
  if (legacyPhoto != null && p.owner.photoUrl == null) p.owner.photoUrl = legacyPhoto;
  if (legacyRating != null && p.owner.rating == null) p.owner.rating = legacyRating;

  const filledOwner =
    before.name !== p.owner.name ||
    before.photoUrl !== p.owner.photoUrl ||
    before.rating !== p.owner.rating;

  if (clearLegacy && filledOwner) {
    p.ownerName = null;
    p.ownerPhotoUrl = null;
    p.ownerRating = null;
  }

  return p;
}

/** Общая нормализация payload перед записью в БД */
function normalizeForDb(ad = {}, opts = {}) {
  const { clearLegacyOnWrite = true } = opts;
  let copy = { ...ad };

  // Автор
  copy = normalizeOwnerForWrite(copy, { clearLegacy: clearLegacyOnWrite });

  // Синхронизация owner.id <-> ownerId
  if (copy.owner && copy.owner.id == null && copy.ownerId != null) {
    copy.owner = { ...copy.owner, id: copy.ownerId };
  }
  if (copy.owner && copy.owner.id != null && copy.ownerId == null) {
    copy.ownerId = copy.owner.id;
  }

  // Мультиселекты: массив -> map
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

/* ===================== К ФОРМАТУ UI ===================== */
/** Поля БД (map) -> массивы для UI */
function toClientArrays(raw = {}) {
  const ad = { ...raw };

  ad.preferredLoadingTypes = mapToArr(raw.preferredLoadingTypes ?? raw.preferred_loading_types);
  ad.packagingTypes = mapToArr(raw.packagingTypes);
  ad.loadingTypes = Array.isArray(raw.loadingTypes) ? raw.loadingTypes : mapToArr(raw.loadingTypes);

  return ad;
}

/* ===================== МЕТОДЫ ===================== */

/** Прочитать все объявления + миграции (owner + мультиселекты) */
async function getAll() {
  const snap = await get(cargoAdsRef);
  if (!snap.exists()) return [];

  const result = [];
  const updates = [];

  snap.forEach((childSnap) => {
    const key = childSnap.key;
    const raw = childSnap.val();

    const { patch: pOwner, changed: chOwner } = buildOwnerMigrationPatch(raw);
    const { patch: pMulti, changed: chMulti } = buildMultiSelectMigrationPatch(raw);
    const mergedPatch = { ...(chOwner ? pOwner : {}), ...(chMulti ? pMulti : {}) };
    const changed = chOwner || chMulti;

    const base = changed
      ? (() => {
        const merged = {
          ...raw,
          owner: { ...(raw.owner || {}), ...(pOwner.owner || {}) },
          preferredLoadingTypes: pMulti.preferredLoadingTypes ?? raw.preferredLoadingTypes,
          packagingTypes: pMulti.packagingTypes ?? raw.packagingTypes,
          loadingTypes: pMulti.loadingTypes ?? raw.loadingTypes,
        };
        if ('ownerName' in pOwner) delete merged.ownerName;
        if ('ownerPhotoUrl' in pOwner) delete merged.ownerPhotoUrl;
        if ('ownerRating' in pOwner) delete merged.ownerRating;
        if ('owner/avatarUrl' in pOwner && merged.owner) delete merged.owner.avatarUrl;
        if ('ownerId' in pOwner) merged.ownerId = pOwner.ownerId;
        updates.push(update(child(cargoAdsRef, key), mergedPatch));
        return merged;
      })()
      : raw;

    const clean = sanitizeAdForRead(base);
    result.push({ adId: key, ...clean });
  });

  try { await Promise.all(updates); } catch (_) { /* игнор */ }
  return result;
}

/** Прочитать объявление по id + миграции (owner + мультиселекты) */
async function getById(adId) {
  if (!adId) return null;
  const adRef = child(cargoAdsRef, adId);
  const snap = await get(adRef);
  if (!snap.exists()) return null;

  const raw = snap.val();

  const { patch: pOwner, changed: chOwner } = buildOwnerMigrationPatch(raw);
  const { patch: pMulti, changed: chMulti } = buildMultiSelectMigrationPatch(raw);
  const mergedPatch = { ...(chOwner ? pOwner : {}), ...(chMulti ? pMulti : {}) };
  const changed = chOwner || chMulti;

  const base = changed
    ? (() => {
      const merged = {
        ...raw,
        owner: { ...(raw.owner || {}), ...(pOwner.owner || {}) },
        preferredLoadingTypes: pMulti.preferredLoadingTypes ?? raw.preferredLoadingTypes,
        packagingTypes: pMulti.packagingTypes ?? raw.packagingTypes,
        loadingTypes: pMulti.loadingTypes ?? raw.loadingTypes,
      };
      if ('ownerName' in pOwner) delete merged.ownerName;
      if ('ownerPhotoUrl' in pOwner) delete merged.ownerPhotoUrl;
      if ('ownerRating' in pOwner) delete merged.ownerRating;
      if ('owner/avatarUrl' in pOwner && merged.owner) delete merged.owner.avatarUrl;
      if ('ownerId' in pOwner) merged.ownerId = pOwner.ownerId;
      try { update(adRef, mergedPatch); } catch (_) { }
      return merged;
    })()
    : raw;

  const clean = sanitizeAdForRead(base);
  return { adId, ...clean };
}

/** Создать объявление */
async function create(adData = {}) {
  const newRef = push(cargoAdsRef);
  const payload = normalizeForDb({
    ...adData,
    adId: newRef.key,
    createdAt: serverTimestamp(),
    status: adData.status || 'active',
  }, { clearLegacyOnWrite: true });
  await set(newRef, payload);
  const snap = await get(newRef);
  const clean = sanitizeAdForRead(snap.val() || {});
  return { adId: newRef.key, ...clean };
}

/** Обновить объявление (partial update, без потери owner.*) */
// src/services/CargoAdService.js

async function updateById(adId, patch = {}) {
  if (!adId) throw new Error('updateById: adId is required');
  const adRef = child(cargoAdsRef, adId);

  // 1) текущее состояние
  const curSnap = await get(adRef);
  if (!curSnap.exists()) throw new Error('updateById: ad not found');
  const current = curSnap.val() || {};

  console.groupCollapsed('%c[CargoAdService.updateById] CURRENT from DB', 'color:#6b7280');
  console.log({ current });
  console.log('current.owner:', current?.owner);
  console.groupEnd();

  // 2) мерджим
  const merged = {
    ...current,
    ...patch,
    updatedAt: serverTimestamp(),
  };

  console.groupCollapsed('%c[CargoAdService.updateById] MERGED before normalize', 'color:#6b7280');
  console.log({ merged });
  console.log('merged.owner:', merged?.owner);
  console.groupEnd();

  // 3) нормализуем (у вас уже есть normalizeForDb)
  const payload = normalizeForDb(merged, { clearLegacyOnWrite: true });

  console.groupCollapsed('%c[CargoAdService.updateById] PAYLOAD to DB (after normalize)', 'color:#ef4444');
  console.log({ payload });
  console.log('payload.owner:', payload?.owner);
  console.groupEnd();

  await update(adRef, payload);

  // 4) читаем обратно
  const snap = await get(adRef);
  const clean = sanitizeAdForRead(snap.val() || {});

  console.groupCollapsed('%c[CargoAdService.updateById] CLEAN to UI (after read)', 'color:#22c55e');
  console.log({ clean });
  console.log('clean.owner:', clean?.owner);
  console.groupEnd();

  return { adId, ...clean };
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

  const payload = normalizeForDb({
    status,
    updatedAt: serverTimestamp(),
    ...extra,
  }, { clearLegacyOnWrite: true });

  await update(adRef, payload);
  const snap = await get(adRef);
  if (!snap.exists()) throw new Error('Объявление не найдено');
  const clean = sanitizeAdForRead(snap.val() || {});
  return { adId, ...clean };
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

  setStatusById,
  closeById,
  archiveById,
  reopenById,
};

export default CargoAdService;
