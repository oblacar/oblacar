// pages/MyTransportAdsPage.jsx

//TODO нужно проверить, используется ли такая страница
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../hooks/Authorization/AuthContext';
import TransportAdContext from '../../hooks/TransportAdContext';
import TransportAdList from '../../components/TransportAds/TransportAdsList'; // презентационный список

const MyTransportAdsPage = () => {
    const { userId } = useContext(AuthContext);
    const { getAdsByUserId } = useContext(TransportAdContext);

    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await getAdsByUserId(userId); // контекст сам решит: из памяти или из БД
                if (!cancelled) setAds(res);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [userId, getAdsByUserId]);

    if (loading) return <div className="deliveries-container">Загрузка…</div>;
    return <TransportAdList items={ads} />; // чистая “вьюшка”
};

export default MyTransportAdsPage;
