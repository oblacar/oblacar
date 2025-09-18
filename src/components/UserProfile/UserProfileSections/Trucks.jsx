// src/components/Tracks/Tracks.jsx
import React, { useContext } from 'react';

import ProfileSectionCard from './../../common/ProfileSectionCard/ProfileSectionCard';
import VehicleAvatarRow from './../../VehicleCard/VehicleAvatarRow';
import { VehicleContext } from '../../../hooks/VehicleContext';

const Tracks = () => {
    const { vehicles, loading, error } = useContext(VehicleContext);

    return (
        <ProfileSectionCard
            className='profile-section--fill profile-section--stick-bottom' // прижать ленту вниз
            title='Мой транспорт'
            subtitle='Здесь будет весь Ваш транспорт.'
            toList='/vehicles'
            items={vehicles} // нужен, чтобы карточка знала, пусто или нет (для клика по фону)
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
                        // vehicles={vehicles}
                        // itemSize={60}
                        // gap={10}
                        // linkToBase='/vehicles'
                        // emptyText='Пока нет машин'

                        // vehicles={vehicles}
                        // itemSize={60}
                        // variant='overlap' // ← новый режим. если их не передать — будет скролл-режим.
                        // overlapOffset={14}
                        // maxVisible={4}
                        // linkToBase='/vehicles'

                        vehicles={vehicles}
                        itemSize={60}
                        /* variant="auto" — по умолчанию */
                        linkToBase='/vehicles'
                    />
                );
            }}
        />
    );
};

export default Tracks;
