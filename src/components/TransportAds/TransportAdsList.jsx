import React, { useContext, useEffect } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import './TransportAdsList.css';

import Preloader from '../common/Preloader/Preloader';

const TransportAdsList = () => {
    const { ads, loading, error } = useContext(TransportAdContext);

    if (loading)
        return (
            <div className='preloader'>
                <Preloader />
            </div>
        );
    if (error) return <div className='error-message'>Error: {error}</div>;

    // const getRandomRating = () => {
    //     return Math.floor(Math.random() * 50) / 10;
    // };

    return (
        <div className='ads-list-container'>
            <div>
                {ads.length === 0 ? (
                    <p>No transport ads available.</p>
                ) : (
                    ads.map(
                        (ad, index) => {
                            return (
                                ad && (
                                    <TransportAdItem
                                        key={ad.ad.adId || index}
                                        ad={ad}
                                        // rating={Math.floor(Math.random() * 50) / 10}
                                    />
                                )
                            );
                        }
                        // console.log(ad)
                    )
                )}
            </div>
        </div>
    );
};

export default TransportAdsList;
