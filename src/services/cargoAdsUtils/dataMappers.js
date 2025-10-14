// src/utils/dataMappers.js

/** Генерация случайного ID (например, для фоток) */
// export function genId() {
//     return (
//         globalThis.crypto?.randomUUID?.() ??
//         `p_${Math.random().toString(36).slice(2)}`
//     );
// }
// src/utils/dataMappers.js

export function genId() {
    // Получение времени в base 36
    const timestamp = Date.now().toString(36);

    // Получение случайной части в base 36 (обрезаем '0.')
    const randomPart = Math.random().toString(36).slice(2);

    //В начале id поставим префикс "p" для демонстрации, что так можно делать.
    // теоретичеки можно передавать префикс через пропсы и таким образом маркировать id, например, для фото или груза
    return `p_${timestamp}_${randomPart}`;
}

// ===================== Преобразование Map/Array =====================

/** array -> map { key: true } */
export function arrToMap(arr) {
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((k) => {
        if (k != null && k !== '') map[String(k)] = true;
    });
    return map;
}

/** map { key: true } -> array ['key', ...] */
export function mapToArr(obj) {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj).filter((k) => !!obj[k]);
}

// ===================== Преобразование Photos =====================

/** photos: Array<{id,url|src}> -> Map { id: {url} } */
export function photosArrToMap(arr) {
    const out = {};
    (Array.isArray(arr) ? arr : []).forEach((p) => {
        // Используем genId, чтобы гарантировать уникальный ID, если он отсутствует
        const id = p?.id || genId();
        const url = p?.url || p?.src || '';
        if (url) out[id] = { url };
    });
    return out;
}

/** photos: Map { id: {url} } -> Array<{id,url}> */
export function photosMapToArr(obj) {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj)
        .map((id) => {
            const url = obj[id]?.url || '';
            return url ? { id, url } : null;
        })
        .filter(Boolean);
}

/** Универсально достаём список URL из любого формата photos (Array или Map) */
export function extractPhotoUrls(any) {
    if (!any) return [];
    if (Array.isArray(any)) {
        // [{id,url}] | [{id,src}] | ["https://..."]
        return any
            .map((p) => (typeof p === 'string' ? p : p?.url || p?.src || ''))
            .filter(Boolean);
    }
    if (typeof any === 'object') {
        // map { id: {url} }
        return Object.values(any)
            .map((v) => v?.url || '')
            .filter(Boolean);
    }
    return [];
}
