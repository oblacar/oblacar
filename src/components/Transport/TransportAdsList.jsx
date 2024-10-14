import React, { useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import styles from './TransportAdsList.module.css';

const TransportAdsList = () => {
    const { ads, loading, error, addAd } = useContext(TransportAdContext);

    if (loading) return <div className={styles.loadingMessage}>Loading...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <div className={styles.adsListContainer}>
            <h2>Available Transport Ads</h2>
            {ads.length === 0 ? (
                <p>No transport ads available.</p>
            ) : (
                ads.map((ad) => (
                    <TransportAdItem
                        key={ad.id}
                        ad={ad}
                    />
                ))
            )}
        </div>
    );
};

export default TransportAdsList;
