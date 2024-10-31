import './ReviewAdItem.css';
import { FaTimesCircle } from 'react-icons/fa';

import { formatNumber } from '../../utils/helper';

const ReviewAdItem = ({ ad, isActive = true, removeReviewAd }) => {
    const {
        status,
        availabilityDate,
        departureCity,
        destinationCity,
        price,
        paymentUnit,
    } = ad.ad;
    return (
        <div className='preview-review-ad-item-container'>
            <div
                className={`preview-review-ad-item-negative-status ${
                    isActive ? '' : 'review-ad-item-not-active'
                }`}
            >
                {status === 'work' ? 'Занят' : null}
                {status === 'completed' ? 'Доставлено' : null}
                {status === 'deleted' ? 'Удалено' : null}
            </div>
            <div
                className={`preview-review-ad-item ${
                    isActive ? '' : 'review-ad-item-not-active'
                }`}
            >
                <div className='preview-review-ad-item-route'>
                    <div className='preview-review-ad-item-date'>
                        {availabilityDate}
                    </div>
                    <div className='preview-review-ad-item-city'>
                        {departureCity}
                    </div>
                    <div className='preview-review-ad-item-city'>
                        {destinationCity}
                    </div>
                </div>
                <div className='preview-review-ad-item-payment'>
                    <div className='preview-review-ad-item-price'>
                        {formatNumber(String(price))}
                    </div>
                    <div className='preview-review-ad-item-payment-unit'>
                        {paymentUnit}
                    </div>
                </div>
            </div>
            <div
                className={`preview-review-ad-item-delete-icon ${
                    isActive ? '' : 'review-ad-item-not-active'
                }`}
                onClick={() => removeReviewAd(ad)}
            >
                <FaTimesCircle />
            </div>
        </div>
    );
};

export default ReviewAdItem;
