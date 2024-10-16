import React from 'react';
import './SingleRatingStar.css';

const SingleRatingStar = ({ rating }) => {
    const numericRating = Number(rating);

    return (
        <div className='rating-star-item'>
            <div className='rating-star-container'>
                <div className='star-wrapper'>
                    <div className='star-background'>★</div>
                    <div
                        className='star-foreground'
                        style={{
                            width: `${(numericRating / 5) * 100}%`, // Закрашиваем звезду
                        }}
                    >
                        ★
                    </div>
                </div>
                <div className='rating-number'>{numericRating.toFixed(1)}</div>
            </div>
        </div>
    );
};

export default SingleRatingStar;
