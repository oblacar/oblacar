// pages/MyTransportAdsPage.jsx

//TODO нужно проверить, используется ли такая страница
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../../../hooks/Authorization/AuthContext';
import CargoAdsContext from '../../../../hooks/CargoAdsContext';
import CargoAdsList from '../../../../components/CargoAds/CargoAdsList'; // презентационный список

const MyCargoAdsPage = () => {
    const { userId } = useContext(AuthContext);
    const { getAdsByOwnerId } = useContext(CargoAdsContext);

    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await getAdsByOwnerId(userId); // контекст сам решит: из памяти или из БД
                if (!cancelled) setAds(res);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userId, getAdsByOwnerId]);

    if (loading) return <div className='deliveries-container'>Загрузка…</div>;
    return <CargoAdsList items={ads} />; // чистая “вьюшка”
};

export default MyCargoAdsPage;
