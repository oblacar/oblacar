// src/components/CargoAds/CargoAdsBoard/CargoAdsBoard.jsx
import React, { useContext, useMemo } from 'react';
import ProfileSectionCard from '../../common/ProfileSectionCard/ProfileSectionCard';
import InlineOverlapRow from '../../common/ProfileSectionCard/InlineOverlapRow';
import CargoAdMiniCard from '../../CargoAds/CargoAdMiniCard/CargoAdMiniCard';

import CargoAdContext from '../../../hooks/CargoAdsContext';
import AuthContext from '../../../hooks/Authorization/AuthContext';

const CargoAdsBoard = () => {
    const { userId } = useContext(AuthContext);
    const { ads, loading, error } = useContext(CargoAdContext);

    const myAds = useMemo(() => {
        if (!Array.isArray(ads)) return [];
        return ads.filter((x) => (x?.ad?.ownerId ?? x?.ownerId) === userId);
    }, [ads, userId]);

    return (
        <ProfileSectionCard
            className="profile-section--fill profile-section--stick-bottom"
            title="Мои объявления о наличие Груза для перевозки"
            subtitle="Здесь будут размещенные вами объявления о грузах для перевозки."
            toList="/my-cargo-ads"
            items={myAds}
            emptyText="Пока нет объявлений"
            renderContent={() => {
                if (loading) return <div style={{ padding: '6px 0' }}>Загрузка…</div>;
                if (error) return <div className="error-text">Ошибка: {String(error)}</div>;
                if (!ads || !ads.length) {
                    return <div className="profile-section-card__empty-text">Пока нет объявлений</div>;
                }

                return (
                    <InlineOverlapRow
                        items={myAds}
                        ItemComponent={({ item, size }) => (
                            <CargoAdMiniCard ad={item} width={size} />
                        )}
                        itemSize={60}
                        itemAspectRatio={1}
                        gap={8}
                        getKey={(v) => v.adId}
                        buildTo={(v) => `/cargo-ads/${v.adId}`}
                    />
                );
            }}
        />
    );
};

export default CargoAdsBoard;
