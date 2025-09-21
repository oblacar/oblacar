import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdItem from './TransportAdItem';
import './TransportAdsList.css';

import Preloader from '../common/Preloader/Preloader';

const TransportAdsList = ({ items = [] }) => {
    const { ads, loading, error } = useContext(TransportAdContext);

    // если items не передан (или пуст), используем контекст
    const useContextData = !items || items.length === 0;
    const list = useContextData ? ads : items;

    // показываем прелоадер/ошибку только если работаем с контекстом
    if (loading)
        return (
            <div className='preloader'>
                <Preloader />
            </div>
        );
    if (error) return <div className='error-message'>Error: {error}</div>;

    // нормализуем элемент: поддержим и "расширенный" ({ad, isInReviewAds}), и "plain" (ad-объект)
    const toExtended = (item) => {
        if (item && item.ad) return item; // уже расширенная форма
        return item ? { ad: item, isInReviewAds: false } : null;
    };

    return (
        <div className="ads-list-container">
            <div>
                {(!list || list.length === 0) ? (
                    <p>No transport ads available.</p>
                ) : (
                    list.map((item, index) => {
                        const ext = toExtended(item);
                        if (!ext || !ext.ad) return null;

                        const key = ext.ad.adId || index;
                        const isActive = ext.ad.status === 'active';

                        return (
                            <div key={key}>
                                {/* <Link to={`/ads/${ext.ad.adId}`}> */}
                                <TransportAdItem ad={ext} isActive={isActive} />
                                {/* </Link> */}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TransportAdsList;
