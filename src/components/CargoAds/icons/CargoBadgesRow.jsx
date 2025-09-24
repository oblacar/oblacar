import React, { useMemo } from 'react';
import {
    FaCouch,
    FaAppleAlt,
    FaBoxOpen,
    FaFlask,
    FaIndustry,
    FaTools,
    FaLaptop,
    FaTint,
    FaCubes,
    FaCube,
    FaShoppingBag,
    FaOilCan,
    FaSnowflake,
    FaThermometerHalf,
    FaLayerGroup,
    FaWineGlass,
    FaExclamationTriangle,
} from 'react-icons/fa';

import './CargoBadgesRow.css';

/**
 * Ряд иконок-условий груза.
 * props:
 *  - ad: объект объявления (плоский или {ad})
 *  - size?: number — размер иконок (по умолчанию 16)
 *  - gap?: number  — отступ между бейджами (по умолчанию 6)
 *  - maxPackaging?: number — сколько упаковок показывать (по умолчанию 2)
 */
const CargoBadgesRow = ({ ad = {}, size = 16, gap = 6, maxPackaging = 4 }) => {
    const data = ad?.ad ? ad.ad : ad;

    // --- вытаскиваем данные из объявления ---
    const cargoType = data.cargo?.type ?? data.cargoType ?? null;
    const packaging = Array.isArray(data.packagingTypes) ? data.packagingTypes : [];
    const isFragile = Boolean(data.isFragile ?? data.cargo?.fragile);
    const isStackable = Boolean(data.isStackable ?? data.cargo?.isStackable);

    const tempMode =
        data.temperature?.mode ??
        data.cargo?.temperature?.mode ??
        data.temperatureMode ??
        null; // 'ambient'|'chilled'|'frozen'

    const adrClass = data.adrClass ?? data.cargo?.adrClass ?? '';

    // --- словари иконок ---
    const cargoTypeIconMap = {
        'мебель': FaCouch,
        'продукты': FaAppleAlt,
        'промтовары': FaIndustry,
        'строительные материалы': FaTools,
        'наливной': FaTint,
        'насыпной': FaCubes,
        'ADR': FaFlask,
        'электроника': FaLaptop,
        'прочее': FaBoxOpen,
    };

    // ключи должны совпадать с ключами из PACKAGING_OPTIONS
    const packagingIconMap = {
        pallet: { icon: FaCubes, label: 'Паллеты' },
        box: { icon: FaBoxOpen, label: 'Коробки' },
        crate: { icon: FaCube, label: 'Ящик' },
        bag: { icon: FaShoppingBag, label: 'Мешки' },
        bigbag: { icon: FaShoppingBag, label: 'Биг-бэг' },
        drum: { icon: FaOilCan, label: 'Бочка' },
        barrel: { icon: FaOilCan, label: 'Бочка' },
        roll: { icon: FaLayerGroup, label: 'Рулоны' },
        bale: { icon: FaLayerGroup, label: 'Тюки' },
        ibc: { icon: FaFlask, label: 'IBC' },
        container: { icon: FaCube, label: 'Контейнер' },
        sack: { icon: FaShoppingBag, label: 'Мешки' },
    };

    const badges = useMemo(() => {
        const out = [];

        // тип груза
        if (cargoType) {
            const Icon = cargoTypeIconMap[cargoType?.toLowerCase?.()] || FaBoxOpen;
            out.push({
                key: 'cargoType',
                title: `Тип груза: ${cargoType}`,
                icon: Icon,
            });
        }

        // упаковка (до maxPackaging)
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
            if (rest > 0) {
                out.push({
                    key: 'pkg_more',
                    title: `Ещё упаковок: ${rest}`,
                    text: `+${rest}`,
                });
            }
        }

        // хрупкий
        if (isFragile) {
            out.push({
                key: 'fragile',
                title: 'Хрупкий груз',
                icon: FaWineGlass,
            });
        }

        // штабелируемый
        if (isStackable) {
            out.push({
                key: 'stackable',
                title: 'Штабелируемый',
                icon: FaLayerGroup,
            });
        }

        // температура
        if (tempMode === 'chilled') {
            out.push({
                key: 'temp_chilled',
                title: 'Охлаждение',
                icon: FaThermometerHalf,
            });
        } else if (tempMode === 'frozen') {
            out.push({
                key: 'temp_frozen',
                title: 'Заморозка',
                icon: FaSnowflake,
            });
        }

        // ADR (опасный груз)
        if (adrClass && String(adrClass).trim()) {
            out.push({
                key: 'adr',
                title: `ADR класс: ${adrClass}`,
                icon: FaExclamationTriangle,
                text: String(adrClass),
            });
        }

        return out;
    }, [cargoType, packaging, isFragile, isStackable, tempMode, adrClass, maxPackaging]);

    if (badges.length === 0) return null;

    return (
        <div className="cbr" style={{ gap }}>
            {badges.map((b) => {
                const Icon = b.icon;
                return (
                    <span key={b.key} className="cbr__badge" title={b.title} aria-label={b.title}>
                        {Icon ? <Icon className="cbr__icon" size={size} /> : null}
                        {b.text ? <span className="cbr__text">{b.text}</span> : null}
                    </span>
                );
            })}
        </div>
    );
};

export default CargoBadgesRow;
