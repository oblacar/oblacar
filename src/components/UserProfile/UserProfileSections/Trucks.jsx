import React from 'react';
import ProfileSectionCard, {
    firstPhotoFromObject,
} from './../../common/ProfileSectionCard/ProfileSectionCard';

// Прямоугольный блок «Мой транспорт».
// Ожидает проп vehicles = [] (массив машин).
// Переход по блоку → /vehicles, по элементу → /vehicles/:truckId.

const Tracks = ({ vehicles = [] }) => {
    return (
        <ProfileSectionCard
            title='Мой транспорт'
            subtitle='Здесь будет весь Ваш транспорт.'
            items={vehicles}
            toList='/vehicles'
            // toList='/new-vehicle'
            idKey='truckId'
            buildItemTo={(v) => `/vehicles/${v.truckId}`}
            emptyText='Пока нет машин'
            renderItem={(v) => (
                <div className='profile-section__chip'>
                    <div className='profile-section__chip-avatar profile-section__chip-avatar--img'>
                        {firstPhotoFromObject(v.truckPhotoUrls) ? (
                            <img
                                src={firstPhotoFromObject(v.truckPhotoUrls)}
                                alt=''
                            />
                        ) : (
                            <span>ТР</span>
                        )}
                    </div>
                    <div className='profile-section__chip-title'>
                        {v.truckName || 'Без названия'}
                    </div>
                </div>
            )}
        />
    );
};

export default Tracks;
