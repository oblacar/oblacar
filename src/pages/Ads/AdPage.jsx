import React, { useContext, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import TransportAdContext from '../../hooks/TransportAdContext';
import CargoAdsContext from '../../hooks/CargoAdsContext';
import AdProfile from '../../components/AdProfile/AdProfile';

const AdPage = () => {
    const { adId } = useParams();
    const [sp] = useSearchParams();

    // дефолт — transport (поменяйте на cargo, если нужно)
    const adType = (sp.get('type') || 'transport').toLowerCase();

    const transportCtx = useContext(TransportAdContext) || {};
    const cargoCtx = useContext(CargoAdsContext) || {};

    const {
        getAdById: getTransportAdById,
        loading: transportLoading,
        ads: transportAds,
    } = transportCtx;

    const {
        getAdById: getCargoAdById,
        loading: cargoLoading,
        ads: cargoAds,
    } = cargoCtx;

    const ad = useMemo(() => {
        if (!adId) return null;
        if (adType === 'cargo') return getCargoAdById?.(adId) ?? null;
        // по умолчанию считаем transport
        return getTransportAdById?.(adId) ?? null;
    }, [adId, adType, getCargoAdById, getTransportAdById]);

    // ждём загрузки списков
    const isLoading = adType === 'cargo'
        ? (cargoLoading ?? (Array.isArray(cargoAds) ? cargoAds.length === 0 : !cargoAds))
        : (transportLoading ?? (Array.isArray(transportAds) ? transportAds.length === 0 : !transportAds));


    if (isLoading) return <p>Загрузка объявления…</p>;
    if (!ad) return <p>Объявление не найдено</p>;

    return <AdProfile adType={adType} ad={ad} />;
};

export default AdPage;
