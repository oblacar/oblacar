

const ReviewAdsList = ({ ads }) => (
    <div className='review-ads-list'>
        {ads.map((ad, index) => (
            <div
                key={index}
                className={`review-ad-item ${ad.isActive ? '' : 'inactive'}`}
                // onClick={() => removeReviewAd(ad.ad.adId)}
            >
                <span>{ad.ad.title}</span>
                <span>
                    {ad.ad.location} - {ad.ad.destination}
                </span>
            </div>
        ))}
    </div>
);
