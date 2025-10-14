// src/services/cargoAdsUtils/cargoAdNormalizer.js
import {
    arrToMap,
    mapToArr,
    photosArrToMap,
    photosMapToArr,
} from './dataMappers';

// ===================== НОРМАЛИЗАЦИЯ ПЕРЕД ЧТЕНИЕМ (UI) =====================

function migrateOwnerInSnapshot(raw = {}) {
    const ad = { ...raw };

    const legacy = {
        name: ad.ownerName,
        photoUrl: ad.ownerPhotoUrl,
        rating: ad.ownerRating,
    };

    if (!ad.owner || typeof ad.owner !== 'object') ad.owner = {};

    if (legacy.name != null && ad.owner.name == null)
        ad.owner.name = legacy.name;
    if (legacy.photoUrl != null && ad.owner.photoUrl == null)
        ad.owner.photoUrl = legacy.photoUrl;
    if (legacy.rating != null && ad.owner.rating == null)
        ad.owner.rating = legacy.rating;

    if ('ownerName' in ad) delete ad.ownerName;
    if ('ownerPhotoUrl' in ad) delete ad.ownerPhotoUrl;
    if ('ownerRating' in ad) delete ad.ownerRating;

    return { ad, changed: true };
}

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

export function sanitizeAdForRead(raw = {}) {
    const { ad } = migrateOwnerInSnapshot(raw);

    if (!ad.owner || typeof ad.owner !== 'object') ad.owner = {};

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

    const uiReady = toClientArrays(ad);

    const arrPhotos = Array.isArray(uiReady.photos)
        ? uiReady.photos
        : photosMapToArr(uiReady.photos);
    uiReady.photos = arrPhotos;

    if (
        typeof uiReady.availabilityDate === 'string' &&
        uiReady.availabilityDate.trim()
    ) {
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
        uiReady.pickupDate =
            uiReady.pickupDate || uiReady.availabilityFrom || '';
        uiReady.deliveryDate =
            uiReady.deliveryDate || uiReady.availabilityTo || '';
    }

    return uiReady;
}

// ===================== НОРМАЛИЗАЦИЯ ПЕРЕД ЗАПИСЬЮ (DB) =====================

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

export function normalizeForDb(ad = {}, opts = {}) {
    const { clearLegacyOnWrite = true } = opts;
    let copy = { ...ad };

    copy = normalizeOwnerForWrite(copy, { clearLegacy: clearLegacyOnWrite });

    if (copy.owner && copy.owner.id == null && copy.ownerId != null) {
        copy.owner = { ...copy.owner, id: copy.ownerId };
    }
    if (copy.owner && copy.owner.id != null && copy.ownerId == null) {
        copy.ownerId = copy.owner.id;
    }

    if (Array.isArray(copy.preferredLoadingTypes)) {
        copy.preferredLoadingTypes = arrToMap(copy.preferredLoadingTypes);
    }
    if (Array.isArray(copy.packagingTypes)) {
        copy.packagingTypes = arrToMap(copy.packagingTypes);
    }
    if (Array.isArray(copy.loadingTypes)) {
        copy.loadingTypes = arrToMap(copy.loadingTypes);
    }

    if (Array.isArray(copy.photos)) {
        copy.photos = photosArrToMap(copy.photos);
    }

    const from = copy.pickupDate || copy.availabilityFrom || '';
    const to = copy.deliveryDate || copy.availabilityTo || '';
    if (from && to) copy.availabilityDate = `${from}—${to}`;
    else if (from) copy.availabilityDate = from;
    else if (to) copy.availabilityDate = to;

    return copy;
}
