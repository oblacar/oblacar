import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import TransportAdContext from '../../hooks/TransportAdContext';

import AdProfile from '../../components/AdProfile/AdProfile';

const AdPage = () => {
    const { adId } = useParams();
    const { getAdById } = useContext(TransportAdContext);

    const ad = getAdById(adId);

    if (!ad) return <p>Объявление не найдено</p>;

    return (
        <div>
            <AdProfile ad={ad.ad} />
        </div>
    );
};

export default AdPage;
