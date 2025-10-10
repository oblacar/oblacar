// src/utils/cargoSort.js

// ---------- ВСПОМОГАТЕЛЬНОЕ ----------

// Устойчивый (stable) sort через декорирование
function stableSort(arr, cmp) {
    return arr
        .map((item, idx) => ({ item, idx }))
        .sort((a, b) => {
            const r = cmp(a.item, b.item);
            return r || a.idx - b.idx;
        })
        .map((x) => x.item);
}

// Надёжный парсер даты в таймштамп (ms) из разных форматов
export function parseDateToTs(input) {
    if (!input && input !== 0) return null;

    // Date
    if (input instanceof Date && !Number.isNaN(input.getTime())) {
        return input.getTime();
    }

    // Number (секунды/миллисекунды)
    if (typeof input === 'number') {
        // 10 цифр — секунды, 13 — миллисекунды
        if (input < 1e12) return input * 1000;
        return input;
    }

    // Строка
    if (typeof input === 'string') {
        const s = input.trim();

        // Чистые числа в строке (10/13 цифр)
        if (/^\d{10}$/.test(s)) return Number(s) * 1000;
        if (/^\d{13}$/.test(s)) return Number(s);

        // DD.MM.YYYY (с опциональным временем)
        // Примеры: 05.09.2024 13:45, 05/09/2024, 05.09.2024
        const m1 = s.match(
            /^(\d{2})[./](\d{2})[./](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
        );
        if (m1) {
            const [, dd, mm, yyyy, HH = '00', MM = '00', SS = '00'] = m1;
            const d = new Date(
                Number(yyyy),
                Number(mm) - 1,
                Number(dd),
                Number(HH),
                Number(MM),
                Number(SS)
            );
            if (!Number.isNaN(d.getTime())) return d.getTime();
        }

        // YYYY-MM-DD (ISO или ISO-like)
        // Date.parse на такое обычно надёжен
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
            const t = Date.parse(s);
            return Number.isFinite(t) ? t : null;
        }

        // Последняя попытка — универсальный парсер
        const t = Date.parse(s);
        return Number.isFinite(t) ? t : null;
    }

    return null;
}

// Берём первое непустое значение
function firstDefined(...vals) {
    for (const v of vals) {
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
}

// ---------- ИЗВЛЕКАТОРЫ ПОЛЕЙ ----------

function getPriceNum(ad) {
    const v = ad?.price?.value ?? ad?.price;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function getFromCity(ad) {
    return String(
        ad?.route?.from ?? ad?.departureCity ?? ad?.from ?? ''
    ).trim();
}

// «Дата объявления» / публикации
function getCreatedTs(ad) {
    const raw = firstDefined(
        ad?.createdAt,
        ad?.date,
        ad?.created_date,
        ad?.created,
        ad?.postedAt
    );
    return parseDateToTs(raw);
}

// «Готовность к отправке»
function getReadyTs(ad) {
    const raw = firstDefined(
        ad?.availabilityFrom,
        ad?.pickupDate,
        ad?.dates?.pickupDate,
        ad?.readyAt,
        ad?.readinessDate,
        ad?.ready_from
    );
    return parseDateToTs(raw);
}

const collator = new Intl.Collator('ru', {
    numeric: true,
    sensitivity: 'base',
});

// ---------- ОСНОВНАЯ СОРТИРОВКА ----------

export function sortCargoAds(list, sortKey = 'price_desc') {
    const src = Array.isArray(list) ? list : [];
    if (src.length <= 1) return src;

    // Выбираем компаратор
    let cmp = () => 0;

    // Цена
    if (sortKey === 'price_asc' || sortKey === 'price_desc') {
        const dir = sortKey === 'price_desc' ? -1 : 1;
        cmp = (a, b) => {
            const ax = getPriceNum(a),
                bx = getPriceNum(b);
            if (ax == null && bx == null) return 0;
            if (ax == null) return 1; // пустые в конец
            if (bx == null) return -1;
            return dir * (ax - bx);
        };
    }

    // Алфавит (по "откуда")
    else if (sortKey === 'alpha_asc' || sortKey === 'alpha_desc') {
        const dir = sortKey === 'alpha_desc' ? -1 : 1;
        cmp = (a, b) => dir * collator.compare(getFromCity(a), getFromCity(b));
    }

    // Дата объявления (created)
    else if (sortKey === 'date_new' || sortKey === 'date_old') {
        const dir = sortKey === 'date_new' ? -1 : 1; // новые (бóльший ts) вперёд
        cmp = (a, b) => {
            const ax = getCreatedTs(a),
                bx = getCreatedTs(b);
            if (ax == null && bx == null) return 0;
            if (ax == null) return 1; // пустые в конец
            if (bx == null) return -1;
            return dir * (ax - bx);
        };
    }

    // Дата готовности (ready)
    else if (sortKey === 'ready_asc' || sortKey === 'ready_desc') {
        const dir = sortKey === 'ready_desc' ? -1 : 1; // позже → раньше (desc) = -1
        cmp = (a, b) => {
            const ax = getReadyTs(a),
                bx = getReadyTs(b);
            if (ax == null && bx == null) return 0;
            if (ax == null) return 1; // пустые в конец
            if (bx == null) return -1;
            return dir * (ax - bx);
        };
    }

    // Стабильная сортировка (фиксирует относительный порядок равных/пустых)
    return stableSort(src, cmp);
}

export default sortCargoAds;
