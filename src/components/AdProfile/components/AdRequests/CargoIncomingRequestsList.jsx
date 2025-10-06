import React from 'react';
import styles from './IncomingRequestsList.module.css';

const CargoIncomingRequestsList = ({ adId }) => {
    return (
        <div className={styles.requestsList}>
            <p>Запросы для объявлений о грузе появятся в ближайших обновлениях.</p>
        </div>
    );
};

export default CargoIncomingRequestsList;
