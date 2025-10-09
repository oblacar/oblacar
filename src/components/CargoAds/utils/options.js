// utils/options.js
import { PACKAGING_OPTIONS } from '../../../constants/cargoPackagingOptions';
import { cargoTypes } from '../../../constants/cagroTypes';
import { loadingTypes, truckTypesWithLoading } from '../../../constants/transportAdData';

// helper: нормализация + уникализация
const norm = (s) => String(s).trim().toLowerCase();
const ucFirst = (s) => s.length ? s[0].toUpperCase() + s.slice(1) : s;

const uniqueByValue = (arr) => {
    const map = new Map();
    for (const it of arr) {
        const key = norm(it.value);
        if (!map.has(key)) map.set(key, { ...it, value: key, label: ucFirst(it.label || it.value) });
    }
    return Array.from(map.values());
};

// ===== УПАКОВКА =====
export const PACKAGING_OPTIONS_UI = uniqueByValue(
    PACKAGING_OPTIONS.map(({ key, label }) => ({ value: key, label }))
);

// ===== ТИПЫ ГРУЗА =====
export const CARGO_TYPE_OPTIONS = uniqueByValue(
    cargoTypes.map((t) => ({ value: t, label: t }))
);

// ===== ТИПЫ ЗАГРУЗКИ (КАК загружаем: боковая/верхняя/задняя/гидроборт/аппарели/налив/без ворот …) =====
// берём из обоих источников и ЖЁСТКО дедупим (регистр/пробелы игнорим)
const fromTruck = truckTypesWithLoading.flatMap((t) => t.loadingTypes || []);
const fromPlain = (loadingTypes || []).map((x) => x.name || x); // поддержим обе формы

const loadingKindsRaw = [...fromTruck, ...fromPlain]
    .filter(Boolean)
    .map(String);

export const LOADING_KIND_OPTIONS = uniqueByValue(
    loadingKindsRaw.map((name) => ({ value: name, label: name }))
);
