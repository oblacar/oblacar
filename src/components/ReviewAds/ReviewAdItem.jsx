import './ReviewAdItem.css';
import { FaTimesCircle } from 'react-icons/fa';

import { formatNumber } from '../../utils/helper';

const ReviewAdItem = ({ ad, isActive = true }) => {
    return (
        <div
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
                    onClick={() => removeReviewAd(ad)}
                >
                    <FaTimesCircle />
                </div>
            </div>
        </div>
    );
};
