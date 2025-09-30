// src/seed/AdminCargoSeeder.jsx
import React, { useMemo, useState, useEffect } from "react";
import CargoAdService from "../services/CargoAdService";
// Если позже добавишь файл с готовыми данными — этот импорт начнёт работать.
// import { CARGO_SEED_20 } from "./cargoSeedData";

const OWNERS = [
    {
        ownerId: "f5uTdFZacmRrWZAVkkyskfmYpFn1",
        ownerName: "Станислав",
        ownerPhotoUrl:
            "https://firebasestorage.googleapis.com/v0/b/oblacar-7418d.appspot.com/o/profilePhotos%2Ff5uTdFZacmRrWZAVkkyskfmYpFn1?alt=media&token=5b02b47f-8718-44f8-915e-82ce3877b782",
        ownerRating: 4.6,
    },
    {
        ownerId: "4yFCj7s6pBTNsZnRs0Ek3pNUsYb2",
        ownerName: "Иван Геннадьевич",
        ownerPhotoUrl:
            "https://firebasestorage.googleapis.com/v0/b/oblacar-7418d.appspot.com/o/profilePhotos%2F4yFCj7s6pBTNsZnRs0Ek3pNUsYb2?alt=media&token=0a89c870-0e7f-4cf2-8915-382e70bbb5ff",
        ownerRating: 4.1,
    },
    {
        ownerId: "A9lTs7ZeBsOHADGE1MGlFCKx08u1",
        ownerName: "Александр",
        ownerPhotoUrl:
            "https://firebasestorage.googleapis.com/v0/b/oblacar-7418d.appspot.com/o/profilePhotos%2FA9lTs7ZeBsOHADGE1MGlFCKx08u1?alt=media&token=07d75925-5ed9-4128-b681-49769c59de54",
        ownerRating: 4.8,
    },
];

// Ключи упаковок — синхронизированы с твоим packagingIconMap (и UI):
const PACKAGING_KEYS = [
    "pallet",
    "box",
    "crate",
    "bag",
    "bigbag",
    "bale",
    "drum",
    "ibc",
    "roll",
    "container",
    "long",
    "loose",
    "piece",
];

const CARGO_TYPES = [
    "строительные материалы",
    "мебель",
    "продукты",
    "промтовары",
    "насыпной",
    "наливной",
    "ADR",
    "электроника",
    "оборудование",
    "прочее",
];

const LOADING_TYPES = ["задняя", "боковая", "верхняя", "гидроборт", "аппарели", "без ворот"];

const CITIES = [
    "Москва",
    "Санкт-Петербург",
    "Казань",
    "Нижний Новгород",
    "Воронеж",
    "Ростов-на-Дону",
    "Екатеринбург",
    "Пермь",
    "Новосибирск",
    "Самара",
    "Уфа",
    "Тверь",
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const sample = (arr, n) => {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
        out.push(copy.splice(rand(0, copy.length - 1), 1)[0]);
    }
    return out;
};

function fmtRu(d) {
    return d.toLocaleDateString("ru-RU"); // dd.mm.yyyy
}

function addDays(base, d) {
    const dt = new Date(base);
    dt.setDate(dt.getDate() + d);
    return dt;
}

function makeOne(i) {
    const created = addDays(new Date(), -rand(0, 14)); // в пределах 2 недель назад
    const pickup = addDays(new Date(), rand(0, 5));
    const delivery = addDays(pickup, rand(1, 6));

    const owner = pick(OWNERS);
    const from = pick(CITIES);
    let to = pick(CITIES);
    if (to === from) to = pick(CITIES);

    const cargoType = pick(CARGO_TYPES);
    const packagingCount = rand(0, 2); // 0..2 типа упаковки, как ты и хотел «вряд ли больше двух»
    const packagingTypes = sample(PACKAGING_KEYS, packagingCount);

    const quantity = rand(0, 16) || ""; // иногда пусто
    const weightTons = Number((Math.random() * 19 + 0.5).toFixed(2)); // 0.5..19.5 т
    const dims = {
        height: Number((Math.random() * 1.8 + 0.2).toFixed(2)), // 0.2..2.0
        width: Number((Math.random() * 1.2 + 0.3).toFixed(2)), // 0.3..1.5
        depth: Number((Math.random() * 1.4 + 0.3).toFixed(2)), // 0.3..1.7
    };

    // Температура: чаще ambient, иногда chilled/frozen
    const tempRoll = Math.random();
    const temperature =
        tempRoll < 0.75
            ? { mode: "ambient", minC: "", maxC: "" }
            : tempRoll < 0.9
                ? { mode: "chilled", minC: "0", maxC: "5" }
                : { mode: "frozen", minC: "-20", maxC: "-10" };

    const isFragile = Math.random() < 0.25;
    const isStackable = Math.random() < 0.7;

    const adrClass = cargoType.toLowerCase() === "adr" ? String(pick([2, 3, 5, 8])) : null;

    const price =
        Math.random() < 0.7 ? rand(15000, 120000) : ""; // иногда пусто
    const paymentUnit = "руб";
    const readyToNegotiate = Math.random() < 0.5;

    const loadingTypes = sample(LOADING_TYPES, rand(1, 3));

    const titleVariants = [
        "12 паллет плитки",
        "Мебель офисная, 5 мест",
        "Промтовары на европаллетах",
        "Гофрокороба, 4 м³",
        "Оборудование — 2 места",
        "Электроника, требуется бережная погрузка",
        "Насыпной материал",
        "Наливной продукт",
        "Пачки металлопрофиля",
    ];

    const title = pick(titleVariants);

    return {
        // статус/времена
        status: "active",
        createdAt: fmtRu(created),
        updatedAt: fmtRu(created),

        // владелец
        ownerId: owner.ownerId,
        ownerName: owner.ownerName,
        ownerPhotoUrl: owner.ownerPhotoUrl,
        ownerRating: owner.ownerRating,

        // маршрут/сроки
        departureCity: from,
        destinationCity: to,
        pickupDate: fmtRu(pickup),
        deliveryDate: Math.random() < 0.85 ? fmtRu(delivery) : "",

        // бюджет
        price,
        paymentUnit,
        readyToNegotiate,

        // груз
        title,
        cargoType,
        description: "",
        photos: [],

        weightTons,
        dimensionsMeters: dims,
        quantity,
        packagingTypes, // массив ключей
        isFragile,
        isStackable,
        adrClass,
        temperature,

        // погрузка
        loadingTypes,
        needTailLift: Math.random() < 0.2,
        hasForkliftAtPickup: Math.random() < 0.6,
        hasForkliftAtDelivery: Math.random() < 0.6,
    };
}

function makeMany(n = 20) {
    return Array.from({ length: n }, (_, i) => makeOne(i));
}

const AdminCargoSeeder = ({ items }) => {
    // если когда-нибудь начнёшь импортировать готовый массив — подключится тут
    useEffect(() => {
        console.log("[Seeder] items prop:", items);
        // console.log("[Seeder] CARGO_SEED_20 import:", CARGO_SEED_20);
    }, [items]);

    const [data, setData] = useState(() =>
        Array.isArray(items) && items.length ? items : []
        // || (Array.isArray(CARGO_SEED_20) ? CARGO_SEED_20 : [])
    );

    const [busy, setBusy] = useState(false);
    const [ok, setOk] = useState(0);
    const [fail, setFail] = useState(0);
    const [log, setLog] = useState([]);

    const append = (line) =>
        setLog((prev) => [line, ...prev].slice(0, 200));

    const generate = () => {
        const arr = makeMany(20);
        setData(arr);
        append(`Сгенерировано ${arr.length} объявлений.`);
    };

    const seedAll = async () => {
        if (busy) return;
        if (!data.length) {
            append("⚠ Нет данных для загрузки: сначала сгенерируй или импортируй массив.");
            return;
        }
        setBusy(true);
        setOk(0);
        setFail(0);
        setLog([]);

        for (let i = 0; i < data.length; i++) {
            try {
                const created = await CargoAdService.create(data[i]);
                setOk((v) => v + 1);
                append(`✔ #${i + 1} создано: ${created?.adId || "(без id)"}`);
            } catch (e) {
                setFail((v) => v + 1);
                append(`✖ #${i + 1} ошибка: ${e?.message || String(e)}`);
            }
        }
        setBusy(false);
    };

    return (
        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
            <h3>Заливка тестовых объявлений (Cargo)</h3>

            <div style={{ marginBottom: 8 }}>
                <div>Подготовлено к заливке: <b>{data.length}</b></div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={generate} disabled={busy}>Сгенерировать 20</button>
                <button onClick={seedAll} disabled={busy || !data.length}>
                    {busy ? "Загружаю…" : "Загрузить объявления"}
                </button>
                <span>Успехов: <b style={{ color: "green" }}>{ok}</b></span>
                <span>Ошибок: <b style={{ color: "crimson" }}>{fail}</b></span>
            </div>

            <div style={{
                marginTop: 12, maxHeight: 240, overflow: "auto",
                fontFamily: "ui-monospace, monospace", fontSize: 12,
                background: "#fafafa", border: "1px solid #eee", padding: 8, borderRadius: 6
            }}>
                {log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
    );
};

export default AdminCargoSeeder;
