// src/components/Trucks/Trucks.jsx
import React, { useContext } from 'react';
import ProfileSectionCard from '../../common/ProfileSectionCard/ProfileSectionCard';
import InlineOverlapRow from '../../common/ProfileSectionCard/InlineOverlapRow';
import VehicleAvatar from '../../VehicleCard/VehicleAvatar';
import { VehicleContext } from '../../../hooks/VehicleContext';

const Trucks = () => {
    const { vehicles = [], loading, error } = useContext(VehicleContext);

    return (
        <ProfileSectionCard
            className="profile-section--fill profile-section--stick-bottom"
            title="Мой транспорт"
            subtitle="Здесь будет весь Ваш транспорт."
            toList="/vehicles"
            items={vehicles}
            emptyText="Пока нет машин"
            renderContent={() => {
                if (loading) return <div style={{ padding: '6px 0' }}>Загрузка…</div>;
                if (error) return <div className="error-text">Ошибка: {String(error)}</div>;
                if (!vehicles.length) return <div className="profile-section-card__empty-text">Пока нет машин</div>;

                return (
                    <InlineOverlapRow
                        items={vehicles}
                        ItemComponent={({ item, size }) => (
                            <VehicleAvatar vehicle={item} size={size} />
                        )}
                        itemSize={60}
                        itemAspectRatio={1}
                        gap={8}
                        getKey={(v) => v.truckId}
                        buildTo={(v) => `/vehicles/${v.truckId}`}
                    />
                );
            }}
        />
    );
};

export default Trucks;
