import React from 'react';
import ProfileSectionCard, {
    firstPhotoFromObject,
} from '../../common/ProfileSectionCard/ProfileSectionCard';
import { useNavigate } from 'react-router-dom';

const TransportAds = ({ vehicles = [] }) => {
    const navigate = useNavigate();

    return (
        <ProfileSectionCard
            title='Мои объявления о Траспорте'
            subtitle='Здесь будут размещенные вами объявления о наличие Транспорта для
                перевозки.'
            items={vehicles}
            toList='/vehicles'
            idKey='truckId'
            buildItemTo={(v) => `/vehicles/${v.truckId}`}
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
            onAdd={() => navigate('/vehicles/new')}
            addLabel='Добавить машину'
            emptyText='Пока объявлений'
        />
    );
};

export default TransportAds;
