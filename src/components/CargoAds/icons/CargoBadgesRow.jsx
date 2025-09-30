// src/components/CargoAds/icons/CargoBadgesRow.jsx
import React, { useMemo } from 'react';

// SVG-иконки (твои файлы)
import { ReactComponent as BigbagIcon } from '../../../assets/icons/bigbag.svg';
import { ReactComponent as PalletIcon } from '../../../assets/icons/pallet.svg';
import { ReactComponent as IBCIcon } from '../../../assets/icons/ibc.svg';
import { ReactComponent as RollIcon } from '../../../assets/icons/roll.svg';
import { ReactComponent as BagIcon } from '../../../assets/icons/bag.svg';
import { ReactComponent as BarrelIcon } from '../../../assets/icons/barrel.svg';
import { ReactComponent as PipesIcon } from '../../../assets/icons/pipes.svg';
import { ReactComponent as BaleIcon } from '../../../assets/icons/bale.svg';
import { ReactComponent as ContainerIcon } from '../../../assets/icons/container.svg';
import { ReactComponent as BuildingMaterialsIcon } from '../../../assets/icons/building_materials.svg';
import { ReactComponent as BulkgMaterialsIcon } from '../../../assets/icons/bulk_material.svg';
import { ReactComponent as EquipmentIcon } from '../../../assets/icons/equipment.svg';

// Font Awesome (только нужные)
import {
    FaCouch, FaAppleAlt, FaTshirt, FaCubes, FaFaucet, FaRadiation,
    FaLaptop, FaSnowplow, FaShapes, FaBoxOpen, FaCube,
    FaLayerGroup, FaWineGlass, FaSnowflake, FaThermometerHalf,
    FaExclamationTriangle, FaCodepen,
} from 'react-icons/fa';

import './CargoBadgesRow.css';

/**
 * Ряд иконок условий груза с группировкой.
 *
 * props:
 *  - ad: объект объявления (плоский или {ad})
 *  - maxPackaging?: number – сколько упаковок показать (по умолчанию 6)
 *  - className?: string
 */
const CargoBadgesRow = ({
    ad = {},
    maxPackaging = 6,
    className = '',
}) => {
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
        'строительные материалы': BuildingMaterialsIcon,
        'мебель': FaCouch,
        'продукты': FaAppleAlt,
        'промтовары': FaTshirt,
        'насыпной': BulkgMaterialsIcon,
        'наливной': FaFaucet,
        'adr': FaRadiation,
        'электроника': FaLaptop,
        'оборудование': EquipmentIcon,
        'прочее': FaShapes,
    };

    // Иконки упаковок (ключи = твоим PACKAGING_OPTIONS.key)
    const packagingIconMap = {
        pallet: { icon: PalletIcon, label: 'Паллеты' },
        box: { icon: FaBoxOpen, label: 'Коробки' },
        crate: { icon: FaCube, label: 'Ящики' },
        bag: { icon: BagIcon, label: 'Мешки' },
        bigbag: { icon: BigbagIcon, label: 'Биг-бэг' },
        bale: { icon: BaleIcon, label: 'Тюки' },
        drum: { icon: BarrelIcon, label: 'Бочки' },
        ibc: { icon: IBCIcon, label: 'IBC' },
        roll: { icon: RollIcon, label: 'Рулоны' },
        container: { icon: ContainerIcon, label: 'Контейнер' },
        long: { icon: PipesIcon, label: 'Длинномер' },
        loose: { icon: FaCubes, label: 'Навалом' },
        piece: { icon: FaCodepen, label: 'Штучный' },
    };

    // Группы бейджей
    const { grpType, grpPack, grpFlags, grpTemp } = useMemo(() => {
        const grpType = [];
        const grpPack = [];
        const grpFlags = [];
        const grpTemp = [];

        if (cargoType) {
            const TypeIcon = cargoTypeIconMap[cargoType] || FaBoxOpen;
            grpType.push({ key: 'cargoType', title: `Тип груза: ${cargoType}`, icon: TypeIcon });
        }

        if (packaging.length > 0) {
            const shown = packaging.slice(0, maxPackaging);
            shown.forEach((key, idx) => {
                const meta = packagingIconMap[key] || { icon: FaBoxOpen, label: key };
                grpPack.push({
                    key: `pkg_${idx}_${key}`,
                    title: `Упаковка: ${meta.label}`,
                    icon: meta.icon,
                });
            });
            const rest = packaging.length - shown.length;
            if (rest > 0) grpPack.push({ key: 'pkg_more', title: `Ещё упаковок: ${rest}`, text: `+${rest}` });
        }

        if (isFragile) grpFlags.push({ key: 'fragile', title: 'Хрупкий груз', icon: FaWineGlass });
        if (isStackable) grpFlags.push({ key: 'stackable', title: 'Штабелируемый', icon: FaLayerGroup });
        if (adrClass && String(adrClass).trim()) {
            grpFlags.push({ key: 'adr', title: `ADR класс: ${adrClass}`, icon: FaExclamationTriangle, text: String(adrClass) });
        }

        if (tempMode === 'chilled') grpTemp.push({ key: 'temp_chilled', title: 'Охлаждение', icon: FaThermometerHalf });
        if (tempMode === 'frozen') grpTemp.push({ key: 'temp_frozen', title: 'Заморозка', icon: FaSnowflake });

        return { grpType, grpPack, grpFlags, grpTemp };
    }, [cargoType, packaging, isFragile, isStackable, tempMode, adrClass, maxPackaging]);

    const renderGroup = (items, mod) =>
        items.length ? (
            <div className={`cbr__group cbr__group--${mod}`}>
                {items.map((b) => {
                    const Icon = b.icon;
                    return (
                        <span key={b.key} className="cbr__badge" title={b.title} aria-label={b.title}>
                            {Icon ? <Icon className="cbr__icon" /> : null}
                            {b.text ? <span className="cbr__text">{b.text}</span> : null}
                        </span>
                    );
                })}
            </div>
        ) : null;

    // Ничего не рисуем, если вообще пусто
    if (![grpType, grpPack, grpFlags, grpTemp].some(g => g.length)) return null;

    return (
        <div
            className={`cbr ${className}`}
        >
            {renderGroup(grpType, 'type')}
            {renderGroup(grpPack, 'pack')}
            {renderGroup(grpFlags, 'flags')}
            {renderGroup(grpTemp, 'temp')}
        </div>
    );
};

export default CargoBadgesRow;
