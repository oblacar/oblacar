// Универсальная сортировка списка транспортных объявлений.
// Поддерживает как "расширенные" элементы { ad, isInReviewAds }, так и "plain" объекты ad.
// Не мутирует входной массив.

import { SORT_KEYS } from '../components/TransportAds/utils/options';

/** Приводим элемент к форме {ad, isInReviewAds} */
const toExtended = (item) => {
    if (!item) return null;
    if (item.ad) return item;
    return { ad: item, isInReviewAds: false };
};

/** Парсер даты "ДД.ММ.ГГГГ" -> Date */
const parseDDMMYYYY = (s) => {
    if (!s) return null;
    const m = String(s).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!m) return new Date(s); // fallback на стандартный парсер
    const [, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

/** Компараторы по ключам */
const comparators = {
    [SORT_KEYS.DATE_ASC]: (A, B) => {
        const dA = parseDDMMYYYY(A.availabilityDate)?.getTime?.() ?? 0;
        const dB = parseDDMMYYYY(B.availabilityDate)?.getTime?.() ?? 0;
        return dA - dB;
    },
    [SORT_KEYS.DATE_DESC]: (A, B) => {
        const dA = parseDDMMYYYY(A.availabilityDate)?.getTime?.() ?? 0;
        const dB = parseDDMMYYYY(B.availabilityDate)?.getTime?.() ?? 0;
        return dB - dA;
    },
    [SORT_KEYS.PRICE_ASC]: (A, B) => (Number(A.price) || 0) - (Number(B.price) || 0),
    [SORT_KEYS.PRICE_DESC]: (A, B) => (Number(B.price) || 0) - (Number(A.price) || 0),
    [SORT_KEYS.DEP_ASC]: (A, B) =>
        String(A.departureCity || '').localeCompare(String(B.departureCity || ''), 'ru', { sensitivity: 'base' }),
    [SORT_KEYS.DEP_DESC]: (A, B) =>
        String(B.departureCity || '').localeCompare(String(A.departureCity || ''), 'ru', { sensitivity: 'base' }),
};

/**
 * Отсортировать массив объявлений.
 * @param {Array<Object>} items - массив элементов (plain или extended)
 * @param {string} sortKey - одно из SORT_KEYS
 * @returns {Array<Object>} новый массив в той же форме, что и входной
 */
export function sortTransportAds(items = [], sortKey) {
    const cmp = comparators[sortKey];
    if (!cmp) return [...items];

    // сортируем в extended-виде, затем возвращаем к исходной форме
    const extended = items.map(toExtended).filter(Boolean);
    const sortedExtended = [...extended].sort((a, b) => cmp(a.ad || {}, b.ad || {}));

    // если вход был plain, вернём plain, иначе extended
    const wasPlain = items.length > 0 && !items[0]?.ad;
    return wasPlain ? sortedExtended.map((x) => x.ad) : sortedExtended;
}

/** Экспортируем мапу компараторов (вдруг понадобится точечный вызов) */
export const SORTERS = comparators;
