// src/admin/services/AdminAdsService.js
import {
    ref,
    get,
    update,
    query,
    orderByChild,
    equalTo,
} from 'firebase/database';
import { db } from '../../firebase';

const TRANSPORT_ROOT = 'transportAds';
const CARGO_ROOT = 'cargoAds';

async function fetchAllIfExists(path) {
    const snap = await get(ref(db, path));
    if (!snap.exists()) return [];
    const obj = snap.val();
    return Object.keys(obj).map((key) => ({
        ...obj[key],
        id: key,
        _root: path,
    }));
}

function fmtDate(d) {
    if (!d && d !== 0) return '-';
    if (typeof d === 'number' || (typeof d === 'string' && /^\d+$/.test(d))) {
        const ms = Number(d);
        if (!Number.isNaN(ms)) {
            const dt = new Date(ms);
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const yyyy = dt.getFullYear();
            return `${dd}.${mm}.${yyyy}`;
        }
    }
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) {
        const dd = String(dt.getDate()).padStart(2, '0');
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const yyyy = dt.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    }
    return String(d);
}

function routeCargo(route) {
    if (!route) return '-';
    const from = route.from || route.locationFrom || '-';
    const to = route.to || route.locationTo || '-';
    return `${from} → ${to}`;
}

function routeTransport(x) {
    const from = x.departureCity || x.route?.from || '-';
    const to = x.destinationCity || x.route?.to || '-';
    return `${from} → ${to}`;
}

function toRowCargo(x) {
    return {
        id: x.id,
        type: 'cargo',
        owner: x.ownerName || x.owner?.name || x.ownerId || '-',
        route: routeCargo(x.route),
        date: fmtDate(x.createdAt || x.date),
        status: x.status || 'active',
        _root: CARGO_ROOT,
    };
}
function toRowTransport(x) {
    return {
        id: x.id,
        type: 'transport',
        owner: x.ownerName || x.owner?.name || x.ownerId || '-',
        route: routeTransport(x),
        date: fmtDate(x.createdAt || x.date),
        status: x.status || 'active',
        _root: TRANSPORT_ROOT,
    };
}

function filterText(rows, q) {
    if (!q) return rows;
    const s = q.toLowerCase();
    const keys = ['id', 'type', 'owner', 'route', 'date', 'status'];
    return rows.filter((r) =>
        keys.some((k) =>
            String(r[k] ?? '')
                .toLowerCase()
                .includes(s)
        )
    );
}
function filterStatus(rows, status) {
    if (!status) return rows;
    return rows.filter((r) => r.status === status);
}
function filterType(rows, type) {
    if (!type || type === 'all') return rows;
    return rows.filter((r) => r.type === type);
}

export const AdminAdsService = {
    async list(filters = {}) {
        const { q = '', status = '', type = 'all' } = filters;
        const [t, c] = await Promise.all([
            fetchAllIfExists(TRANSPORT_ROOT).catch(() => []),
            fetchAllIfExists(CARGO_ROOT).catch(() => []),
        ]);
        let rows = [...t.map(toRowTransport), ...c.map(toRowCargo)];
        rows = filterType(rows, type);
        rows = filterStatus(rows, status);
        rows = filterText(rows, q);
        return rows;
    },

    async hide(items) {
        if (!items?.length) return;
        const updates = {};
        items.forEach(({ id, _root }) => {
            updates[`${_root}/${id}/status`] = 'hidden';
        });
        await update(ref(db), updates);
    },

    async softDelete(items) {
        if (!items?.length) return;
        const updates = {};
        items.forEach(({ id, _root }) => {
            updates[`${_root}/${id}/status`] = 'deleted';
        });
        await update(ref(db), updates);
    },

    async restore(items) {
        if (!items?.length) return;
        const updates = {};
        items.forEach(({ id, _root }) => {
            updates[`${_root}/${id}/status`] = 'active';
        });
        await update(ref(db), updates);
    },

    // БЫЛО: простое удаление. Оставляю на всякий случай.
    async hardDelete(items) {
        if (!items?.length) return;
        const updates = {};
        items.forEach(({ id, _root }) => {
            updates[`${_root}/${id}`] = null;
        });
        await update(ref(db), updates);
    },

    // НОВОЕ: каскадное удаление со связанными ветками
    async hardDeleteCascade(items /* [{id,_root}] */) {
        if (!items?.length) return;

        // общий мультипатч
        const updates = {};

        // локальные помощники
        const delPath = (p) => {
            updates[p] = null;
        };

        // 1) сразу пометим к удалению сами объявления
        for (const { id, _root } of items) {
            delPath(`${_root}/${id}`);

            // 2) каскад для cargo: заявки владельцу + зеркала драйверов
            if (_root === CARGO_ROOT) {
                // cargoRequests/{ownerId}/{adId}
                try {
                    const crSnap = await get(ref(db, 'cargoRequests'));
                    if (crSnap.exists()) {
                        const cr = crSnap.val();
                        for (const ownerId of Object.keys(cr)) {
                            if (cr[ownerId] && cr[ownerId][id]) {
                                delPath(`cargoRequests/${ownerId}/${id}`);
                            }
                        }
                    }
                } catch {}

                // cargoRequestsSent/{driverId}/{adId}
                try {
                    const crsSnap = await get(ref(db, 'cargoRequestsSent'));
                    if (crsSnap.exists()) {
                        const crs = crsSnap.val();
                        for (const driverId of Object.keys(crs)) {
                            if (crs[driverId] && crs[driverId][id]) {
                                delPath(`cargoRequestsSent/${driverId}/${id}`);
                            }
                        }
                    }
                } catch {}
            }

            // 3) общие разговоры по объявлению: conversations + messages
            try {
                const convSnap = await get(ref(db, 'conversations'));
                if (convSnap.exists()) {
                    const convs = convSnap.val();
                    for (const convId of Object.keys(convs)) {
                        const conv = convs[convId];
                        if (conv?.adId === id) {
                            // удалить сам convo
                            delPath(`conversations/${convId}`);
                            // удалить все сообщения этого convo (по индексу conversationId)
                            try {
                                const qMsgs = query(
                                    ref(db, 'messages'),
                                    orderByChild('conversationId'),
                                    equalTo(convId)
                                );
                                const msgSnap = await get(qMsgs);
                                if (msgSnap.exists()) {
                                    const msgs = msgSnap.val();
                                    for (const mId of Object.keys(msgs)) {
                                        delPath(`messages/${mId}`);
                                    }
                                }
                            } catch {}
                        }
                    }
                }
            } catch {}

            // 4) TODO: если потребуется, подчистим и эти ветки (по полю adId):
            // - transportationRequests
            // - transportationRequestsSent
            // - transportations
            // Логика аналогичная: пройтись по корню и удалить узлы, где adId === id.
        }

        // одним выстрелом — всё
        await update(ref(db), updates);
    },
};
