// src/components/Trucks/Trucks.jsx
import React, { useContext } from 'react';
import ProfileSectionCard from '../../common/ProfileSectionCard/ProfileSectionCard';
import InlineOverlapRow from '../../common/ProfileSectionCard/InlineOverlapRow';
import TransportAdMiniCard from '../../TransportAds/TransportAdMiniCard/TransportAdMiniCard'

import TransportAdContext from '../../../hooks/TransportAdContext';

const TransportAdsBoard = () => {
  const { ads = [], loading, error } = useContext(TransportAdContext);

  return (
    <ProfileSectionCard
      className="profile-section--fill profile-section--stick-bottom"
      title="Мои объявления о Траспорте"
      subtitle="Здесь будут размещенные вами объявления о наличие Транспорта для перевозки."
      toList="/vehicles"
      items={ads}
      emptyText="Пока нет объявлений"
      renderContent={() => {
        if (loading) return <div style={{ padding: '6px 0' }}>Загрузка…</div>;
        if (error) return <div className="error-text">Ошибка: {String(error)}</div>;
        if (!ads.length) return <div className="profile-section-card__empty-text">Пока нет машин</div>;

        return (
          <InlineOverlapRow
            items={ads}
            ItemComponent={({ item, size }) => (
              <TransportAdMiniCard ad={item} width={size} />
            )}
            itemSize={60}
            itemAspectRatio={1}
            gap={8}
            getKey={(v) => v.adId}
            buildTo={(v) => `/vehicles/${v.adId}`}
          />
        );
      }}
    />
  );
};

export default TransportAdsBoard;
