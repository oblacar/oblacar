import React from 'react';
import './VehicleCard.css';
import VerticalPhotoCarousel from './../common/VerticalPhotoCarousel/VerticalPhotoCarousel';

// Карточка транспорта: слева — галерея (карусель), справа — характеристики.
const VehicleCard = ({ vehicle = {}, className = '' }) => {
    const {
        truckName,
        transportType,
        loadingTypes,
        truckWeight,
        truckHeight,
        truckWidth,
        truckDepth,
        truckPhotoUrls,
    } = vehicle;

    const loadingList = normalizeLoadingTypes(loadingTypes);

    return (
        <div className={`vehicle-card-full ${className}`}>
            {/* Левая колонка: вертикальная карусель фото */}
            <div className="vehicle-gallery">
                <VerticalPhotoCarousel
                    photos={truckPhotoUrls}  // можно массив или объект {ph1: url, ph2: url}
                    mainWidth={480}
                    mainHeight={360}
                    stripWidth={84}
                    gap={10}
                />
            </div>

            {/* Правая колонка: описание */}
            <div className="vehicle-card-right">
                <h3 className="vehicle-card-title">
                    {truckName || 'Без названия'}
                </h3>

                <div className="vehicle-card-row">
                    <span className="vehicle-card-label">Тип: </span>
                    <span>{transportType || '—'}</span>
                </div>

                <div className="vehicle-card-row">
                    <span className="vehicle-card-label">Загрузка: </span>
                    <span className="vehicle-card-tags">
                        {loadingList.length
                            ? loadingList.map((t) => (
                                  <span key={t} className="vehicle-card-tag">
                                      {t}
                                  </span>
                              ))
                            : '—'}
                    </span>
                </div>

                <div className="vehicle-card-row">
                    <span className="vehicle-card-label">Вес (т): </span>
                    <span>{fmtNum(truckWeight)}</span>
                </div>

                <div className="vehicle-card-row">
                    <span className="vehicle-card-label">Габариты (м): </span>
                    <span>{fmtDims(truckHeight, truckWidth, truckDepth)}</span>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;

/* ===== утилиты ===== */
function normalizeLoadingTypes(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object') {
        return Object.keys(val).filter((k) => !!val[k]);
    }
    return [];
}

function fmtNum(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return '—';
    return String(Math.round(num * 100) / 100).replace(/\.00?$/, '');
}

function fmtDims(h, w, d) {
    const H = Number(h);
    const W = Number(w);
    const D = Number(d);
    const hasAny = Number.isFinite(H) || Number.isFinite(W) || Number.isFinite(D);
    if (!hasAny) return '—';
    const s = (x) =>
        Number.isFinite(Number(x))
            ? String(Math.round(Number(x) * 100) / 100).replace(/\.00?$/, '')
            : '—';
    return `${s(H)}×${s(W)}×${s(D)}`;
}
