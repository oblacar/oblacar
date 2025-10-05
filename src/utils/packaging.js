// src/utils/packaging.js
import { PACKAGING_OPTIONS } from '../constants/cargoPackagingOptions';

// Построим словарь: { value: label }
const PACKAGING_DICT = Object.fromEntries(
    PACKAGING_OPTIONS.map(o => [o.value, o.label])
);

/** Преобразует массив ключей упаковки к массиву русских подписей */
export function packagingKeysToLabels(keys) {
    if (!Array.isArray(keys)) return [];
    return keys.map(k => PACKAGING_DICT[k] ?? k);
}

/** Удобный помощник рендера «пилюль»/бейджей */
export function renderPackagingLabels(keys) {
    const labels = packagingKeysToLabels(keys);
    return labels;
}
