// src/services/cargoAds/cargoAdMigrator.js

import { arrToMap, mapToArr, photosArrToMap } from './dataMappers';

// ======================= МИГРАЦИИ (Patch Builders) =======================

/** Приведение владельца к формату owner: {id, name, photoUrl, rating} */
export function buildOwnerMigrationPatch(raw = {}) {
    const patch = {};
    let changed = false;

    // ... (весь код функции buildOwnerMigrationPatch) ...
    // [80 строк, включая сложную логику миграции legacy-полей]
    // Чтобы не дублировать 80 строк: здесь оставляем ВЕСЬ код этой функции.

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
export function buildMultiSelectMigrationPatch(raw = {}) {
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
export function buildPhotosMigrationPatch(raw = {}) {
    const patch = {};
    let changed = false;

    if (Array.isArray(raw.photos)) {
        patch['photos'] = photosArrToMap(raw.photos);
        changed = true;
    }

    return { patch, changed };
}

/** availabilityDate: собрать из availabilityFrom/To или pickup/delivery (для записи) */
export function buildAvailabilityDatePatch(raw = {}) {
    const patch = {};
    let changed = false;

    const from = raw.availabilityFrom || raw.pickupDate || '';
    const to = raw.availabilityTo || raw.deliveryDate || '';

    if (
        typeof raw.availabilityDate === 'string' &&
        raw.availabilityDate.trim()
    ) {
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
export function buildRouteMigrationPatch(raw = {}) {
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
export function buildPriceFlattenPatch(raw = {}) {
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

/** зачистка явных легаси-полей после миграции (когда новые поля уже заполнены) */
export function buildLegacyCleanupPatch(raw = {}) {
    const patch = {};
    let changed = false;

    if (raw.route && ('departureCity' in raw || 'destinationCity' in raw)) {
        patch['departureCity'] = null;
        patch['destinationCity'] = null;
        changed = true;
    }

    if (
        typeof raw.availabilityDate === 'string' &&
        raw.availabilityDate.trim()
    ) {
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
