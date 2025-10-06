// src/services/CargoRequestsService.js
// Заявки, которые водитель отправляет на объявление ГРУЗА.
// Храним зеркально transportationRequests, но под cargoRequests.

import { db } from '../firebase';
import { ref, child, get, push, update } from 'firebase/database';

// Статусы заявок
export const CargoRequestStatus = {
    Pending: 'pending',
    Accepted: 'accepted',
    Declined: 'declined',
    Cancelled: 'cancelled',
};

// Корневые пути БД
const ROOT_CARGO_REQUESTS = 'cargoRequests';            // входящие заявки у владельца груза
const ROOT_CARGO_REQUESTS_SENT = 'cargoRequestsSent';   // исходящие заявки у водителя
const ROOT_CARGO_ADS = 'cargoAds';                      // объявления груза (для смены статуса)
const ROOT_TRANSPORTATIONS = 'transportations';         // создаём transport при принятии

// ===== helpers =====
const nowIso = () => new Date().toISOString();

// безопасные приведения: строки/числа
const s = (v) => (typeof v === 'string' ? v : (v == null ? '' : String(v)));
const n = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);

// рекурсивно выкидываем undefined (update ругается на них)
function stripUndefined(obj) {
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
}

// Собираем mainData объявления (шапка) — ключи как в cargoAds
export function makeCargoRequestMainData({ ad }) {
    // читаем значения из разных возможных полей, но ПИШЕМ в единых ключах
    const adId = ad?.id ?? ad?.adId;

    const departureCity =
        ad?.departureCity ?? ad?.locationFrom ?? ad?.routeFrom ?? ad?.from ?? '';

    const destinationCity =
        ad?.destinationCity ?? ad?.locationTo ?? ad?.routeTo ?? ad?.to ?? '';

    const pickupDate =
        ad?.pickupDate ?? ad?.date ?? ad?.when ?? ad?.availabilityDate ?? '';

    const ownerId = ad?.ownerId ?? ad?.owner?.id ?? ad?.userId ?? '';
    const ownerName = ad?.ownerName ?? ad?.owner?.name ?? ad?.userName ?? '';
    const ownerPhotoUrl =
        ad?.ownerPhotoUrl ?? ad?.owner?.photoUrl ?? ad?.userPhoto ?? '';
    const ownerPhone =
        ad?.ownerPhone ?? ad?.owner?.phone ?? ad?.userPhone ?? '';

    const price =
        ad?.price ?? ad?.priceValue ?? ad?.priceAndPaymentUnit?.price ?? 0;

    const paymentUnit =
        ad?.paymentUnit ?? ad?.priceAndPaymentUnit?.unit ?? ad?.currency ?? '';

    return {
        adId: s(adId),
        departureCity: s(departureCity),
        destinationCity: s(destinationCity),
        pickupDate: s(pickupDate),
        price: n(price),
        paymentUnit: s(paymentUnit),
        owner: {
            id: s(ownerId),
            name: s(ownerName),
            photoUrl: s(ownerPhotoUrl),
            contact: s(ownerPhone),
        },
    };
}


// ===== API =====

/**
 * Отправить заявку от водителя на объявление ГРУЗА.
 * Пишет:
 *  - /cargoRequests/{ownerId}/{adId}/main
 *  - /cargoRequests/{ownerId}/{adId}/requests/{requestId}
 *  - /cargoRequestsSent/{driverId}/{adId}
 */
export async function addCargoRequest({ ad, driver, message }) {
    // нормализуем id
    const adId = ad?.id ?? ad?.adId;
    const ownerId = ad?.ownerId;
    if (!adId || !ownerId) {
        throw new Error('addCargoRequest: missing ad.id/ad.adId or ad.ownerId');
    }

    const baseRefPath = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}`;
    const requestsRefPath = `${baseRefPath}/requests`;
    const reqKey = push(ref(db, requestsRefPath)).key;

    const requestObj = {
        requestId: s(reqKey),
        sender: {
            id: s(driver?.id),
            name: s(driver?.name),
            photoUrl: s(driver?.photoUrl),
            contact: s(driver?.contact),
        },
        message: s(message),
        status: CargoRequestStatus.Pending,
        createdAt: nowIso(),
        updatedAt: nowIso(),
    };

    const main = makeCargoRequestMainData({
        ad: {
            ...ad,
            id: adId,
            ownerId,
        },
    });

    console.log('[CargoRequestsService] main normalized →', main);

    const multi = {
        [`${baseRefPath}/main`]: main,
        [`${requestsRefPath}/${reqKey}`]: requestObj,
        [`${ROOT_CARGO_REQUESTS_SENT}/${s(driver?.id)}/${adId}`]: {
            ownerId: s(ownerId),
            adId: s(adId),
            requestId: s(reqKey),
            status: CargoRequestStatus.Pending,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        },
    };

    const safeMulti = stripUndefined(multi);
    console.log('[CargoRequestsService] addCargoRequest update →', safeMulti);
    await update(ref(db), safeMulti);
    console.log('[CargoRequestsService] addCargoRequest OK, reqKey =', reqKey);

    return { requestId: reqKey };
}

/**
 * Отмена своей отправленной заявки водителем.
 * Ставит status=cancelled на обеих сторонах.
 */
export async function cancelCargoRequest({ driverId, ownerId, adId, requestId }) {
    const updates = {};
    updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}/status`] =
        CargoRequestStatus.Cancelled;
    updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}/updatedAt`] = nowIso();

    updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/status`] =
        CargoRequestStatus.Cancelled;
    updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/updatedAt`] = nowIso();

    const safe = stripUndefined(updates);
    console.log('[CargoRequestsService] cancelCargoRequest update →', safe);
    await update(ref(db), safe);
    console.log('[CargoRequestsService] cancelCargoRequest OK');
}

/**
 * Перезапуск заявки (водитель): создаём новую с новым requestId.
 * Старую можно оставить в истории (cancelled/declined).
 */
export async function restartCargoRequest(params) {
    console.log('[CargoRequestsService] restartCargoRequest →', params?.ad?.id ?? params?.ad?.adId);
    return addCargoRequest(params);
}

/**
 * Владелец груза принимает одну заявку:
 *  - выбранной ставим accepted
 *  - остальные pending → declined
 *  - объявление переводим в work
 *  - создаём Transportation со статусом confirmed
 */
export async function acceptCargoRequest({ ownerId, ad, requestId }) {
    const adId = ad?.id ?? ad?.adId;
    if (!ownerId || !adId) throw new Error('acceptCargoRequest: missing ownerId/adId');

    const reqsPath = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests`;
    console.log('[CargoRequestsService] acceptCargoRequest read →', reqsPath);
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

    // ad → work
    updates[`${ROOT_CARGO_ADS}/${adId}/status`] = 'work';
    updates[`${ROOT_CARGO_ADS}/${adId}/updatedAt`] = nowIso();

    // create transportation
    const tKey = push(ref(db, ROOT_TRANSPORTATIONS)).key;
    const acceptedReq = requests[requestId];

    updates[`${ROOT_TRANSPORTATIONS}/${tKey}`] = {
        transportationId: s(tKey),
        adId: s(adId),
        createdAt: nowIso(),
        status: 'confirmed',
        cargoOwner: {
            id: s(ownerId),
            name: s(ad.ownerName),
            photoUrl: s(ad.ownerPhotoUrl),
            contact: s(ad.ownerPhone),
        },
        carrier: {
            id: s(acceptedReq?.sender?.id),
            name: s(acceptedReq?.sender?.name),
            photoUrl: s(acceptedReq?.sender?.photoUrl),
            contact: s(acceptedReq?.sender?.contact),
        },
        route: {
            from: s(ad.departureCity ?? ad.locationFrom ?? ad.routeFrom ?? ''),
            to: s(ad.destinationCity ?? ad.locationTo ?? ad.routeTo ?? ''),
            date: s(ad.pickupDate ?? ad.date ?? ''),
            price: n(ad.price),
            paymentUnit: s(ad.paymentUnit),
        },
    };

    const safe = stripUndefined(updates);
    console.log('[CargoRequestsService] acceptCargoRequest update →', safe);
    await update(ref(db), safe);
    console.log('[CargoRequestsService] acceptCargoRequest OK, tKey =', tKey);

    return { transportationId: tKey };
}

/**
 * Отклонить конкретную заявку (владелец груза).
 */
export async function declineCargoRequest({ ownerId, adId, requestId }) {
    const reqPath = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}`;
    console.log('[CargoRequestsService] declineCargoRequest read →', reqPath);
    const reqSnap = await get(ref(db, reqPath));
    if (!reqSnap.exists()) {
        console.warn('[CargoRequestsService] declineCargoRequest: request not found');
        return;
    }
    const r = reqSnap.val();
    const updates = {};
    updates[`${reqPath}/status`] = CargoRequestStatus.Declined;
    updates[`${reqPath}/updatedAt`] = nowIso();

    const driverId = r?.sender?.id;
    if (driverId) {
        updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/status`] = CargoRequestStatus.Declined;
        updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/updatedAt`] = nowIso();
    }

    const safe = stripUndefined(updates);
    console.log('[CargoRequestsService] declineCargoRequest update →', safe);
    await update(ref(db), safe);
    console.log('[CargoRequestsService] declineCargoRequest OK');
}

/**
 * Получить статусы отправленных водителем заявок: [{ adId, status, requestId }]
 */
export async function getSentRequestsStatuses(driverId) {
    const path = `${ROOT_CARGO_REQUESTS_SENT}/${driverId}`;
    console.log('[CargoRequestsService] getSentRequestsStatuses read →', path);
    const snap = await get(ref(db, path));
    if (!snap.exists()) return [];
    const obj = snap.val();
    const list = Object.keys(obj).map((adId) => ({
        adId,
        status: obj[adId]?.status,
        requestId: obj[adId]?.requestId,
    }));
    console.log('[CargoRequestsService] getSentRequestsStatuses ←', list);
    return list;
}

/**
 * Получить все заявки по объявлению (для владельца груза)
 */
export async function getAdCargoRequestsForOwner({ ownerId, adId }) {
    const path = `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}`;
    console.log('[CargoRequestsService] getAdCargoRequestsForOwner read →', path);
    const snap = await get(ref(db, path));
    if (!snap.exists()) return { main: null, requests: [] };

    const data = snap.val();
    const requests = data.requests ? Object.values(data.requests) : [];
    const result = { main: data.main || null, requests };
    console.log('[CargoRequestsService] getAdCargoRequestsForOwner ←', {
        hasMain: !!result.main, requestsCount: result.requests.length,
    });
    return result;
}
