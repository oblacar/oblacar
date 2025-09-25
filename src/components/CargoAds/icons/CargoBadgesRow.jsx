import React, { useMemo } from 'react';
import {
    // типы грузов
    FaHammer,        // строительные материалы
    FaCouch,         // мебель
    FaAppleAlt,      // продукты
    FaTshirt,      // промтовары
    FaCubes,         // насыпной
    FaOilCan,          // наливной
    FaRadiation,     // ADR
    FaLaptop,        // электроника
    FaSnowplow,       // оборудование (более надёжно, чем FaWhmcs)
    FaShapes,       // прочее / fallback
    FaBoxOpen,

    // упаковки
    FaCube,          // ящик / контейнер
    FaShoppingBag,   // мешки / биг-бэг
    FaTint,        // бочки / drum
    FaLayerGroup,    // рулоны / тюки
    FaFlask,         // IBC

    // флаги
    FaWineGlass,     // fragile
    FaSnowflake,     // frozen
    FaThermometerHalf, // chilled
    FaExclamationTriangle, // ADR badge

    FaVoteYea,
} from 'react-icons/fa';

import './CargoBadgesRow.css';

/**
 * Ряд иконок условий груза.
 * props:
 *  - ad: объект объявления (плоский или {ad})
 *  - size?: number (px) — размер иконок (по умолчанию 16)
 *  - gap?: number (px)  — отступ между бейджами (по умолчанию 6)
 *  - maxPackaging?: number — сколько упаковок показать (по умолчанию 4)
 */
const CargoBadgesRow = ({ ad = {}, size = 16, gap = 6, maxPackaging = 4, className = '' }) => {
    const data = ad?.ad ? ad.ad : ad;

    const cargoType = (data.cargo?.type ?? data.cargoType ?? '').toLowerCase();
    const packaging = Array.isArray(data.packagingTypes) ? data.packagingTypes : [];
    const isFragile = Boolean(data.isFragile ?? data.cargo?.fragile);
    const isStackable = Boolean(data.isStackable ?? data.cargo?.isStackable);

    const tempMode =
        data.temperature?.mode ??
        data.cargo?.temperature?.mode ??
        data.temperatureMode ??
        null; // 'ambient'|'chilled'|'frozen'

    const adrClass = data.adrClass ?? data.cargo?.adrClass ?? '';

    // Иконки для типа груза
    const cargoTypeIconMap = {
        'строительные материалы': FaHammer,
        'мебель': FaCouch,
        'продукты': FaAppleAlt,
        'промтовары': FaTshirt,
        'насыпной': FaCubes,
        'наливной': FaOilCan,
        'adr': FaRadiation,
        'электроника': FaLaptop,
        'оборудование': FaSnowplow,
        'прочее': FaShapes,
    };

    // Иконки для упаковки (ключи должны совпадать с PACKAGING_OPTIONS.key)
    const packagingIconMap = {
        pallet: { icon: FaVoteYea, label: 'Паллеты' },
        box: { icon: FaBoxOpen, label: 'Коробки' },
        crate: { icon: FaCube, label: 'Ящик' },

        bag: { icon: FaShoppingBag, label: 'Мешки' },
        bigbag: { icon: FaShoppingBag, label: 'Биг-бэг' },
        bale: { icon: FaLayerGroup, label: 'Тюки' },

        drum: { icon: FaOilCan, label: 'Бочка' },
        ibc: { icon: FaFlask, label: 'IBC' },
        roll: { icon: FaLayerGroup, label: 'Рулоны' },

        container: { icon: FaCube, label: 'Контейнер' },

        long: { icon: FaShoppingBag, label: 'Длинномер (трубы/профиль)' },
        loose: { icon: FaShoppingBag, label: 'Навалом' },
        piece: { icon: FaShoppingBag, label: 'Штучный/без упаковки' },
    };


    //     { key: 'pallet', label: 'Паллеты' },
    //     { key: 'box', label: 'Коробки/гофрокороба' },
    //     { key: 'crate', label: 'Ящики' },

    //     { key: 'bag', label: 'Мешки' },
    //     { key: 'bigbag', label: 'Биг-бэги (МКР)' },
    //     { key: 'bale', label: 'Тюки' },

    //     { key: 'drum', label: 'Бочки' },
    //     { key: 'ibc', label: 'IBC-кубы' },

    //     { key: 'roll', label: 'Рулоны' },

    //     { key: 'long', label: 'Длинномер (трубы/профиль)' },
    //     { key: 'loose', label: 'Навалом' },
    //     { key: 'piece', label: 'Штучный/без упаковки' },

    const badges = useMemo(() => {
        const out = [];

        // Тип груза
        if (cargoType) {
            const TypeIcon = cargoTypeIconMap[cargoType] || FaBoxOpen;
            out.push({ key: 'cargoType', title: `Тип груза: ${cargoType}`, icon: TypeIcon });
        }

        // Упаковка (до maxPackaging)
        if (packaging.length > 0) {
            const shown = packaging.slice(0, maxPackaging);
            shown.forEach((key, idx) => {
                const meta = packagingIconMap[key] || { icon: FaBoxOpen, label: key };
                out.push({
                    key: `pkg_${idx}_${key}`,
                    title: `Упаковка: ${meta.label}`,
                    icon: meta.icon,
                });
            });
            const rest = packaging.length - shown.length;
            if (rest > 0) out.push({ key: 'pkg_more', title: `Ещё упаковок: ${rest}`, text: `+${rest}` });
        }

        // Флаги
        if (isFragile) out.push({ key: 'fragile', title: 'Хрупкий груз', icon: FaWineGlass });
        if (isStackable) out.push({ key: 'stackable', title: 'Штабелируемый', icon: FaLayerGroup });

        if (tempMode === 'chilled') out.push({ key: 'temp_chilled', title: 'Охлаждение', icon: FaThermometerHalf });
        if (tempMode === 'frozen') out.push({ key: 'temp_frozen', title: 'Заморозка', icon: FaSnowflake });

        if (adrClass && String(adrClass).trim()) {
            out.push({ key: 'adr', title: `ADR класс: ${adrClass}`, icon: FaExclamationTriangle, text: String(adrClass) });
        }

        return out;
    }, [cargoType, packaging, isFragile, isStackable, tempMode, adrClass, maxPackaging]);

    if (badges.length === 0) return null;

    return (
        <div
            className={`cbr ${className}`}
            style={{ gap, fontSize: size }}  // ← размер & отступы управляются пропсами
        >
            {badges.map((b) => {
                const Icon = b.icon;
                return (
                    <span key={b.key} className="cbr__badge" title={b.title} aria-label={b.title}>
                        {Icon ? <Icon className="cbr__icon" /> : null}
                        {b.text ? <span className="cbr__text">{b.text}</span> : null}
                    </span>
                );
            })}
        </div>
    );
};

export default CargoBadgesRow;
