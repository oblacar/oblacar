import { useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';

import './PreviewReviewAdsList.css';
import ReviewAdItem from './ReviewAdItem';

export const PrevieReviewAdsList = () => {
    const { reviewAds, removeReviewAd } = useContext(TransportAdContext);

    return (
        <div className='preview-review-ads-list'>
            {reviewAds.length === 0 ? (
                <span>Отмеченные объявления отсутсвуют.</span>
            ) : (
                reviewAds.map((ad, index) => (
                    <div key={index}>
                        <ReviewAdItem
                            ad={ad}
                            removeReviewAd={removeReviewAd}
                            isActive={ad.ad.status === 'active'}
                        />
                    </div>
                ))
            )}
        </div>
    );
};
