// src/components/VehicleAvatar/VehicleAvatar.jsx
import React from 'react';
import './VehicleAvatar.css';
import { FaTruck } from 'react-icons/fa';

const VehicleAvatar = ({
    vehicle = {}, // { truckName, truckPhotoUrls, ... }
    photoUrl, // опционно — можно явно передать URL
    size = 64, // диаметр кружка, px
    className = '',
    onClick, // если передан — курсор "pointer"
    title, // alt/title
}) => {
    const src = photoUrl || getFirstPhoto(vehicle?.truckPhotoUrls);
    const label = title || vehicle?.truckName || 'Машина';

    return (
        <div
            className={`vehicle-avatar ${
                onClick ? 'is-clickable' : ''
            } ${className}`}
            style={{ '--va-size': `${size}px` }}
            onClick={onClick}
            title={label}
        >
            {src ? (
                <img
                    className='vehicle-avatar__img'
                    src={src}
                    alt={label}
                    loading='lazy'
                    decoding='async'
                />
            ) : (
                <FaTruck
                    className='vehicle-avatar__icon'
                    aria-label={label}
                />
            )}
        </div>
    );
};

export default VehicleAvatar;

/* ——— утилита: берём первое фото из массива или объекта ——— */
function getFirstPhoto(urls) {
    if (!urls) return null;
    if (Array.isArray(urls)) return urls[0] || null;
    if (typeof urls === 'object') {
        const entries = Object.entries(urls);
        if (!entries.length) return null;
        entries.sort((a, b) =>
            String(a[0]).localeCompare(String(b[0]), undefined, {
                numeric: true,
            })
        );
        return entries[0][1];
    }
    return null;
}

// // 1) По объекту машины
// <VehicleAvatar vehicle={vehicle} size={72} onClick={() => navigate(`/vehicles/${vehicle.truckId}`)} />

// // 2) Явный URL
// <VehicleAvatar photoUrl="https://..." size={56} />

// // 3) Без фото — покажется иконка
// <VehicleAvatar size={80} />
