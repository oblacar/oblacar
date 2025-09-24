import React, { useMemo } from 'react';
import {
    // тип груза
    FaCouch,
    FaAppleAlt,
    FaBoxes,
    FaCubes,
    FaOilCan,
    FaRadiation,
    FaBoxOpen,
    // упаковка
    FaLayerGroup,
    FaBox,
    FaShoppingBag,
    FaTape,
    FaToiletPaper,
    FaCube,
    // свойства
    FaWineGlass,
    FaSnowflake,
    FaThermometerHalf,
} from 'react-icons/fa';
import './CargoBadgesRow.css';

/**
 * Ряд иконок, описывающих условия груза.
 * Пропсы:
 * - ad: объект объявления (плоский или { ad })
 * - size?: число (px) — размер иконок, по умолчанию 16
 * - gap?: число (px) — расстояние между бейджами, по умолчанию 6
 * - className?: string — доп. классы на корне
 */
const CargoBadgesRow = ({ ad = {}, size = 16, gap = 6, className = '' }) => {
    const data = ad?.ad ? ad.ad : ad;

    // извлекаем поля в едином формате
    const cargoType = (data.cargo?.type ?? data.cargoType ?? '')
        .toString()
        .trim()
        .toLowerCase();

    const packagingRaw =
        data.packagingTypes ??
        data.packagingType ??
        data.cargo?.packagingTypes ??
        data.cargo?.packagingType ??
        [];
    const packaging = Array.isArray(packagingRaw)
        ? packagingRaw
        : String(packagingRaw)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);

    const fragile = Boolean(
        data.cargo?.fragile ?? data.isFragile ?? data.fragile
    );
    const stackable = Boolean(
        data.isStackable ?? data.stackable ?? data.cargo?.stackable
    );

    const tempModeRaw =
        data.temperature?.mode ??
        data.cargo?.temperature?.mode ??
        data.temperatureMode ??
        '';
    const tempMode = String(tempModeRaw).toLowerCase();

    // маппинг для типа груза
    const cargoTypeIcon = useMemo(() => {
        const map = {
            'строительные материалы': {
                Icon: FaCubes,
                title: 'Строительные материалы',
            },
            мебель: { Icon: FaCouch, title: 'Мебель' },
            продукты: { Icon: FaAppleAlt, title: 'Продукты' },
            промтовары: { Icon: FaBoxes, title: 'Промтовары' },
            насыпной: { Icon: FaCubes, title: 'Насыпной' },
            наливной: { Icon: FaOilCan, title: 'Наливной' },
            adr: { Icon: FaRadiation, title: 'Опасный груз (ADR)' },
            прочее: { Icon: FaBoxOpen, title: 'Прочее' },
        };
        // ищем по ключу или оставляем «прочее», если тип не узнали
        return (
            map[cargoType] ??
            (cargoType ? { Icon: FaBoxOpen, title: cargoType } : null)
        );
    }, [cargoType]);

    // маппинг для упаковки
    const packagingIcons = useMemo(() => {
        const map = {
            паллеты: { Icon: FaLayerGroup, title: 'Паллеты' },
            паллет: { Icon: FaLayerGroup, title: 'Паллеты' },
            коробки: { Icon: FaBoxes, title: 'Коробки' },
            ящики: { Icon: FaBox, title: 'Ящики' },
            мешки: { Icon: FaShoppingBag, title: 'Мешки' },
            'биг-бэг': { Icon: FaShoppingBag, title: 'Биг-бэг' },
            'big-bag': { Icon: FaShoppingBag, title: 'Big-bag' },
            бочки: { Icon: FaOilCan, title: 'Бочки' },
            рулоны: { Icon: FaToiletPaper, title: 'Рулоны' }, // можно заменить на FaTape
            рулон: { Icon: FaToiletPaper, title: 'Рулоны' },
            лента: { Icon: FaTape, title: 'Лента/рулоны' },
            контейнер: { Icon: FaBoxOpen, title: 'Контейнер' },
            'без упаковки': { Icon: FaCube, title: 'Без упаковки' },
        };

        // уберём дубли, нормализуем в нижний регистр
        const seen = new Set();
        const list = [];
        for (const p of packaging) {
            const key = String(p).toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            const entry = map[key];
            if (entry) list.push(entry);
        }
        return list;
    }, [packaging]);

    // температурный режим
    const temperatureIcon = useMemo(() => {
        if (!tempMode) return null;
        if (
            tempMode === 'ambient' ||
            tempMode === 'обычная' ||
            tempMode === 'комнатная'
        ) {
            return { Icon: FaThermometerHalf, title: 'Обычная температура' };
        }
        if (
            tempMode === 'chilled' ||
            tempMode === 'охлажд.' ||
            tempMode === 'охлаждение'
        ) {
            return { Icon: FaSnowflake, title: 'Охлаждение' };
        }
        if (tempMode === 'frozen' || tempMode === 'заморозка') {
            return { Icon: FaSnowflake, title: 'Заморозка' };
        }
        // что-то своё — показываем термометр с подписью
        return { Icon: FaThermometerHalf, title: tempMode };
    }, [tempMode]);

    // собираем очередь значков
    const badges = [];

    if (cargoTypeIcon) badges.push(cargoTypeIcon);
    if (packagingIcons.length) badges.push(...packagingIcons);
    if (fragile) badges.push({ Icon: FaWineGlass, title: 'Хрупкий груз' });
    if (stackable) badges.push({ Icon: FaLayerGroup, title: 'Штабелируемый' });
    if (temperatureIcon) badges.push(temperatureIcon);

    if (badges.length === 0) return null;

    return (
        <div
            className={`cargo-badges ${className}`}
            style={{ gap: `${gap}px` }}
        >
            {badges.map(({ Icon, title }, i) => (
                <div
                    className='cargo-badge'
                    key={`${title}-${i}`}
                    title={title}
                    aria-label={title}
                >
                    <Icon style={{ width: size, height: size }} />
                </div>
            ))}
        </div>
    );
};

export default CargoBadgesRow;
