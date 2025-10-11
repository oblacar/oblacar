// Константы сортировки для селекта и логики

export const SORT_KEYS = {
  DATE_ASC: 'date_asc',   // Дата ↑ (ближайшие)
  DATE_DESC: 'date_desc',  // Дата ↓ (поздние)
  PRICE_ASC: 'price_asc',  // Цена ↑ (дешевле)
  PRICE_DESC: 'price_desc', // Цена ↓ (дороже)
  DEP_ASC: 'dep_asc',    // Откуда A–Я
  DEP_DESC: 'dep_desc',   // Откуда Я–A
};

export const SORT_OPTIONS = [
  { value: SORT_KEYS.DATE_ASC, label: 'Дата ↑ (ближайшие)' },
  { value: SORT_KEYS.DATE_DESC, label: 'Дата ↓ (поздние)' },
  { value: SORT_KEYS.PRICE_ASC, label: 'Цена ↑ (дешевле)' },
  { value: SORT_KEYS.PRICE_DESC, label: 'Цена ↓ (дороже)' },
  { value: SORT_KEYS.DEP_ASC, label: 'Откуда A–Я' },
  { value: SORT_KEYS.DEP_DESC, label: 'Откуда Я–A' },
];

export const DEFAULT_SORT = SORT_KEYS.DATE_ASC;

// Опции для MultiCheckDropdown.
// При необходимости поправь путь импорта transportAdData.
import { truckTypes, loadingTypes } from '../../../constants/transportAdData';

// helper: уникальный, человекочитаемый value
const toValue = (s) => String(s).trim().toLowerCase();

// Типы машины
export const TRUCK_TYPE_OPTIONS = truckTypes.map(t => ({
  label: t.name,
  value: toValue(t.name),
}));

// Типы загрузки
export const LOADING_TYPE_OPTIONS = loadingTypes.map(l => ({
  label: l.name,
  value: toValue(l.name),
}));

