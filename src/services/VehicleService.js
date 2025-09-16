// src/services/VehicleService.jsx
// Firebase Realtime DB: сохранить / удалить / загрузить все машины владельца.
// В ПРИЛОЖЕНИИ: используем массивы (loadingTypes: string[], truckPhotoUrls: string[]).
// В БД: храним объектами (флаги и словарь фото) для удобного удаления отдельных полей.

import {
    getDatabase,
    ref,
    get,
    update,
    remove,
    serverTimestamp,
} from 'firebase/database';

/* =========================================================
 * ВСПОМОГАТЕЛЬНЫЕ КОНВЕРТЕРЫ (массивы ⇄ объекты для RTDB)
 * =======================================================*/
const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const arrToFlags = (arr = []) => {
    const out = {};
    arr.filter(Boolean).forEach((k) => {
        out[String(k)] = true;
    });
    return out;
};

const flagsToArr = (obj = {}) =>
    Object.keys(obj)
        .filter((k) => !!obj[k])
        .sort((a, b) => a.localeCompare(b));

const arrToPhotoMap = (arr = []) => {
    const out = {};
    arr.filter(Boolean).forEach((url, i) => {
        out[`ph${i + 1}`] = String(url);
    });
    return out;
};

const photoMapToArr = (obj = {}) =>
    Object.entries(obj)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([, url]) => url)
        .filter(Boolean);

/** Приводим объект из БД к «удобной для приложения» форме (массивы) */
const fromDB = (raw = {}) => ({
    ownerId: String(raw.ownerId || ''),
    truckId: Number(raw.truckId) || 0,
    truckName: String(raw.truckName || '').trim(),
    transportType: String(raw.transportType || '').trim(),
    loadingTypes: flagsToArr(raw.loadingTypes || {}), // ← массив
    truckPhotoUrls: photoMapToArr(raw.truckPhotoUrls || {}), // ← массив
    truckWeight: toNum(raw.truckWeight),
    truckHeight: toNum(raw.truckHeight),
    truckWidth: toNum(raw.truckWidth),
    truckDepth: toNum(raw.truckDepth),
    isActive: raw.isActive !== false,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
});

/** Приводим «удобную форму» (массивы) к формату БД (объекты) */
const toDB = (ownerId, input = {}) => {
    const truckId = Number(input.truckId) || Date.now();
    return {
        ownerId: String(ownerId),
        truckId,
        truckName: String(input.truckName || '').trim(),
        transportType: String(input.transportType || '').trim(),
        loadingTypes: arrToFlags(input.loadingTypes || []), // ← объект-флаги
        truckPhotoUrls: arrToPhotoMap(input.truckPhotoUrls || []), // ← объект
        truckWeight: toNum(input.truckWeight),
        truckHeight: toNum(input.truckHeight),
        truckWidth: toNum(input.truckWidth),
        truckDepth: toNum(input.truckDepth),
        isActive: input.isActive !== false,
    };
};

const pathVehicle = (ownerId, truckId) => `vehicles/${ownerId}/${truckId}`;
const pathOwner = (ownerId) => `vehicles/${ownerId}`;

/* =========================================================
 * ПУБЛИЧНЫЕ МЕТОДЫ СЕРВИСА
 * =======================================================*/

/**
 * Сохранить машину (создать или обновить).
 * @param {string} ownerId
 * @param {object} vehicle - объект в удобной для приложения форме (массивы).
 * @returns {Promise<object>} сохранённая машина (в форме для приложения).
 */
export async function saveVehicle(ownerId, vehicle) {
    if (!ownerId) throw new Error('ownerId is required');

    const db = getDatabase();
    const payload = toDB(ownerId, vehicle);
    const id = String(payload.truckId);

    const r = ref(db, pathVehicle(ownerId, id));
    const prevSnap = await get(r);

    // Сохраняем createdAt, если уже было; иначе ставим serverTimestamp
    const createdAt =
        prevSnap.exists() && prevSnap.val()?.createdAt != null
            ? prevSnap.val().createdAt
            : serverTimestamp();

    const dataForDB = {
        ...payload,
        createdAt,
        updatedAt: serverTimestamp(),
    };

    // update создаст узел, если его не было
    await update(r, dataForDB);

    // читаем обратно и конвертируем для приложения
    const snap = await get(r);
    return snap.exists() ? fromDB(snap.val()) : null;
}

/**
 * Удалить машину.
 * @param {string} ownerId
 * @param {number|string} truckId
 */
export async function deleteVehicle(ownerId, truckId) {
    if (!ownerId) throw new Error('ownerId is required');
    const id = String(truckId);
    const db = getDatabase();
    await remove(ref(db, pathVehicle(ownerId, id)));
}

/**
 * Выгрузить все машины по ownerId.
 * @param {string} ownerId
 * @returns {Promise<object[]>} массив машин (в форме для приложения).
 */
export async function fetchVehiclesByOwner(ownerId) {
    if (!ownerId) return [];
    const db = getDatabase();
    const snap = await get(ref(db, pathOwner(ownerId)));
    if (!snap.exists()) return [];
    const obj = snap.val() || {}; // { truckId: {...}, ... }
    const list = Object.values(obj).map(fromDB);
    // Сортировка по дате создания (если есть)
    list.sort((a, b) => {
        const A = typeof a.createdAt === 'number' ? a.createdAt : 0;
        const B = typeof b.createdAt === 'number' ? b.createdAt : 0;
        return B - A;
    });
    return list;
}
