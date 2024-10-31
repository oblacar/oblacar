import { useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';

import './PreviewReviewAdsList.css';

import { FaTrash, FaTimesCircle } from 'react-icons/fa';

import { formatNumber } from '../../utils/helper';

export const PrevieReviewAdsList = () => {
    const { reviewAds, removeReviewAd } = useContext(TransportAdContext);

    return (
        <div className='preview-review-ads-list'>
            {reviewAds.length === 0 ? (
                <span>Отмеченные объявления отсутсвуют.</span>
            ) : (
                reviewAds.map((ad, index) => (
                    <div
                        key={index}
                        className='preview-review-ad-item '
                    >
                        <div className='preview-review-ad-item-route'>
                            <div className='preview-review-ad-item-date'>
                                {ad.ad.availabilityDate}
                            </div>
                            <div className='preview-review-ad-item-city'>
                                {ad.ad.departureCity}
                            </div>
                            <div className='preview-review-ad-item-city'>
                                {ad.ad.destinationCity}
                            </div>
                        </div>
                        <div className='preview-review-ad-item-payment'>
                            <div className='preview-review-ad-item-price'>
                                {formatNumber(String(ad.ad.price))}
                            </div>
                            <div className='preview-review-ad-item-payment-unit'>
                                {ad.ad.paymentUnit}
                            </div>
                            <div
                                className='preview-review-ad-item-delete-icon'
                                onClick={()=>removeReviewAd(ad)}
                            >
                                <FaTimesCircle />
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
