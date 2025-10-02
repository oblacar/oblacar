// src/components/PreviewReviewAdsList/PreviewReviewAdsPanel.jsx
import React, { useContext, useMemo, useState, useCallback } from 'react';

import TransportAdContext from '../../hooks/TransportAdContext';
import CargoAdsContext from '../../hooks/CargoAdsContext';
import ReviewTypeToggle from '../ReviewTypeToggle/ReviewTypeToggle';
import ReviewAdItem from './ReviewAdItem';
import './PreviewReviewAdsList.css';

const PreviewReviewAdsList = () => {
    const {
        reviewAds: transportReviewAds,
        removeReviewAd: removeTransportReview,
    } = useContext(TransportAdContext);

    const {
        ads: cargoAds,
        reviewedIds: cargoReviewedIds,
        removeReviewAd: removeCargoReview,
    } = useContext(CargoAdsContext);

    // соберём объекты объявлений груза по отмеченным id
    const cargoReviewAds = useMemo(() => {
        const ids = new Set((cargoReviewedIds || []).map(String));
        return (cargoAds || []).filter((a) => ids.has(String(a?.adId)));
    }, [cargoAds, cargoReviewedIds]);

    const [tab, setTab] = useState('transport'); // 'transport' | 'cargo'

    // единый обработчик удаления для карточки (ReviewAdItem зовёт removeReviewAd(ad, adType))
    const handleRemove = useCallback(
        (adOrData, adType) => {
            if (adType === 'cargo') {
                const id = String(adOrData?.adId ?? adOrData); // поддержим как объект, так и id
                if (id) removeCargoReview(id);
                return;
            }
            // transport путь — как раньше (передаём объект объявления)
            removeTransportReview(adOrData);
        },
        [removeCargoReview, removeTransportReview]
    );

    const isEmpty =
        tab === 'transport'
            ? (transportReviewAds?.length ?? 0) === 0
            : (cargoReviewAds?.length ?? 0) === 0;

    return (
        <div className="preview-review-ads-panel">
            <div className="preview-review-ads-header">
                <ReviewTypeToggle value={tab} onChange={setTab} />
            </div>

            <div className="preview-review-ads-list">
                {isEmpty ? (
                    <span>Отмеченные объявления отсутствуют.</span>
                ) : tab === 'transport' ? (
                    transportReviewAds.map((ad, idx) => (
                        <div key={ad?.ad?.adId || idx}>
                            <ReviewAdItem
                                ad={ad}
                                adType="transport"
                                isActive={ad?.ad?.status === 'active'}
                                removeReviewAd={handleRemove}
                            />
                        </div>
                    ))
                ) : (
                    cargoReviewAds.map((ad, idx) => (
                        <div key={ad?.adId || idx}>
                            <ReviewAdItem
                                ad={ad}
                                adType="cargo"
                                isActive={ad?.status === 'active'}
                                removeReviewAd={handleRemove}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PreviewReviewAdsList;
