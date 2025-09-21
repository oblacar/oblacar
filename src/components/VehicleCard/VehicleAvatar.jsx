// src/components/VehicleAvatar/VehicleAvatar.jsx
import React from 'react';
import './VehicleAvatar.css';
import { FaTruck } from 'react-icons/fa';

const VehicleAvatar = ({
    vehicle = {},
    size = 64,
    title,
    className = '',
    clickable = true,        // <- управляет курсором и hover/active
}) => {
    const { truckPhotoUrls } = vehicle;
    const url = firstPhoto(truckPhotoUrls);

    return (
        <div
            className={[
                'vehicle-avatar',
                clickable ? 'vehicle-avatar--interactive is-clickable' : '',
                className
            ].join(' ')}
            style={{ '--va-size': `${size}px` }}
            title={title || vehicle.truckName || 'Машина'}
            tabIndex={clickable ? 0 : -1}
        >
            {url ? (
                <img className="vehicle-avatar__img" src={url} alt="" />
            ) : (
                <FaTruck className="vehicle-avatar__icon" aria-hidden />
            )}
        </div>
    );
};

export default VehicleAvatar;

// утилита
function firstPhoto(obj = {}) {
    if (Array.isArray(obj)) return obj[0] || null;
    const entries = Object.entries(obj || {});
    if (!entries.length) return null;
    entries.sort((a, b) =>
        String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true })
    );
    return entries[0][1] || null;
}


// // 1) По объекту машины
// <VehicleAvatar vehicle={vehicle} size={72} onClick={() => navigate(`/vehicles/${vehicle.truckId}`)} />

// // 2) Явный URL
// <VehicleAvatar photoUrl="https://..." size={56} />

// // 3) Без фото — покажется иконка
// <VehicleAvatar size={80} />
