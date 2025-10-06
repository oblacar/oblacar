import React, { useContext, useMemo } from 'react';
import ProfileSectionCard from '../../common/ProfileSectionCard/ProfileSectionCard';
import InlineOverlapRow from '../../common/ProfileSectionCard/InlineOverlapRow';
import TransportAdMiniCard from '../../TransportAds/TransportAdMiniCard/TransportAdMiniCard'

import TransportAdContext from '../../../hooks/TransportAdContext';
import AuthContext from '../../../hooks/Authorization/AuthContext';

const TransportAdsBoard = () => {
  const { userId } = useContext(AuthContext);
  const { ads, loading, error } = useContext(TransportAdContext);

  const myAds = useMemo(() => {
    if (!Array.isArray(ads)) return [];
    return ads.filter(x => (x?.ad?.ownerId ?? x?.ownerId) === userId);
  }, [ads, userId]);

  return (
    <ProfileSectionCard
      className="profile-section--fill profile-section--stick-bottom"
      title="Мои объявления о готовности Траспорта для перевозки"
      subtitle="Здесь будут размещенные вами объявления о наличие Транспорта для перевозки."
      toList="/my-transport-ads"
      items={myAds}
      emptyText="Пока нет объявлений"
      renderContent={() => {
        if (loading) return <div style={{ padding: '6px 0' }}>Загрузка…</div>;
        if (error) return <div className="error-text">Ошибка: {String(error)}</div>;
        if (!ads.length) return <div className="profile-section-card__empty-text">Пока нет объявлений</div>;

        return (
          <InlineOverlapRow
            items={myAds}
            ItemComponent={({ item, size }) => (
              <TransportAdMiniCard ad={item} width={size} />
            )}
            itemSize={60}
            itemAspectRatio={1}
            gap={8}
            getKey={(v) => v.ad.adId}
            buildTo={(v) => `/ads/${v.ad.adId}`}
          />
        );
      }}
    />
  );
};

export default TransportAdsBoard;
