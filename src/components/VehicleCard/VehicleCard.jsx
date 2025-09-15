import React from 'react';

import './VehicleCard.css';

// Карточка транспорта:
// слева — галерея (главное фото + вертикальные превью),
// справа — характеристики.

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

    const photos = getAllPhotos(truckPhotoUrls);
    const mainPhoto = photos[0] || null;
    const thumbs = photos.slice(1, 8); // покажем до 7 превью для примера
    const loadingList = normalizeLoadingTypes(loadingTypes);

    return (
        <div className={`vehicle-card-full ${className}`}>
            {/* Левая колонка: галерея */}
            <div className='vehicle-gallery'>
                {/* Вертикальные превью (пока без кликов) */}
                <div className='vehicle-gallery-thumbs'>
                    {thumbs.length ? (
                        thumbs.map((url, i) => (
                            <div
                                className='vehicle-thumb'
                                key={`${url}-${i}`}
                            >
                                <img
                                    src={url}
                                    alt=''
                                />
                            </div>
                        ))
                    ) : (
                        <div className='vehicle-thumb vehicle-thumb--placeholder'>
                            —
                        </div>
                    )}
                </div>

                {/* Главное фото */}
                <div className='vehicle-gallery-main'>
                    {mainPhoto ? (
                        <img
                            src={mainPhoto}
                            alt={truckName || 'Фото машины'}
                        />
                    ) : (
                        <div className='vehicle-card-photo--placeholder'>
                            Фото
                        </div>
                    )}
                </div>
            </div>

            {/* Правая колонка: описание */}
            <div className='vehicle-card-right'>
                <h3 className='vehicle-card-title'>
                    {truckName || 'Без названия'}
                </h3>

                <div className='vehicle-card-row'>
                    <span className='vehicle-card-label'>Тип: </span>
                    <span>{transportType || '—'}</span>
                </div>

                <div className='vehicle-card-row'>
                    <span className='vehicle-card-label'>Загрузка: </span>
                    <span className='vehicle-card-tags'>
                        {loadingList.length
                            ? loadingList.map((t) => (
                                  <span
                                      key={t}
                                      className='vehicle-card-tag'
                                  >
                                      {t}
                                  </span>
                              ))
                            : '—'}
                    </span>
                </div>

                <div className='vehicle-card-row'>
                    <span className='vehicle-card-label'>Вес (т): </span>
                    <span>{fmtNum(truckWeight)}</span>
                </div>

                <div className='vehicle-card-row'>
                    <span className='vehicle-card-label'>Габариты (м): </span>
                    <span>{fmtDims(truckHeight, truckWidth, truckDepth)}</span>
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;

/* ===== утилиты ===== */
function getAllPhotos(urls) {
    if (!urls) return [];
    if (Array.isArray(urls)) return urls.filter(Boolean);
    if (typeof urls === 'object') {
        return Object.entries(urls)
            .sort((a, b) =>
                String(a[0]).localeCompare(String(b[0]), undefined, {
                    numeric: true,
                })
            )
            .map(([, url]) => url)
            .filter(Boolean);
    }
    return [];
}

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
    const hasAny =
        Number.isFinite(H) || Number.isFinite(W) || Number.isFinite(D);
    if (!hasAny) return '—';
    const s = (x) =>
        Number.isFinite(Number(x))
            ? String(Math.round(Number(x) * 100) / 100).replace(/\.00?$/, '')
            : '—';
    return `${s(H)}×${s(W)}×${s(D)}`;
}
