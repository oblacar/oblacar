// src/components/TransportAdItem.js
import React from 'react';
import styles from './TransportAdItem.module.css';

const TransportAdItem = ({ ad }) => {
    return (
        <div className={styles.adItem}>
            <h3>{ad.vehicleType}</h3>
            <p className={styles.adDetails}>
                <strong>Location:</strong> {ad.location}
            </p>
            <p className={styles.adDetails}>
                <strong>Availability:</strong> {ad.availabilityDate}
            </p>
            <p className={styles.adDetails}>
                <strong>Destination:</strong> {ad.destination}
            </p>
            <p className={styles.adDetails}>
                <strong>Price:</strong> {ad.price} USD
            </p>
            <p className={styles.adDetails}>
                <strong>Description:</strong> {ad.description}
            </p>
            <p className={styles.adDetails}>
                <strong>Contact:</strong> {ad.contactInfo}
            </p>
        </div>
    );
};

export default TransportAdItem;
