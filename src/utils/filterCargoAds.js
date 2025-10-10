// src/utils/filterCargoAds.js

// ==== helpers ====

function toArrayLower(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => String(v).toLowerCase());
    if (typeof val === 'object') {
        return Object.keys(val)
            .filter((k) => val[k])
            .map((k) => k.toLowerCase());
    }
    return [String(val).toLowerCase()];
}

function pickArray(ad, paths) {
    for (const p of paths) {
        const parts = p.split('.');
        let cur = ad;
        let ok = true;
        for (const part of parts) {
            if (cur && Object.prototype.hasOwnProperty.call(cur, part)) {
                cur = cur[part];
            } else {
                ok = false;
                break;
            }
        }
        if (ok && cur != null) return toArrayLower(cur);
    }
    return [];
}

function pickOne(ad, paths) {
    for (const p of paths) {
        const parts = p.split('.');
        let cur = ad;
        let ok = true;
        for (const part of parts) {
            if (cur && Object.prototype.hasOwnProperty.call(cur, part)) {
                cur = cur[part];
            } else {
                ok = false;
                break;
            }
        }
        if (ok && cur != null) return String(cur).toLowerCase();
    }
    return '';
}

function intersects(a = [], b = []) {
    if (!a.length || !b.length) return false;
    const set = new Set(a);
    return b.some((v) => set.has(v));
}

// ==== canonical feature keys ====

function normalizeFeature(val) {
    const s = String(val).trim().toLowerCase();

    if (['adr', 'опасный', 'опасный груз'].includes(s)) return 'adr';
    if (['хрупкий', 'fragile'].includes(s)) return 'fragile';
    if (['штабелируемый', 'stackable'].includes(s)) return 'stackable';
    if (['охлаждение', 'охлажд', 'охлажденный', 'chilled', 'cool', 'cooling'].some((k) => s.includes(k))) return 'cooling';
    if (['заморозка', 'заморож', 'мороз', 'frozen', 'freeze', 'freezing'].some((k) => s.includes(k))) return 'freezing';

    if (['adr', 'fragile', 'stackable', 'cooling', 'freezing'].includes(s)) return s;
    return s;
}

// ==== feature detectors (упрощённые) ====
// Только по temperature.mode: 'chilled' -> cooling, 'frozen' -> freezing.
function featuresOf(ad) {
    const res = new Set();

    // fragile
    if (ad?.isFragile === true || ad?.fragile === true || ad?.cargo?.fragile === true) {
        res.add('fragile');
    }

    // stackable
    if (ad?.isStackable === true || ad?.stackable === true || ad?.cargo?.isStackable === true) {
        res.add('stackable');
    }

    // ADR
    const adrClassRaw = ad?.adrClass ?? ad?.adr ?? ad?.cargo?.adrClass;
    const hasAdr =
        adrClassRaw != null &&
        String(adrClassRaw).trim() !== '' &&
        String(adrClassRaw).trim() !== '0';
    if (hasAdr) res.add('adr');

    // temperature.mode ONLY
    const mode = String(ad?.temperature?.mode || ad?.cargo?.temperature?.mode || '').toLowerCase();
    if (mode.includes('frozen')) res.add('freezing');
    if (mode.includes('chill')) res.add('cooling');

    return res;
}

// ==== main filter ====

/**
 * filters = {
 *   cargoTypes: string[],
 *   loadTypes: string[],    // "Тип загрузки" из тулбара
 *   packaging: string[],
 *   features: string[],     // может приходить на русском — нормализуем
 * }
 */
export function filterCargoAds(list, filters) {
    const f = {
        cargoTypes: (filters?.cargoTypes ?? []).map((s) => String(s).toLowerCase()),
        loadTypes: (filters?.loadTypes ?? []).map((s) => String(s).toLowerCase()),
        packaging: (filters?.packaging ?? []).map((s) => String(s).toLowerCase()),
        features: (filters?.features ?? []).map(normalizeFeature),
    };

    const noFilters =
        !f.cargoTypes.length &&
        !f.loadTypes.length &&
        !f.packaging.length &&
        !f.features.length;

    if (noFilters) return list;

    return list.filter((raw) => {
        const ad = raw?.ad ? raw.ad : raw;

        // Тип груза
        if (f.cargoTypes.length) {
            const cargoType = pickOne(ad, ['cargo.type', 'cargoType', 'type']);
            if (!cargoType || !f.cargoTypes.includes(cargoType)) return false;
        }

        // Тип(ы) загрузки
        if (f.loadTypes.length) {
            const loadSet = [
                ...pickArray(ad, ['loadingTypes', 'loading_types', 'loadTypes']),
                ...pickArray(ad, ['preferredLoadingTypes']),
            ];
            if (!intersects(loadSet, f.loadTypes)) return false;
        }

        // Упаковка
        if (f.packaging.length) {
            const packSet = [
                ...pickArray(ad, ['cargo.packaging', 'cargo.packagingType', 'packaging', 'packagingType']),
                ...pickArray(ad, ['packagingTypes']),
            ];
            if (!intersects(packSet, f.packaging)) return false;
        }

        // Особенности (AND внутри группы)
        if (f.features.length) {
            const feat = featuresOf(ad);
            const ok = f.features.every((wanted) => feat.has(wanted));
            if (!ok) return false;
        }

        return true;
    });
}

export default filterCargoAds;
