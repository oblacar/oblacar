// src/components/Tracks/Tracks.jsx
import React, { useContext } from 'react';

import ProfileSectionCard from './../../common/ProfileSectionCard/ProfileSectionCard';
import VehicleAvatarRow from './../../VehicleCard/VehicleAvatarRow';
import { VehicleContext } from '../../../hooks/VehicleContext';

const Tracks = () => {
    const { vehicles, loading, error } = useContext(VehicleContext);

    return (
        <ProfileSectionCard
            title='Мой транспорт'
            toList='/vehicles'
            items={vehicles} // чтобы ProfileSectionCard знал, пусто или нет
            emptyText='Пока нет машин'
            renderContent={() => {
                if (loading)
                    return <div style={{ padding: '6px 0' }}>Загрузка…</div>;
                if (error)
                    return (
                        <div className='error-text'>
                            Ошибка: {String(error)}
                        </div>
                    );
                return (
                    <VehicleAvatarRow
                        vehicles={vehicles}
                        itemSize={60}
                        gap={10}
                        linkToBase='/vehicles' // клики по кружкам → /vehicles/:id
                        emptyText='Пока нет машин'
                    />
                );
            }}
        />
    );
};

export default Tracks;
