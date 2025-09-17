import React from 'react';
import './VehicleCard.css';
import VerticalPhotoCarousel from './../common/VerticalPhotoCarousel/VerticalPhotoCarousel';

// кнопка и иконка
import Button from '../common/Button/Button';
import { FaWarehouse } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import { FaSave } from 'react-icons/fa';

// Карточка транспорта: слева — галерея (карусель), справа — характеристики.
const VehicleCard = ({
    vehicle = {},
    className = '',
    // новые пропсы:
    isCreateCard = true,
    // isCreateCard = false,
    onCreateClick,
    createButtonText = 'Сохранить',
}) => {
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

    const mainPhoto = getFirstPhoto(truckPhotoUrls);
    const isCompact = className?.includes('vehicle-card--compact');

    return (
        <div className={`vehicle-card-full ${className}`}>
            {/* Оверлей-кнопка только в режиме создания */}
            {isCreateCard && (
                <div className='vehicle-card-action'>
                    <Button
                        type='button'
                        type_btn='yes'
                        size_width='auto'
                        size_height='low'
                        icon={<FaSave />}
                        onClick={onCreateClick}
                    >
                        {createButtonText}
                    </Button>
                </div>
            )}

            {/* Левая колонка: авто-галерея */}

            {isCompact ? (
                mainPhoto ? (
                    <img
                        src={mainPhoto}
                        alt={truckName || 'Фото машины'}
                        className="vehicle-thumb"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="vehicle-thumb-placeholder">Фото</div>
                )
            ) : (
                <div className='vehicle-gallery'>
                    <VerticalPhotoCarousel photos={truckPhotoUrls} />
                </div>
            )}

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

function getFirstPhoto(urls) {
    if (!urls) return null;
    if (Array.isArray(urls)) return urls[0] || null;
    if (typeof urls === 'object') {
        const entries = Object.entries(urls);
        if (!entries.length) return null;
        entries.sort((a, b) =>
            String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true })
        );
        return entries[0][1];
    }
    return null;
}
