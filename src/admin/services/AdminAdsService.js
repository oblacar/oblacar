// src/admin/services/AdminAdsService.js
import { ref, get, update } from 'firebase/database';
import { db } from '../../firebase';

const TRANSPORT_ROOT = 'transportAds';
const CARGO_ROOT = 'cargoAds';

async function fetchAllIfExists(path) {
    const snap = await get(ref(db, path));
    if (!snap.exists()) return [];
    const obj = snap.val();
    return Object.keys(obj).map((id) => ({ id, ...obj[id], _root: path }));
}

function fmtDate(d) {
    if (!d && d !== 0) return '-';
    // число или строка-число -> миллисекунды
    if (typeof d === 'number' || (typeof d === 'string' && /^\d+$/.test(d))) {
        const ms = Number(d);
        if (!Number.isNaN(ms)) {
            const dt = new Date(ms);
            // dd.mm.yyyy
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const yyyy = dt.getFullYear();
            return `${dd}.${mm}.${yyyy}`;
        }
    }
    // ISO-строка или что-то ещё — попробуем распарсить
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
    // у транспорта города лежат в корне
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
        // считаем "Дата" = дата создания; если хочешь другую — подскажи поле
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
    return rows.filter((r) => keys.some((k) => String(r[k] ?? '').toLowerCase().includes(s)));
}
function filterStatus(rows, status) {
    if (!status) return rows;
    return rows.filter((r) => r.status === status);
}

export const AdminAdsService = {
    async list(filters = {}) {
        const { q = '', status = '' } = filters;

        const [t, c] = await Promise.all([
            fetchAllIfExists(TRANSPORT_ROOT).catch(() => []),
            fetchAllIfExists(CARGO_ROOT).catch(() => []),
        ]);

        // если у записи нет своего id-поля, используем ключ узла (он уже в .id после мапа выше)
        let rows = [
            ...t.map((x) => ({ ...x, id: x.id ?? x.key })).map(toRowTransport),
            ...c.map((x) => ({ ...x, id: x.id ?? x.key })).map(toRowCargo),
        ];

        rows = filterText(rows, q);
        rows = filterStatus(rows, status);
        return rows;
    },

    async hide(items /* [{id,_root}] */) {
        if (!items?.length) return;
        const updates = {};
        items.forEach(({ id, _root }) => { updates[`${_root}/${id}/status`] = 'hidden'; });
        await update(ref(db), updates);
    },

    async softDelete(items) {
        if (!items?.length) return;
        const updates = {};
        items.forEach(({ id, _root }) => { updates[`${_root}/${id}/status`] = 'deleted'; });
        await update(ref(db), updates);
    },

    async restore(items) {
        if (!items?.length) return;
        const updates = {};
        items.forEach(({ id, _root }) => { updates[`${_root}/${id}/status`] = 'active'; });
        await update(ref(db), updates);
    },
};
