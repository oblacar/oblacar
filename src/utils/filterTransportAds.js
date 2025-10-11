// Фильтрация объявлений по типу машины и типам загрузки.
// Поддерживает plain и extended элементы ({ ad, isInReviewAds }).

const toExtended = (item) => {
    if (!item) return null;
    if (item.ad) return item;
    return { ad: item, isInReviewAds: false };
};

const norm = (s) => String(s || '').trim().toLowerCase();

/**
 * filters: {
 *   truckTypes: string[],    // values из TRUCK_TYPE_OPTIONS (нормализованные)
 *   loadingTypes: string[],  // values из LOADING_TYPE_OPTIONS (нормализованные)
 * }
 */
export function filterTransportAds(items = [], filters = {}) {
    const { truckTypes = [], loadingTypes = [] } = filters;

    const needTruck = Array.isArray(truckTypes) && truckTypes.length > 0;
    const needLoading = Array.isArray(loadingTypes) && loadingTypes.length > 0;

    if (!needTruck && !needLoading) return items; // ничего не выбирали — ничего не фильтруем

    const extended = items.map(toExtended).filter(Boolean);

    const filtered = extended.filter(({ ad }) => {
        const A = ad || {};

        // тип машины
        const typeOk = !needTruck
            ? true
            : truckTypes.includes(norm(A.transportType));

        // типы загрузки (в объявлении обычно массив строк)
        const loadingArr = Array.isArray(A.loadingTypes) ? A.loadingTypes : [];
        const loadingOk = !needLoading
            ? true
            : loadingArr.some(t => loadingTypes.includes(norm(t)));

        return typeOk && loadingOk;
    });

    // сохраняем форму входных данных (plain/extended)
    const wasPlain = items.length > 0 && !items[0]?.ad;
    return wasPlain ? filtered.map(x => x.ad) : filtered;
}
