// src/components/Tracks/Tracks.jsx
import React, { useContext } from 'react';

import ProfileSectionCard from './../../common/ProfileSectionCard/ProfileSectionCard';
import VehicleAvatarRow from './../../VehicleCard/VehicleAvatarRow';
import { VehicleContext } from '../../../hooks/VehicleContext';

const Tracks = () => {
    const { vehicles, loading, error } = useContext(VehicleContext);

    return (
        <ProfileSectionCard
            className="profile-section--fill profile-section--stick-bottom"
            title="Мой транспорт"
            subtitle="Здесь будет весь Ваш транспорт."
            toList="/vehicles"
            items={vehicles}              // можно оставлять — на поведение клика не влияет
            emptyText="Пока нет машин"
            renderContent={() => {
                if (loading) return <div style={{ padding: '6px 0' }}>Загрузка…</div>;
                if (error) return <div className="error-text">Ошибка: {String(error)}</div>;
                return (
                    <VehicleAvatarRow
                        vehicles={vehicles}
                        itemSize={60}
                        /* variant="auto" по умолчанию */
                        linkToBase="/vehicles"
                    />
                );
            }}
        />

    );
};

export default Tracks;
