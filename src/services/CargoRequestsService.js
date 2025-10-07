// src/services/CargoRequestsService.js
import { db } from '../firebase';
import { ref, get, push, update } from 'firebase/database';

export const CargoRequestStatus = {
    Pending: 'pending',
    Accepted: 'accepted',
    Declined: 'declined',
    Cancelled: 'cancelled',
};

const ROOT_CARGO_REQUESTS = 'cargoRequests';
const ROOT_CARGO_REQUESTS_SENT = 'cargoRequestsSent';
const ROOT_CARGO_ADS = 'cargoAds';
const ROOT_TRANSPORTATIONS = 'transportations';

const nowIso = () => new Date().toISOString();

// -- утилиты
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const stripUndefined = (obj) => {
    if (obj == null) return obj;
    if (Array.isArray(obj)) return obj.map(stripUndefined);
    if (typeof obj === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
            if (v === undefined) continue;
            out[k] = stripUndefined(v);
        }
        return out;
    }
    return obj;
};

// ===== API ожидает ТОЛЬКО строгие сущности =====

/**
 * Создать заявку на объявление ГРУЗА.
 * @param {CargoRequestMainData} mainData  // { adId, departureCity, destinationCity, date, price, paymentUnit, owner:{ id, name, photourl, contact } }
 * @param {CargoRequest} request           // { requestId?, sender:{ id, name, photourl, contact }, dateSent, status, dateConfirmed?, description? }
 * @returns {Promise<string>} requestId
 */
export async function addCargoRequest(mainData, request) {
    // жёсткие инварианты
    assert(mainData && typeof mainData === 'object', 'mainData is required');
    assert(request && typeof request === 'object', 'request is required');
    assert(mainData.adId, 'mainData.adId is required');
    assert(mainData.owner && mainData.owner.id, 'mainData.owner.id is required');
    assert(mainData.date, 'mainData.date is required');
    assert(mainData.departureCity, 'mainData.departureCity is required');
    assert(mainData.destinationCity, 'mainData.destinationCity is required');

    assert(request.sender && request.sender.id, 'request.sender.id is required');
    assert(request.status, 'request.status is required');
    // description — можно пустую, но ключ должен быть

    const adId = mainData.adId;
    const ownerId = mainData.owner.id;
    const driverId = request.sender.id;

    const baseRefPath = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}`;
    const reqKey = push(ref(db, `${baseRefPath}/requests`)).key;

    // формируем то, что пишем
    const requestObj = {
        requestId: reqKey,
        sender: { ...request.sender },    // {id,name,photourl,contact}
        dateSent: request.dateSent || nowIso(),
        status: request.status,
        description: request.description || '',
        createdAt: nowIso(),
        updatedAt: nowIso(),
    };

    const main = {
        adId: mainData.adId,
        departureCity: mainData.departureCity,
        destinationCity: mainData.destinationCity,
        date: mainData.date,              // единый ключ
        price: mainData.price ?? 0,
        paymentUnit: mainData.paymentUnit || '',
        owner: {
            id: mainData.owner.id,
            name: mainData.owner.name || '',
            // сохраняем оба ключа, если хочешь бэкв. совместимость
            // photourl: mainData.owner.photourl || mainData.owner.photoUrl || '',
            photoUrl: mainData.owner.photoUrl || mainData.owner.photourl || '',
            contact: mainData.owner.contact || '',
        },
    };

    const multi = {};
    // чистим возможный legacy-узел "main"
    multi[`${baseRefPath}/main`] = null;
    // плоская запись заголовка
    const flatMainEntries = {
        adId: main.adId,
        departureCity: main.departureCity,
        destinationCity: main.destinationCity,
        date: main.date,
        price: main.price ?? 0,
        paymentUnit: main.paymentUnit || '',
        // владелец
        'owner/id': main.owner.id,
        'owner/name': main.owner.name || '',
        // 'owner/photourl': (main.owner.photourl ?? main.owner.photoUrl) || '',
        'owner/photoUrl': (main.owner.photoUrl ?? main.owner.photourl) || '',
        'owner/contact': main.owner.contact || '',
    };
    for (const [k, v] of Object.entries(flatMainEntries)) {
        multi[`${baseRefPath}/${k}`] = v;
    }

    // Заявка
    multi[`${baseRefPath}/requests/${reqKey}`] = requestObj;

    // Зеркало для отправителя
    multi[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}`] = {
        ownerId,
        adId,
        requestId: reqKey,
        status: requestObj.status,
        createdAt: nowIso(),
        updatedAt: nowIso(),
    };

    const safeMulti = stripUndefined(multi);
    await update(ref(db), safeMulti);

    return reqKey;
}

/**
 * Отмена своей отправленной заявки водителем.
 * @param {{driverId:string, ownerId:string, adId:string, requestId:string}} params
 */
export async function cancelCargoRequest({ driverId, ownerId, adId, requestId }) {
    const updates = stripUndefined({
        [`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}/status`]: CargoRequestStatus.Cancelled,
        [`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}/updatedAt`]: nowIso(),
        [`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/status`]: CargoRequestStatus.Cancelled,
        [`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/updatedAt`]: nowIso(),
    });
    await update(ref(db), updates);
}

/**
 * Повторная отправка (создаёт новую запись).
 * @param {CargoRequestMainData} mainData
 * @param {CargoRequest} request
 */
export async function restartCargoRequest(mainData, request) {
    return addCargoRequest(mainData, request);
}

/**
 * Принять заявку (владелец груза).
 * @param {{ownerId:string, ad:{adId?:string,id?:string, ...}, requestId:string}} params
 */
export async function acceptCargoRequest({ ownerId, ad, requestId }) {
    const adId = ad?.id ?? ad?.adId;
    assert(ownerId && adId, 'acceptCargoRequest: missing ownerId/adId');

    const reqsPath = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests`;
    const snap = await get(ref(db, reqsPath));
    const requests = snap.exists() ? snap.val() : {};

    const updates = {};
    for (const [rid, r] of Object.entries(requests)) {
        const isAccepted = rid === requestId;
        const newStatus = isAccepted
            ? CargoRequestStatus.Accepted
            : (r?.status === CargoRequestStatus.Pending ? CargoRequestStatus.Declined : r?.status);

        updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${rid}/status`] = newStatus;
        updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${rid}/updatedAt`] = nowIso();

        const driverId = r?.sender?.id;
        if (driverId) {
            updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/status`] = newStatus;
            updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/updatedAt`] = nowIso();
        }
    }

    // объявление → work
    updates[`${ROOT_CARGO_ADS}/${adId}/status`] = 'work';
    updates[`${ROOT_CARGO_ADS}/${adId}/updatedAt`] = nowIso();

    // (опционально) создание transportation — оставляю как было у тебя
    // ...

    await update(ref(db), stripUndefined(updates));
}

/**
 * Отклонить заявку (владелец груза).
 * @param {{ownerId:string, adId:string, requestId:string}} params
 */
export async function declineCargoRequest({ ownerId, adId, requestId }) {
    const reqPath = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}`;
    const snap = await get(ref(db, reqPath));
    if (!snap.exists()) return;

    const r = snap.val();
    const driverId = r?.sender?.id;

    const updates = stripUndefined({
        [`${reqPath}/status`]: CargoRequestStatus.Declined,
        [`${reqPath}/updatedAt`]: nowIso(),
        ...(driverId ? {
            [`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/status`]: CargoRequestStatus.Declined,
            [`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/updatedAt`]: nowIso(),
        } : {}),
    });

    await update(ref(db), updates);
}

/**
 * Статусы отправленных водителем заявок.
 * @param {string} driverId
 * @returns {Promise<Array<{adId:string, status:string, requestId:string}>>}
 */
export async function getSentRequestsStatuses(driverId) {
    const path = `${ROOT_CARGO_REQUESTS_SENT}/${driverId}`;
    const snap = await get(ref(db, path));
    if (!snap.exists()) return [];
    const obj = snap.val();
    return Object.keys(obj).map((adId) => ({
        adId,
        status: obj[adId]?.status,
        requestId: obj[adId]?.requestId,
    }));
}

/**
 * Все заявки по объявлению (для владельца).
 * @param {{ownerId:string, adId:string}} params
 */
export async function getAdCargoRequestsForOwner({ ownerId, adId }) {
    const path = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}`;
    const snap = await get(ref(db, path));
    if (!snap.exists()) return { main: null, requests: [] };
    const data = snap.val();
    return { main: data.main || null, requests: data.requests ? Object.values(data.requests) : [] };
}

/**
 * Вернуть МОИ заявки по грузу (для текущего водителя).
 * Источник: /cargoRequestsSent/{driverId}
 * Для каждого adId подтягиваем main и сам request из /cargoRequests/{ownerId}/{adId}
 *
 * @param {string} driverId
 * @returns {Promise<Record<string, {
 *   adId: string,
 *   adData: {
 *     locationFrom: string,
 *     locationTo: string,
 *     date: string,
 *     price: number,
 *     paymentUnit: string,
 *     owner: { id: string, name: string, photoUrl: string, contact: string }
 *   },
 *   requestData: {
 *     requestId: string,
 *     sender: { id: string, name: string, photoUrl: string, contact: string },
 *     dateSent: string,
 *     status: string,
 *     description: string
 *   }
 * }>>}
 */
export async function getMyCargoRequests(driverId) {
    const sentPath = `${ROOT_CARGO_REQUESTS_SENT}/${driverId}`;
    const sentSnap = await get(ref(db, sentPath));
    if (!sentSnap.exists()) return {};

    const sent = sentSnap.val(); // { [adId]: { ownerId, requestId, status, ... } }
    const entries = Object.entries(sent);

    const results = await Promise.all(entries.map(async ([adId, meta]) => {
        const ownerId = meta?.ownerId;
        const requestId = meta?.requestId;

        // читаем main + requests
        const basePath = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}`;
        const baseSnap = await get(ref(db, basePath));
        if (!baseSnap.exists()) {
            return [adId, null];
        }
        const base = baseSnap.val(); // { main, requests: {reqId: {...}} }
        const main = base?.main || base; // если исторически писали в корень

        const reqNode = requestId ? base?.requests?.[requestId] : null;

        // Сформируем UI-удобный объект (как AdTransportationRequest по форме)
        const adData = {
            locationFrom: main?.departureCity ?? main?.locationFrom ?? '',
            locationTo: main?.destinationCity ?? main?.locationTo ?? '',
            date: main?.date ?? main?.pickupDate ?? '',
            price: Number(main?.price) || 0,
            paymentUnit: main?.paymentUnit ?? '',
            owner: {
                id: main?.owner?.id ?? '',
                name: main?.owner?.name ?? '',
                photoUrl: main?.owner?.photoUrl ?? main?.owner?.photourl ?? '',
                contact: main?.owner?.contact ?? '',
            },
        };

        const requestData = {
            requestId: requestId || '',
            sender: {
                id: reqNode?.sender?.id ?? '',
                name: reqNode?.sender?.name ?? '',
                photoUrl: reqNode?.sender?.photoUrl ?? reqNode?.sender?.photourl ?? '',
                contact: reqNode?.sender?.contact ?? '',
            },
            dateSent: reqNode?.dateSent ?? '',
            // статус берём из зеркала (sent), а если его нет — из узла заявки
            status: meta?.status ?? reqNode?.status ?? 'pending',
            description: reqNode?.description ?? '',
        };

        return [adId, {
            adId,
            adData,
            requestData,
        }];
    }));

    // соберём в map по adId
    const map = {};
    for (const [adId, obj] of results) {
        if (adId && obj) map[adId] = obj;
    }
    return map;
}
