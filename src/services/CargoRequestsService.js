// src/services/CargoRequestsService.js
// Заявки, которые водитель отправляет на объявление ГРУЗА.
// Храним зеркально твоей коллекции transportationRequests, но под cargoRequests.

import { db } from '../firebase';
import {
    ref,
    child,
    get,
    set,
    push,
    update,
    remove,
} from 'firebase/database';

// Статусы заявок
export const CargoRequestStatus = {
    Pending: 'pending',
    Accepted: 'accepted',
    Declined: 'declined',
    Cancelled: 'cancelled',
};

// Корневые пути БД (можно поменять под твой стиль)
const ROOT_CARGO_REQUESTS = 'cargoRequests';              // входящие заявки у владельца груза
const ROOT_CARGO_REQUESTS_SENT = 'cargoRequestsSent';     // исходящие заявки у водителя
const ROOT_CARGO_ADS = 'cargoAds';                        // объявления груза (для смены статуса)
const ROOT_TRANSPORTATIONS = 'transportations';           // создаём транспортировку когда приняли

// ====== helpers ======

function nowIso() {
    return new Date().toISOString();
}

// Собираем mainData объявления (хедер), чтобы быстро показывать в списках
export function makeCargoRequestMainData({ ad }) {
    return {
        adId: ad.id,
        locationFrom: ad.locationFrom,
        locationTo: ad.locationTo,
        date: ad.date, // ожидаемый формат dd.mm.yyyy (как у тебя)
        price: ad.price,
        paymentUnit: ad.paymentUnit,
        owner: {
            id: ad.ownerId,
            name: ad.ownerName,
            photoUrl: ad.ownerPhotoUrl,
            contact: ad.ownerPhone || '',
        },
    };
}

// ====== API ======

/**
 * Отправить заявку от водителя на объявление ГРУЗА.
 * Создаёт запись в:
 *  - /cargoRequests/{ownerId}/{adId}/requests/{requestId}
 *  - /cargoRequestsSent/{driverId}/{adId} = { ownerId, adId, requestId }
 */
export async function addCargoRequest({ ad, driver, message }) {
    // ad: объект объявления груза
    // driver: { id, name, photoUrl, contact }
    const main = makeCargoRequestMainData({ ad });

    const ownerId = ad.ownerId;
    const adId = ad.id;

    const baseRef = ref(db, `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}`);
    const requestsRef = child(baseRef, 'requests');
    const reqKey = push(requestsRef).key;

    const requestObj = {
        requestId: reqKey,
        sender: { // кто отправляет заявку — ВОДИТЕЛЬ
            id: driver.id,
            name: driver.name || '',
            photoUrl: driver.photoUrl || '',
            contact: driver.contact || '',
        },
        message: message || '',
        status: CargoRequestStatus.Pending,
        createdAt: nowIso(),
        updatedAt: nowIso(),
    };

    const multi = {};
    // заголовок (mainData) держим рядом
    multi[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/main`] = main;
    multi[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${reqKey}`] = requestObj;

    // зеркальная запись для отправителя (чтобы быстро показать статус своих заявок)
    multi[`${ROOT_CARGO_REQUESTS_SENT}/${driver.id}/${adId}`] = {
        ownerId,
        adId,
        requestId: reqKey,
        status: CargoRequestStatus.Pending,
        createdAt: nowIso(),
        updatedAt: nowIso(),
    };

    await update(ref(db), multi);

    return { requestId: reqKey };
}

/**
 * Отмена своей отправленной заявки водителем.
 * Ставит status=cancelled на обеих сторонах.
 */
export async function cancelCargoRequest({ driverId, ownerId, adId, requestId }) {
    const updates = {};
    updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}/status`] = CargoRequestStatus.Cancelled;
    updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}/updatedAt`] = nowIso();

    updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/status`] = CargoRequestStatus.Cancelled;
    updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/updatedAt`] = nowIso();

    await update(ref(db), updates);
}

/**
 * Перезапуск заявки (водитель): создаём новую с новым requestId.
 * Старую можно оставить в истории (cancelled/declined).
 */
export async function restartCargoRequest(params) {
    // просто вызываем addCargoRequest заново
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
    const adId = ad.id;

    // 1) читаем все заявки по объявлению
    const snap = await get(ref(db, `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests`));
    const requests = snap.exists() ? snap.val() : {};

    const updates = {};

    // 2) проставляем статусы
    for (const [rid, r] of Object.entries(requests)) {
        if (rid === requestId) {
            updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${rid}/status`] = CargoRequestStatus.Accepted;
        } else if (r.status === CargoRequestStatus.Pending) {
            updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${rid}/status`] = CargoRequestStatus.Declined;
        }
        updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${rid}/updatedAt`] = nowIso();

        // синхронизируем зеркальные записи отправителей
        const driverId = r?.sender?.id;
        if (driverId) {
            const newStatus = rid === requestId ? CargoRequestStatus.Accepted : (r.status === CargoRequestStatus.Pending ? CargoRequestStatus.Declined : r.status);
            updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/status`] = newStatus;
            updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/updatedAt`] = nowIso();
        }
    }

    // 3) объявление → work
    updates[`${ROOT_CARGO_ADS}/${adId}/status`] = 'work';
    updates[`${ROOT_CARGO_ADS}/${adId}/updatedAt`] = nowIso();

    // 4) создаём Transportation (минимально)
    // TODO: приведи поля к твоей существующей структуре Transportation
    const tKey = push(ref(db, ROOT_TRANSPORTATIONS)).key;
    const acceptedReq = requests[requestId];

    updates[`${ROOT_TRANSPORTATIONS}/${tKey}`] = {
        transportationId: tKey,
        adId,
        createdAt: nowIso(),
        status: 'confirmed', // минимальный стартовый статус
        // участники:
        cargoOwner: {
            id: ownerId,
            name: ad.ownerName || '',
            photoUrl: ad.ownerPhotoUrl || '',
            contact: ad.ownerPhone || '',
        },
        carrier: {
            id: acceptedReq?.sender?.id || '',
            name: acceptedReq?.sender?.name || '',
            photoUrl: acceptedReq?.sender?.photoUrl || '',
            contact: acceptedReq?.sender?.contact || '',
        },
        // для удобства — кусок данных из объявления:
        route: {
            from: ad.locationFrom,
            to: ad.locationTo,
            date: ad.date,
            price: ad.price,
            paymentUnit: ad.paymentUnit,
        },
    };

    await update(ref(db), updates);

    return { transportationId: tKey };
}

/**
 * Отклонить конкретную заявку (владелец груза).
 */
export async function declineCargoRequest({ ownerId, adId, requestId }) {
    const reqSnap = await get(ref(db, `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}`));
    if (!reqSnap.exists()) return;

    const r = reqSnap.val();
    const updates = {};
    updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}/status`] = CargoRequestStatus.Declined;
    updates[`${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}/requests/${requestId}/updatedAt`] = nowIso();

    const driverId = r?.sender?.id;
    if (driverId) {
        updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/status`] = CargoRequestStatus.Declined;
        updates[`${ROOT_CARGO_REQUESTS_SENT}/${driverId}/${adId}/updatedAt`] = nowIso();
    }

    await update(ref(db), updates);
}

/**
 * Получить статусы отправленных водителем заявок: [{adId, status}]
 */
export async function getSentRequestsStatuses(driverId) {
    const snap = await get(ref(db, `${ROOT_CARGO_REQUESTS_SENT}/${driverId}`));
    if (!snap.exists()) return [];
    const obj = snap.val();
    return Object.keys(obj).map((adId) => ({ adId, status: obj[adId].status, requestId: obj[adId].requestId }));
}

/**
 * Получить все заявки по объявлению для владельца груза (для экрана модерации заявок по adId)
 */
export async function getAdCargoRequestsForOwner({ ownerId, adId }) {
    const base = ref(db, `${ROOT_CARGO_REQUESTS}/${ownerId}/${adId}`);
    const snap = await get(base);
    if (!snap.exists()) return { main: null, requests: [] };

    const data = snap.val();
    const requests = data.requests ? Object.values(data.requests) : [];
    return { main: data.main || null, requests };
}
