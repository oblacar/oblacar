// CargoTypeFaIcon.jsx
import React from 'react';
import {
    FaBox,
    FaBoxes,
    FaCouch,
    FaAppleAlt,
    FaCubes,
    FaOilCan,
    FaRadiation,
    FaThermometerHalf,
    FaTemperatureLow,
    FaSnowflake,
    FaWeightHanging,
    FaWarehouse,
    FaBoxOpen,
    FaLayerGroup,
    FaHammer,
    FaSocks,
    FaTshirt,
    FaShapes,
    FaMugHot,
    FaHollyBerry,
    FaChair,
    FaSnowplow,
} from 'react-icons/fa';

/**
 * Карта соответствий. Ключи — в нижнем регистре.
 * Добавляй свои синонимы через новые ключи.
 */
const cargoFaMap = {
    // базовые типы
    'строительные материалы': FaHammer, //FaWarehouse,     // или FaCubes/FaBoxes — на вкус
    мебель: FaCouch,
    продукты: FaAppleAlt,
    промтовары: FaTshirt, //FaChair, //FaSocks, //FaBoxOpen,
    насыпной: FaSnowplow, //FaHollyBerry, //FaCubes,
    наливной: FaOilCan,
    adr: FaRadiation,
    прочее: FaShapes, //FaBox,

    // флаги/состояния (если захочешь показывать)
    хрупкий: FaWeightHanging, // как предупреждение (можно заменить)
    штабелируемый: FaLayerGroup,

    // температурные режимы (на случай использования)
    температура: FaThermometerHalf,
    'охлажд.': FaTemperatureLow,
    охлажденный: FaTemperatureLow,
    заморозка: FaSnowflake,
};

export function CargoTypeFaIcon({ type, size = 18, className = '', title }) {
    const key = String(type || '')
        .trim()
        .toLowerCase();
    const Icon = cargoFaMap[key] || FaBox; // надёжный фолбэк
    return (
        <Icon
            size={size}
            className={className}
            title={title || type}
        />
    );
}

export default CargoTypeFaIcon;
