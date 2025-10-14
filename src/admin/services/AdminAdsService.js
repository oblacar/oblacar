// src/admin/services/AdminAdsService.js
import { ref, get, update } from 'firebase/database';
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

    async hide(items /* [{id,_root}] */) {
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

    // ⚠️ Настоящее удаление из БД (безвозвратно)
    async hardDelete(items) {
        if (!items?.length) return;
        const updates = {};
        items.forEach(({ id, _root }) => {
            updates[`${_root}/${id}`] = null; // null в update => удаление узла
        });
        await update(ref(db), updates);
    },
};
