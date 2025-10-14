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
import { db, storage } from '../firebase';
import { ref as storageRef, deleteObject } from 'firebase/storage';

// 🔗 нормализация/миграции
import {
    sanitizeAdForRead,
    normalizeForDb,
} from './cargoAdsUtils/cargoAdNormalizer';
import * as Migrator from './cargoAdsUtils/cargoAdMigrator';

// 🔧 утилиты
import { extractPhotoUrls } from './cargoAdsUtils/dataMappers';

// 👇 каскад по обратным ссылкам (adsRefs)
import { AdsRefsService } from './AdsRefsService';

const cargoAdsRef = ref(db, 'cargoAds');

/* ===================== ВСПОМОГАТЕЛЬНОЕ ===================== */

function buildCombinedPatch(raw) {
    const patches = [
        Migrator.buildOwnerMigrationPatch(raw),
        Migrator.buildMultiSelectMigrationPatch(raw),
        Migrator.buildPhotosMigrationPatch(raw),
        Migrator.buildAvailabilityDatePatch(raw),
        Migrator.buildRouteMigrationPatch(raw),
        Migrator.buildPriceFlattenPatch(raw),
    ];

    const mergedPatch = patches.reduce(
        (acc, { patch, changed }) => (changed ? { ...acc, ...patch } : acc),
        {}
    );
    const changed = patches.some((p) => p.changed);
    return { mergedPatch, changed };
}

/* ===================== ЧТЕНИЕ (с on-the-fly миграцией) ===================== */

export async function getAll() {
    const snap = await get(cargoAdsRef);
    if (!snap.exists()) return [];

    const result = [];
    const updates = [];

    snap.forEach((childSnap) => {
        const key = childSnap.key;
        const raw = childSnap.val();

        const { mergedPatch, changed } = buildCombinedPatch(raw);
        // ВАЖНО: даём sanitize уже «применённый» объект, чтобы UI не ждал записи в БД
        const base = changed ? { ...raw, ...mergedPatch } : raw;

        if (changed) {
            updates.push(update(child(cargoAdsRef, key), mergedPatch));
        }

        const clean = sanitizeAdForRead(base);
        result.push({ adId: key, ...clean });
    });

    try {
        await Promise.all(updates);
    } catch (_) {
        /* ignore */
    }

    return result;
}

export async function getById(adId) {
    if (!adId) return null;
    const adRef = child(cargoAdsRef, adId);
    const snap = await get(adRef);
    if (!snap.exists()) return null;

    const raw = snap.val();
    const { mergedPatch, changed } = buildCombinedPatch(raw);
    const base = changed ? { ...raw, ...mergedPatch } : raw;

    if (changed) {
        try {
            await update(adRef, mergedPatch);
        } catch (_) {}
    }

    const clean = sanitizeAdForRead(base);
    return { adId, ...clean };
}

/* ===================== CRUD ===================== */

export async function create(adData = {}) {
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

    // (не обязательно) можешь инициализировать служебный блок ссылок
    // await AdsRefsService.addRef(newRef.key, '_meta', 'created');

    const snap = await get(newRef);
    const clean = sanitizeAdForRead(snap.val() || {});
    return { adId: newRef.key, ...clean };
}

export async function updateById(adId, patch = {}) {
    if (!adId) throw new Error('updateById: adId is required');
    const adRef = child(cargoAdsRef, adId);

    const curSnap = await get(adRef);
    if (!curSnap.exists()) throw new Error('updateById: ad not found');
    const current = curSnap.val() || {};

    const beforeUrls = new Set(extractPhotoUrls(current.photos));

    const merged = {
        ...current,
        ...patch,
        updatedAt: serverTimestamp(),
    };

    const payload = normalizeForDb(merged, { clearLegacyOnWrite: true });

    const afterUrls = new Set(extractPhotoUrls(payload.photos));
    const removedUrls = [];
    beforeUrls.forEach((u) => {
        if (!afterUrls.has(u)) removedUrls.push(u);
    });

    await update(adRef, payload);

    if (removedUrls.length) {
        Promise.allSettled(
            removedUrls.map((url) => {
                try {
                    const objRef = storageRef(storage, url);
                    return deleteObject(objRef);
                } catch {
                    return Promise.resolve();
                }
            })
        ).catch(() => {});
    }

    const snap = await get(adRef);
    const clean = sanitizeAdForRead(snap.val() || {});
    return { adId, ...clean };
}

/** Жёстко удалить объявление (каскад по links + фото + сам узел) */
export async function deleteById(adId) {
    if (!adId) throw new Error('deleteById: adId is required');
    const adRef = child(cargoAdsRef, adId);

    // 1) снимем текущие данные, чтобы удалить фото
    let current = null;
    try {
        const snap = await get(adRef);
        current = snap.exists() ? snap.val() || null : null;
    } catch {}

    // 2) каскад по обратным ссылкам (удалит cargoRequests*, conversations*, etc.)
    try {
        await AdsRefsService.cascadeDeleteByRefs(adId);
    } catch (e) {
        console.warn('AdsRefs cascade failed (continue anyway):', e);
    }

    // 3) удалить сам узел объявления
    await remove(adRef);

    // 4) удалить фото из Storage (не блокируем)
    if (current) {
        const urls = extractPhotoUrls(current.photos);
        if (urls.length) {
            Promise.allSettled(
                urls.map((url) => {
                    try {
                        const objRef = storageRef(storage, url);
                        return deleteObject(objRef);
                    } catch {
                        return Promise.resolve();
                    }
                })
            ).catch(() => {});
        }
    }

    return true;
}

/* ===================== СТАТУСЫ ===================== */

export async function setStatusById(adId, status, extra = {}) {
    if (!adId || !status)
        throw new Error('setStatusById: adId и status обязательны');
    const adRef = child(cargoAdsRef, adId);

    const curSnap = await get(adRef);
    if (!curSnap.exists()) throw new Error('Объявление не найдено');
    const current = curSnap.val() || {};

    const merged = {
        ...current,
        status,
        ...extra,
        updatedAt: serverTimestamp(),
    };

    // подстрахуем owner ↔ плоские поля
    if (merged.owner && typeof merged.owner === 'object') {
        const o = merged.owner;
        if (o.id && !merged.ownerId) merged.ownerId = o.id;
        if (o.name && !merged.ownerName) merged.ownerName = o.name;
        if (o.photoUrl && !merged.ownerPhotoUrl)
            merged.ownerPhotoUrl = o.photoUrl;
        if (o.rating != null && !merged.ownerRating)
            merged.ownerRating = o.rating;
    } else if (
        merged.ownerId ||
        merged.ownerName ||
        merged.ownerPhotoUrl ||
        merged.ownerRating != null
    ) {
        merged.owner = {
            id: merged.ownerId ?? null,
            name: merged.ownerName ?? null,
            photoUrl: merged.ownerPhotoUrl ?? null,
            rating: merged.ownerRating ?? null,
        };
    }

    const payload = normalizeForDb(merged, { clearLegacyOnWrite: false });

    await update(adRef, payload);
    const snap = await get(adRef);
    const clean = sanitizeAdForRead(snap.val() || {});
    return { adId, ...clean };
}

export const closeById = (adId, reason) =>
    setStatusById(adId, 'completed', { closedReason: reason ?? '' });
export const archiveById = (adId, reason) =>
    setStatusById(adId, 'archived', { archivedReason: reason ?? '' });
export const reopenById = (adId) =>
    setStatusById(adId, 'active', { closedReason: '', archivedReason: '' });

/* ===================== МИГРАЦИЯ ===================== */

export async function migrateAllToCanonical(options = {}) {
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

        const { mergedPatch: beforeCleanup } = buildCombinedPatch(raw);

        const mergedPreview = { ...raw, ...beforeCleanup };
        const { patch: pClean, changed: chClean } =
            Migrator.buildLegacyCleanupPatch(mergedPreview);

        const finalPatch = { ...beforeCleanup, ...(chClean ? pClean : {}) };
        const willChange = Object.keys(finalPatch).length > 0;

        if (willChange) {
            changed += 1;
            ids.push(key);
            if (!dryRun)
                updates.push(update(child(cargoAdsRef, key), finalPatch));
        }
    });

    if (!dryRun && updates.length) await Promise.allSettled(updates);

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
