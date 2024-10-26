import React, { useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import styles from './TransportAdsList.module.css';

import Preloader from '../common/Preloader/Preloader';

const TransportAdsList = () => {
    const { ads, loading, error } = useContext(TransportAdContext);

    if (loading)
        return (
            <div className={styles.preloader}>
                <Preloader />
            </div>
        );
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    // const getRandomRating = () => {
    //     return Math.floor(Math.random() * 50) / 10;
    // };

    return (
        <div className={styles.adsListContainer}>
            {ads.length === 0 ? (
                <p>No transport ads available.</p>
            ) : (
                ads.map(
                    (ad, index) => {
                        return (
                            ad && (
                                <TransportAdItem
                                    key={ad.adId || index}
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
    );
};

export default TransportAdsList;
