import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    return (
        <div className='ads-list-container'>
            <div>
                {ads.length === 0 ? (
                    <p>No transport ads available.</p>
                ) : (
                    ads.map((ad, index) => {
                        return (
                            ad && (
                                <div key={ad.ad.adId || index}>
                                    {/* <Link to={`/ads/${ad.ad.adId}`}> */}
                                    <TransportAdItem
                                        ad={ad}
                                        isActive={ad.ad.status === 'active'}
                                    />
                                    {/* </Link> */}
                                </div>
                            )
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TransportAdsList;
