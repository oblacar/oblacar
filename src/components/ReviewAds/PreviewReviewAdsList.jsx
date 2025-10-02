// import { useContext } from 'react';
// import TransportAdContext from '../../hooks/TransportAdContext';

// import './PreviewReviewAdsList.css';
// import ReviewAdItem from './ReviewAdItem';

// export const PrevieReviewAdsList = () => {
//     const { reviewAds, removeReviewAd } = useContext(TransportAdContext);

//     return (
//         <div className='preview-review-ads-list'>
//             {reviewAds.length === 0 ? (
//                 <span>Отмеченные объявления отсутсвуют.</span>
//             ) : (
//                 reviewAds.map((ad, index) => (
//                     <div key={index}>
//                         <ReviewAdItem
//                             ad={ad}
//                             removeReviewAd={removeReviewAd}
//                             isActive={ad.ad.status === 'active'}
//                         />
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// };

// src/components/PreviewReviewAdsList/PreviewReviewAdsPanel.jsx
import React, { useContext, useMemo, useState } from 'react';

import TransportAdContext from '../../hooks/TransportAdContext';
import CargoAdsContext from '../../hooks/CargoAdsContext';
import ReviewTypeToggle from '../ReviewTypeToggle/ReviewTypeToggle';
import ReviewAdItem from './ReviewAdItem'; // для транспорта
import CargoAdItem from '../CargoAds/CargoAdItem'; // или свой компактный item
import './PreviewReviewAdsList.css';

const PreviewReviewAdsList = () => {
    const { reviewAds: transportReviewAds, removeReviewAd: removeTransportReview } = useContext(TransportAdContext);
    const { ads: cargoAds, reviewedIds: cargoReviewedIds, removeReviewAd: removeCargoReview } = useContext(CargoAdsContext);

    // строим массив объявлений груза по отмеченным id
    const cargoReviewAds = useMemo(() => {
        const ids = new Set((cargoReviewedIds || []).map(String));
        return (cargoAds || []).filter(a => ids.has(String(a?.adId)));
    }, [cargoAds, cargoReviewedIds]);

    const [tab, setTab] = useState('transport'); // 'transport' | 'cargo'

    const isEmpty =
        tab === 'transport' ? (transportReviewAds?.length ?? 0) === 0
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
                                removeReviewAd={removeTransportReview}
                                isActive={ad?.ad?.status === 'active'}
                            />
                        </div>
                    ))
                ) : (
                    cargoReviewAds.map((ad, idx) => (
                        <div key={ad?.adId || idx}>
                            {/* можно сделать компактный вариант карточки, здесь – базовый */}
                            <CargoAdItem
                                ad={ad}
                                isViewMode
                                isActive={ad?.status === 'active'}
                            />
                            {/* Кнопку «убрать из выбранных» можно показать рядом:
                  <button onClick={() => removeCargoReview(ad.adId)}>Убрать</button>
              */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PreviewReviewAdsList;
