import React, { useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import styles from './TransportAdsList.module.css';

const TransportAdsList = () => {
    const { ads, loading, error } = useContext(TransportAdContext);

    if (loading) return <div className={styles.loadingMessage}>Loading...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <div className={styles.adsListContainer}>
            {/* <h2>Транспортные объявления</h2> */}
            <div className={styles.headerRow}>
                <div className={styles.cellHeader}>Транспорт</div>
                <div className={styles.cellHeader}>Откуда</div>
                <div className={styles.cellHeader}>Куда</div>
                <div className={styles.cellHeader}>Ставка</div>
                {/* <div className={styles.cellHeader}>Контакт</div> */}
            </div>
            {ads.length === 0 ? (
                <p>No transport ads available.</p>
            ) : (
                ads.map((ad, index) => (
                    <TransportAdItem
                        key={ad.adId}
                        ad={ad}
                        rowColor={index % 2 === 0 ? 'evenRow' : 'oddRow'}
                    />
                ))
            )}
        </div>
    );
};

export default TransportAdsList;
