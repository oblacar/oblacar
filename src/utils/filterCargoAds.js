// src/utils/filterCargoAds.js

// нормализуем любое значение в массив строк (lowercase)
function toArrayLower(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => String(v).toLowerCase());
    if (typeof val === 'object') {
        // объект-флаги { 'верхняя': true, ... }
        return Object.keys(val)
            .filter((k) => val[k])
            .map((k) => k.toLowerCase());
    }
    return [String(val).toLowerCase()];
}

// достаём массив значений по возможным путям
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
        if (ok && cur != null) {
            return toArrayLower(cur);
        }
    }
    return [];
}

// достаём одиночное строковое значение по путям
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

/**
 * filters = {
 *   cargoTypes: string[],
 *   loadTypes: string[],   // ВАЖНО: сюда пишет тулбар «Тип загрузки»
 *   packaging: string[]
 * }
 */
export function filterCargoAds(list, filters) {
    const f = {
        cargoTypes: (filters?.cargoTypes ?? [])
            .map(String)
            .map((s) => s.toLowerCase()),
        loadTypes: (filters?.loadTypes ?? [])
            .map(String)
            .map((s) => s.toLowerCase()),
        packaging: (filters?.packaging ?? [])
            .map(String)
            .map((s) => s.toLowerCase()),
    };

    // быстрый выход — если ничего не выбрано
    const noFilters =
        !f.cargoTypes.length && !f.loadTypes.length && !f.packaging.length;
    if (noFilters) return list;

    return list.filter((raw) => {
        const ad = raw?.ad ? raw.ad : raw;

        // 1) Тип груза: пытаемся вытащить из разных мест
        if (f.cargoTypes.length) {
            const cargoType = pickOne(ad, [
                'cargo.type', // { cargo: { type: ... } }
                'cargoType', // плоское поле
                'type', // вдруг так
            ]);
            if (!cargoType || !f.cargoTypes.includes(cargoType)) return false;
        }

        // 2) Тип(ы) загрузки: массив/флаги под разными ключами
        if (f.loadTypes.length) {
            const loadSet = pickArray(ad, [
                'loadingTypes', // массив строк
                'loading_types', // альтернативное имя
                'loadTypes', // ещё один возможный синоним
            ]);
            if (!intersects(loadSet, f.loadTypes)) return false;
        }

        // 3) Упаковка: может быть одно значение, массив или объект-флаги
        if (f.packaging.length) {
            const packArr = pickArray(ad, [
                'cargo.packaging', // { cargo: { packaging: [] | {} | '...' } }
                'cargo.packagingType',
                'packaging', // плоско
                'packagingType',
            ]);
            if (!intersects(packArr, f.packaging)) return false;
        }

        return true;
    });
}

export default filterCargoAds;
