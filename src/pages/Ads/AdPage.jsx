import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import TransportAdContext from '../../hooks/TransportAdContext';

import AdProfile from '../../components/AdProfile/AdProfile';

const AdPage = (adType) => {
    const { adId } = useParams();
    const { getAdById } = useContext(TransportAdContext);

    const ad = getAdById(adId);

    if (!ad) return <p>Объявление не найдено</p>;

    return (
        <div>
            <AdProfile adType={adType} ad={ad.ad} />
        </div>
    );
};

export default AdPage;
