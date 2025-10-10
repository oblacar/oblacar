// src/utils/debugCargo.js
function toArr(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'object') return Object.keys(v).filter(k => v[k]);
    return [v];
}
const lc = (s) => String(s ?? '').toLowerCase();

function collectText(ad) {
    const a = ad?.ad ? ad.ad : ad;
    const bag = [];
    const push = (v) => {
        if (v == null) return;
        if (Array.isArray(v)) v.forEach(push);
        else if (typeof v === 'object') Object.values(v).forEach(push);
        else bag.push(String(v));
    };
    push(a?.title); push(a?.description); push(a?.tags);
    push(a?.cargo?.type); push(a?.cargo?.tags); push(a?.cargo?.packaging);
    return lc(bag.join(' '));
}

function pick(a, paths) {
    for (const p of paths) {
        const parts = p.split('.');
        let cur = a;
        let ok = true;
        for (const part of parts) {
            if (cur && Object.prototype.hasOwnProperty.call(cur, part)) cur = cur[part];
            else { ok = false; break; }
        }
        if (ok && cur != null) return cur;
    }
    return undefined;
}

export function debugCargoData(list, limit = 20) {
    const res = {
        size: list.length,
        sample: [],
        stats: {
            loadingTypes: new Map(),
            packaging: new Map(),
            features: { adr: 0, fragile: 0, stackable: 0, cooling: 0, freezing: 0 },
        },
    };

    const seen = new Set();
    const inc = (map, key) => map.set(key, (map.get(key) || 0) + 1);

    for (const raw of list) {
        const ad = raw?.ad ? raw.ad : raw;
        // ----- loadingTypes: попробуем разные места -----
        const ltRaw =
            pick(ad, ['loadingTypes', 'loading_types', 'loadTypes', 'cargo.loadingTypes', 'cargo.loading_types']) ??
            [];
        const lts = toArr(ltRaw).map(lc);
        lts.forEach(v => inc(res.stats.loadingTypes, v || '(empty)'));

        // ----- packaging: базовые места -----
        const packRaw = pick(ad, ['cargo.packaging', 'cargo.packagingType', 'packaging', 'packagingType']) ?? [];
        const packs = toArr(packRaw).map(lc);
        packs.forEach(v => inc(res.stats.packaging, v || '(empty)'));

        // ----- features: попробуем типичные поля + эвристики -----
        const text = collectText(ad);
        const adr = !!(ad.adr || ad.isADR || ad.dangerous || ad.cargo?.dangerous || /(^|\W)adr(\W|$)/i.test(text) || /опасн/i.test(text));
        const fragile = !!(ad.fragile || ad.cargo?.fragile || /хруп/i.test(text));
        const stackable = !!(ad.isStackable || ad.cargo?.isStackable || /штаб/i.test(text) || /stackable/i.test(text));

        const mode = lc(ad?.temperature?.mode ?? ad?.cargo?.temperature?.mode ?? ad?.temperatureMode ?? '');
        const tMin = ad?.temperature?.min ?? ad?.cargo?.temperature?.min;
        const tMax = ad?.temperature?.max ?? ad?.cargo?.temperature?.max;
        const cooling = mode === 'cool' || /охлажд/i.test(text) || (Number.isFinite(+tMax) && +tMax > 0 && +tMax <= 12);
        const freezing = mode === 'freeze' || /замороз/i.test(text) || (Number.isFinite(+tMax) && +tMax <= 0);

        if (adr) res.stats.features.adr++;
        if (fragile) res.stats.features.fragile++;
        if (stackable) res.stats.features.stackable++;
        if (cooling) res.stats.features.cooling++;
        if (freezing) res.stats.features.freezing++;

        if (res.sample.length < limit) {
            const key = ad.adId ?? ad.id ?? JSON.stringify([ad.from || ad.departureCity, ad.to || ad.destinationCity, ad.createdAt]);
            if (!seen.has(key)) {
                seen.add(key);
                res.sample.push({
                    id: key,
                    loadingTypes: lts,
                    packaging: packs,
                    flags: { adr, fragile, stackable, cooling, freezing },
                    title: ad.title ?? '',
                });
            }
        }
    }

    // Превратим Map в массивы для удобства чтения
    res.stats.loadingTypes = Array.from(res.stats.loadingTypes.entries()).sort((a, b) => b[1] - a[1]);
    res.stats.packaging = Array.from(res.stats.packaging.entries()).sort((a, b) => b[1] - a[1]);

    return res;
}
