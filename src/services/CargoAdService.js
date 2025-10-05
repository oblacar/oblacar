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
import { db, storage } from '../firebase'; // 👈 нужен storage
import { ref as storageRef, deleteObject } from 'firebase/storage'; // 👈 для удаления файлов

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

// photos: Array<{id,url|src}> -> Map { id: {url} }
function photosArrToMap(arr) {
  const out = {};
  (Array.isArray(arr) ? arr : []).forEach((p) => {
    const id = p?.id || genId();
    const url = p?.url || p?.src || '';
    if (url) out[id] = { url };
  });
  return out;
}
// photos: Map { id: {url} } -> Array<{id,url}>
function photosMapToArr(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj)
    .map((id) => {
      const url = obj[id]?.url || '';
      return url ? { id, url } : null;
    })
    .filter(Boolean);
}

// Универсально достаём список URL из любого формата photos
function extractPhotoUrls(any) {
  if (!any) return [];
  if (Array.isArray(any)) {
    // [{id,url}] | [{id,src}] | ["https://..."]
    return any
      .map((p) => (typeof p === 'string' ? p : (p?.url || p?.src || '')))
      .filter(Boolean);
  }
  if (typeof any === 'object') {
    // map { id: {url} }
    return Object.values(any)
      .map((v) => v?.url || '')
      .filter(Boolean);
  }
  return [];
}

function genId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `p_${Math.random().toString(36).slice(2)}`
  );
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
  if (legacy.photoUrl != null && ad.owner.photoUrl == null)
    ad.owner.photoUrl = legacy.photoUrl;
  if (legacy.rating != null && ad.owner.rating == null)
    ad.owner.rating = legacy.rating;

  if ('ownerName' in ad) delete ad.ownerName;
  if ('ownerPhotoUrl' in ad) delete ad.ownerPhotoUrl;
  if ('ownerRating' in ad) delete ad.ownerRating;

  return { ad, changed: true };
}

/** Приведение объявления к формату UI:
 *  - автор + фото-алиасы
 *  - мультиселекты в массивы
 *  - photos(map) -> photos(array)
 *  - availabilityDate -> pickup/delivery (для UI)
 */
function sanitizeAdForRead(raw = {}) {
  // 1) локально переносим легаси в owner
  const { ad } = migrateOwnerInSnapshot(raw);

  // 2) гарантируем owner-объект
  if (!ad.owner || typeof ad.owner !== 'object') ad.owner = {};

  // 3) name/photo
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
    ad.ownerAvatar = ad.ownerAvatar ?? resolvedPhoto;
    ad.ownerAvatarUrl = ad.ownerAvatarUrl ?? resolvedPhoto;
    ad.ownerPhotoUrl = ad.ownerPhotoUrl ?? resolvedPhoto;
  }

  // 4) мультиселекты: map -> array для UI
  const uiReady = toClientArrays(ad);

  // 5) photos: map -> array для UI
  const arrPhotos = Array.isArray(uiReady.photos)
    ? uiReady.photos
    : photosMapToArr(uiReady.photos);
  uiReady.photos = arrPhotos;

  // 6) availabilityDate -> pickup/delivery (UI работает с двумя полями)
  if (typeof uiReady.availabilityDate === 'string' && uiReady.availabilityDate.trim()) {
    const s = uiReady.availabilityDate.trim();
    const sep = s.includes('—') ? '—' : s.includes('-') ? '-' : null;
    if (sep) {
      const [from, to] = s.split(sep).map((x) => x.trim());
      uiReady.pickupDate = from || '';
      uiReady.deliveryDate = to || '';
      uiReady.availabilityFrom = uiReady.pickupDate;
      uiReady.availabilityTo = uiReady.deliveryDate;
    } else {
      uiReady.pickupDate = s;
      uiReady.deliveryDate = '';
      uiReady.availabilityFrom = s;
      uiReady.availabilityTo = '';
    }
  } else {
    uiReady.pickupDate = uiReady.pickupDate || uiReady.availabilityFrom || '';
    uiReady.deliveryDate = uiReady.deliveryDate || uiReady.availabilityTo || '';
  }

  return uiReady;
}

/* =============== МИГРАЦИИ (patch builders) ДЛЯ ЗАПИСИ В БД =============== */
function buildOwnerMigrationPatch(raw = {}) {
  const patch = {};
  let changed = false;

  const ownerObj =
    raw.owner && typeof raw.owner === 'object' ? { ...raw.owner } : {};

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
  if (targetOwner.id !== ownerIdObj) {
    ownerPatch.id = targetOwner.id;
    changed = true;
  }
  if (targetOwner.name !== ownerNameObj) {
    ownerPatch.name = targetOwner.name;
    changed = true;
  }
  if (targetOwner.photoUrl !== ownerPhotoObj) {
    ownerPatch.photoUrl = targetOwner.photoUrl;
    changed = true;
  }
  if (targetOwner.rating !== ownerRatingObj) {
    ownerPatch.rating = targetOwner.rating;
    changed = true;
  }

  if (Object.keys(ownerPatch).length) {
    patch['owner'] = { ...(patch['owner'] || {}), ...ownerPatch };
  }

  // Удаляем легаси на верхнем уровне
  if ('ownerName' in raw) {
    patch['ownerName'] = null;
    changed = true;
  }
  if ('ownerPhotoUrl' in raw) {
    patch['ownerPhotoUrl'] = null;
    changed = true;
  }
  if ('ownerRating' in raw) {
    patch['ownerRating'] = null;
    changed = true;
  }

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

/** мультиселекты: массивы -> map (для записи) */
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

/** photos: массив -> map (для записи) */
function buildPhotosMigrationPatch(raw = {}) {
  const patch = {};
  let changed = false;

  if (Array.isArray(raw.photos)) {
    patch['photos'] = photosArrToMap(raw.photos);
    changed = true;
  }

  return { patch, changed };
}

/** availabilityDate: собрать из availabilityFrom/To или pickup/delivery (для записи) */
function buildAvailabilityDatePatch(raw = {}) {
  const patch = {};
  let changed = false;

  const from = raw.availabilityFrom || raw.pickupDate || '';
  const to = raw.availabilityTo || raw.deliveryDate || '';

  if (typeof raw.availabilityDate === 'string' && raw.availabilityDate.trim()) {
    return { patch, changed: false };
  }

  if (from && to) {
    patch['availabilityDate'] = `${from}—${to}`;
    changed = true;
  } else if (from && !to) {
    patch['availabilityDate'] = from;
    changed = true;
  } else if (!from && to) {
    patch['availabilityDate'] = to;
    changed = true;
  }

  return { patch, changed };
}

/** route: если нет route, собрать из departureCity/destinationCity */
function buildRouteMigrationPatch(raw = {}) {
  const patch = {};
  let changed = false;

  const hasRoute = raw.route && typeof raw.route === 'object';
  const from = raw?.route?.from ?? raw.departureCity ?? raw.from ?? '';
  const to = raw?.route?.to ?? raw.destinationCity ?? raw.to ?? '';

  if (!hasRoute && (from || to)) {
    patch['route'] = { from: from || '', to: to || '' };
    changed = true;
  }
  return { patch, changed };
}

/** price: если хранится объектом, расплющить в плоские поля */
function buildPriceFlattenPatch(raw = {}) {
  const patch = {};
  let changed = false;

  if (raw && typeof raw.price === 'object' && raw.price !== null) {
    const val = raw.price.value ?? null;
    const unit = raw.price.unit ?? raw.paymentUnit ?? 'руб';
    const bargain = !!(
      raw.price.readyToNegotiate ??
      raw.readyToNegotiate ??
      true
    );
    patch['price'] = val == null ? null : val;
    patch['paymentUnit'] = unit;
    patch['readyToNegotiate'] = bargain;
    changed = true;
  }
  return { patch, changed };
}

/** зачистка явных легаси-полей после миграции */
function buildLegacyCleanupPatch(raw = {}) {
  const patch = {};
  let changed = false;

  if (raw.route && ('departureCity' in raw || 'destinationCity' in raw)) {
    patch['departureCity'] = null;
    patch['destinationCity'] = null;
    changed = true;
  }

  if (typeof raw.availabilityDate === 'string' && raw.availabilityDate.trim()) {
    if ('availabilityFrom' in raw) {
      patch['availabilityFrom'] = null;
      changed = true;
    }
    if ('availabilityTo' in raw) {
      patch['availabilityTo'] = null;
      changed = true;
    }
    if ('pickupDate' in raw) {
      patch['pickupDate'] = null;
      changed = true;
    }
    if ('deliveryDate' in raw) {
      patch['deliveryDate'] = null;
      changed = true;
    }
  }

  return { patch, changed };
}

/* ===================== НОРМАЛИЗАЦИЯ ПЕРЕД ЗАПИСЬЮ ===================== */
function normalizeOwnerForWrite(payload = {}, { clearLegacy = true } = {}) {
  const p = { ...payload };

  const legacyName = p.ownerName ?? null;
  const legacyPhoto = p.ownerPhotoUrl ?? null;
  const legacyRating = p.ownerRating ?? null;

  if (!p.owner) p.owner = {};
  const before = { ...p.owner };

  if (legacyName != null && p.owner.name == null) p.owner.name = legacyName;
  if (legacyPhoto != null && p.owner.photoUrl == null)
    p.owner.photoUrl = legacyPhoto;
  if (legacyRating != null && p.owner.rating == null)
    p.owner.rating = legacyRating;

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

  // Photos: массив -> map
  if (Array.isArray(copy.photos)) {
    copy.photos = photosArrToMap(copy.photos);
  }

  // AvailabilityDate: собрать из pickup/delivery (или availabilityFrom/To)
  const from = copy.pickupDate || copy.availabilityFrom || '';
  const to = copy.deliveryDate || copy.availabilityTo || '';
  if (from && to) copy.availabilityDate = `${from}—${to}`;
  else if (from) copy.availabilityDate = from;
  else if (to) copy.availabilityDate = to;

  return copy;
}

/* ===================== К ФОРМАТУ UI ===================== */
function toClientArrays(raw = {}) {
  const ad = { ...raw };

  ad.preferredLoadingTypes = mapToArr(
    raw.preferredLoadingTypes ?? raw.preferred_loading_types
  );
  ad.packagingTypes = mapToArr(raw.packagingTypes);
  ad.loadingTypes = Array.isArray(raw.loadingTypes)
    ? raw.loadingTypes
    : mapToArr(raw.loadingTypes);

  return ad;
}

/* ===================== МЕТОДЫ ===================== */

/** Прочитать все объявления + миграции (owner + мультиселекты + photos + availabilityDate) */
async function getAll() {
  const snap = await get(cargoAdsRef);
  if (!snap.exists()) return [];

  const result = [];
  const updates = [];

  snap.forEach((childSnap) => {
    const key = childSnap.key;
    const raw = childSnap.val();

    const { patch: pOwner, changed: chOwner } = buildOwnerMigrationPatch(raw);
    const { patch: pMulti, changed: chMulti } =
      buildMultiSelectMigrationPatch(raw);
    const { patch: pPhotos, changed: chPhotos } = buildPhotosMigrationPatch(raw);
    const { patch: pAvail, changed: chAvail } =
      buildAvailabilityDatePatch(raw);
    const { patch: pRoute, changed: chRoute } = buildRouteMigrationPatch(raw);
    const { patch: pPrice, changed: chPrice } = buildPriceFlattenPatch(raw);

    const mergedPatch = {
      ...(chOwner ? pOwner : {}),
      ...(chMulti ? pMulti : {}),
      ...(chPhotos ? pPhotos : {}),
      ...(chAvail ? pAvail : {}),
      ...(chRoute ? pRoute : {}),
      ...(chPrice ? pPrice : {}),
    };
    const changed =
      chOwner || chMulti || chPhotos || chAvail || chRoute || chPrice;

    const base = changed
      ? (() => {
        const merged = {
          ...raw,
          owner: { ...(raw.owner || {}), ...(pOwner.owner || {}) },
          preferredLoadingTypes:
            pMulti.preferredLoadingTypes ?? raw.preferredLoadingTypes,
          packagingTypes: pMulti.packagingTypes ?? raw.packagingTypes,
          loadingTypes: pMulti.loadingTypes ?? raw.loadingTypes,
          photos: pPhotos.photos ?? raw.photos,
          availabilityDate: pAvail.availabilityDate ?? raw.availabilityDate,
          route: pRoute.route ?? raw.route,
          price: pPrice.price ?? raw.price,
          paymentUnit: pPrice.paymentUnit ?? raw.paymentUnit,
          readyToNegotiate:
            pPrice.readyToNegotiate ?? raw.readyToNegotiate,
        };
        if ('ownerName' in pOwner) delete merged.ownerName;
        if ('ownerPhotoUrl' in pOwner) delete merged.ownerPhotoUrl;
        if ('ownerRating' in pOwner) delete merged.ownerRating;
        if ('owner/avatarUrl' in pOwner && merged.owner)
          delete merged.owner.avatarUrl;
        if ('ownerId' in pOwner) merged.ownerId = pOwner.ownerId;
        updates.push(update(child(cargoAdsRef, key), mergedPatch));
        return merged;
      })()
      : raw;

    const clean = sanitizeAdForRead(base);
    result.push({ adId: key, ...clean });
  });

  try {
    await Promise.all(updates);
  } catch (_) {
    /* игнор */
  }
  return result;
}

/** Прочитать объявление по id + миграции (owner + мультиселекты + photos + availabilityDate) */
async function getById(adId) {
  if (!adId) return null;
  const adRef = child(cargoAdsRef, adId);
  const snap = await get(adRef);
  if (!snap.exists()) return null;

  const raw = snap.val();

  const { patch: pOwner, changed: chOwner } = buildOwnerMigrationPatch(raw);
  const { patch: pMulti, changed: chMulti } = buildMultiSelectMigrationPatch(raw);
  const { patch: pPhotos, changed: chPhotos } = buildPhotosMigrationPatch(raw);
  const { patch: pAvail, changed: chAvail } = buildAvailabilityDatePatch(raw);
  const { patch: pRoute, changed: chRoute } = buildRouteMigrationPatch(raw);
  const { patch: pPrice, changed: chPrice } = buildPriceFlattenPatch(raw);

  const mergedPatch = {
    ...(chOwner ? pOwner : {}),
    ...(chMulti ? pMulti : {}),
    ...(chPhotos ? pPhotos : {}),
    ...(chAvail ? pAvail : {}),
    ...(chRoute ? pRoute : {}),
    ...(chPrice ? pPrice : {}),
  };
  const changed =
    chOwner || chMulti || chPhotos || chAvail || chRoute || chPrice;

  const base = changed
    ? (() => {
      const merged = {
        ...raw,
        owner: { ...(raw.owner || {}), ...(pOwner.owner || {}) },
        preferredLoadingTypes:
          pMulti.preferredLoadingTypes ?? raw.preferredLoadingTypes,
        packagingTypes: pMulti.packagingTypes ?? raw.packagingTypes,
        loadingTypes: pMulti.loadingTypes ?? raw.loadingTypes,
        photos: pPhotos.photos ?? raw.photos,
        availabilityDate: pAvail.availabilityDate ?? raw.availabilityDate,
        route: pRoute.route ?? raw.route,
        price: pPrice.price ?? raw.price,
        paymentUnit: pPrice.paymentUnit ?? raw.paymentUnit,
        readyToNegotiate:
          pPrice.readyToNegotiate ?? raw.readyToNegotiate,
      };
      if ('ownerName' in pOwner) delete merged.ownerName;
      if ('ownerPhotoUrl' in pOwner) delete merged.ownerPhotoUrl;
      if ('ownerRating' in pOwner) delete merged.ownerRating;
      if ('owner/avatarUrl' in pOwner && merged.owner)
        delete merged.owner.avatarUrl;
      if ('ownerId' in pOwner) merged.ownerId = pOwner.ownerId;
      try {
        update(adRef, mergedPatch);
      } catch (_) { }
      return merged;
    })()
    : raw;

  const clean = sanitizeAdForRead(base);
  return { adId, ...clean };
}

/** Создать объявление */
async function create(adData = {}) {
  const newRef = push(cargoAdsRef);
  const payload = normalizeForDb(
    {
      ...adData,
      adId: newRef.key,
      createdAt: serverTimestamp(),
      status: adData.status || 'active',
    },
    { clearLegacyOnWrite: true }
  );
  await set(newRef, payload);
  const snap = await get(newRef);
  const clean = sanitizeAdForRead(snap.val() || {});
  return { adId: newRef.key, ...clean };
}

/** Обновить объявление (partial update, с удалением фоток из Storage, если их убрали из формы) */
async function updateById(adId, patch = {}) {
  if (!adId) throw new Error('updateById: adId is required');
  const adRef = child(cargoAdsRef, adId);

  // 1) текущее состояние
  const curSnap = await get(adRef);
  if (!curSnap.exists()) throw new Error('updateById: ad not found');
  const current = curSnap.val() || {};

  // Список URL «до»
  const beforeUrls = new Set(extractPhotoUrls(current.photos));

  // 2) мерджим пользовательский patch
  const merged = {
    ...current,
    ...patch,
    updatedAt: serverTimestamp(),
  };

  // 3) нормализуем к формату БД
  const payload = normalizeForDb(merged, { clearLegacyOnWrite: true });

  // Список URL «после» (по payload, именно то, что уйдёт в БД)
  const afterUrls = new Set(extractPhotoUrls(payload.photos));

  // 4) считаем, какие фото удалились
  const removedUrls = [];
  beforeUrls.forEach((u) => {
    if (!afterUrls.has(u)) removedUrls.push(u);
  });

  // 5) обновляем запись
  await update(adRef, payload);

  // 6) удаляем лишние файлы из Storage — не блокируем ответ
  if (removedUrls.length) {
    Promise.allSettled(
      removedUrls.map((url) => {
        try {
          // ref(storage, url) принимает https/gs ссылки
          const objRef = storageRef(storage, url);
          return deleteObject(objRef);
        } catch {
          // если URL не из нашего бакета или некорректен — пропускаем
          return Promise.resolve();
        }
      })
    ).catch(() => { });
  }

  // 7) читаем обратно для UI
  const snap = await get(adRef);
  const clean = sanitizeAdForRead(snap.val() || {});
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
// ⛑ Безопасная версия: тянем текущую версию объявления, мерджим и сохраняем,
// чтобы не потерять owner.* и другие поля
async function setStatusById(adId, status, extra = {}) {
  if (!adId || !status) throw new Error('setStatusById: adId и status обязательны');
  const adRef = child(cargoAdsRef, adId);

  // 1) читаем текущее состояние
  const curSnap = await get(adRef);
  if (!curSnap.exists()) throw new Error('Объявление не найдено');
  const current = curSnap.val() || {};

  // 2) мерджим статусы/причины поверх текущего объекта
  const merged = {
    ...current,
    status,
    ...extra,
    updatedAt: serverTimestamp(),
  };

  // 3) подстрахуем owner ↔ плоские поля (ничего не обнуляем)
  if (merged.owner && typeof merged.owner === 'object') {
    const o = merged.owner;
    if (o.id && !merged.ownerId) merged.ownerId = o.id;
    if (o.name && !merged.ownerName) merged.ownerName = o.name;
    if (o.photoUrl && !merged.ownerPhotoUrl) merged.ownerPhotoUrl = o.photoUrl;
    if (o.rating != null && !merged.ownerRating) merged.ownerRating = o.rating;
  } else if (merged.ownerId || merged.ownerName || merged.ownerPhotoUrl || merged.ownerRating != null) {
    // если owner-объекта нет, но есть плоские поля — соберём owner
    merged.owner = {
      id: merged.ownerId ?? null,
      name: merged.ownerName ?? null,
      photoUrl: merged.ownerPhotoUrl ?? null,
      rating: merged.ownerRating ?? null,
    };
  }

  // 4) нормализация без агрессивной зачистки легаси — ничего лишнего не зануляем
  const payload = normalizeForDb(merged, { clearLegacyOnWrite: false });

  // 5) пишем и читаем обратно
  await update(adRef, payload);
  const snap = await get(adRef);
  const clean = sanitizeAdForRead(snap.val() || {});
  return { adId, ...clean };
}


async function closeById(adId, reason) {
  return setStatusById(adId, 'completed', { closedReason: reason ?? '' });
}
async function archiveById(adId, reason) {
  return setStatusById(adId, 'archived', { archivedReason: reason ?? '' });
}
async function reopenById(adId) {
  return setStatusById(adId, 'active', { closedReason: '', archivedReason: '' });
}

/* ===================== МИГРАЦИЯ ВСЕЙ БАЗЫ ===================== */
async function migrateAllToCanonical(options = {}) {
  const { dryRun = true } = options;
  const snap = await get(cargoAdsRef);
  if (!snap.exists()) return { total: 0, changed: 0, ids: [] };

  let total = 0;
  let changed = 0;
  const ids = [];
  const updates = [];

  snap.forEach((childSnap) => {
    total += 1;
    const key = childSnap.key;
    const raw = childSnap.val() || {};

    const { patch: pOwner, changed: chOwner } = buildOwnerMigrationPatch(raw);
    const { patch: pMulti, changed: chMulti } =
      buildMultiSelectMigrationPatch(raw);
    const { patch: pPhotos, changed: chPhotos } = buildPhotosMigrationPatch(raw);
    const { patch: pAvail, changed: chAvail } =
      buildAvailabilityDatePatch(raw);
    const { patch: pRoute, changed: chRoute } = buildRouteMigrationPatch(raw);
    const { patch: pPrice, changed: chPrice } = buildPriceFlattenPatch(raw);

    const beforeCleanup = {
      ...(chOwner ? pOwner : {}),
      ...(chMulti ? pMulti : {}),
      ...(chPhotos ? pPhotos : {}),
      ...(chAvail ? pAvail : {}),
      ...(chRoute ? pRoute : {}),
      ...(chPrice ? pPrice : {}),
    };

    const mergedPreview = {
      ...raw,
      ...beforeCleanup,
      owner: { ...(raw.owner || {}), ...(pOwner.owner || {}) },
    };

    const { patch: pClean, changed: chClean } =
      buildLegacyCleanupPatch(mergedPreview);

    const finalPatch = { ...beforeCleanup, ...(chClean ? pClean : {}) };
    const willChange = Object.keys(finalPatch).length > 0;

    if (willChange) {
      changed += 1;
      ids.push(key);
      if (!dryRun) {
        updates.push(update(child(cargoAdsRef, key), finalPatch));
      }
    }
  });

  if (!dryRun && updates.length) {
    await Promise.allSettled(updates);
  }

  return { total, changed, ids };
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

  migrateAllToCanonical,
};

export default CargoAdService;
