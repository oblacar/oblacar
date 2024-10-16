import React, { useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import styles from './TransportAdsList.module.css';

const TransportAdsList = () => {
    const { ads, loading, error } = useContext(TransportAdContext);

    if (loading) return <div className={styles.loadingMessage}>Loading...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    const getRandomRating = () => {
        return Math.floor(Math.random() * 50) / 10;
    };

    return (
        <div className={styles.adsListContainer}>
            {ads.length === 0 ? (
                <p>No transport ads available.</p>
            ) : (
                ads.map((ad, index) => (
                    <TransportAdItem
                        key={ad.adId}
                        ad={ad}
                        // rowColor={index % 2 === 0 ? 'evenRow' : 'oddRow'}
                        rating={Math.floor(Math.random() * 50) / 10}
                    />
                ))
            )}
        </div>
    );
};

export default TransportAdsList;
