// src/pages/AdPage/AdPage.jsx
import React, { useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import TransportAdContext from '../../hooks/TransportAdContext';
import CargoAdsContext from '../../hooks/CargoAdsContext';

import AdProfile from '../../components/AdProfile/AdProfile';

const AdPage = () => {
    const { adId } = useParams();
    const [sp] = useSearchParams();

    const requestedType = (sp.get('type') || '').replace(/['"]/g, '').toLowerCase(); // 'cargo' | 'transport' | ''

    const tCtx = useContext(TransportAdContext) || {};
    const cCtx = useContext(CargoAdsContext) || {};

    // поддерживаем оба варианта имён метода: getById и getAdById
    const getTransportById =
        tCtx.getById ||
        tCtx.getAdById ||
        ((id) =>
            Array.isArray(tCtx.ads)
                ? tCtx.ads.find((x) => String(x.adId) === String(id)) || null
                : null);

    const getCargoById =
        cCtx.getById ||
        cCtx.getAdById ||
        ((id) =>
            Array.isArray(cCtx.ads)
                ? cCtx.ads.find((x) => String(x.adId) === String(id)) || null
                : null);

    const transportAds = tCtx.ads;
    const cargoAds = cCtx.ads;
    const transportLoading = tCtx.loading;
    const cargoLoading = cCtx.loading;

    const cargoAd = adId ? getCargoById(adId) : null;
    const transportAd = adId ? getTransportById(adId) : null;

    let ad = null;
    let resolvedType = '';

    if (requestedType === 'cargo') {
        ad = cargoAd || transportAd || null;
        resolvedType = cargoAd ? 'cargo' : transportAd ? 'transport' : '';
    } else if (requestedType === 'transport') {
        ad = transportAd || cargoAd || null;
        resolvedType = transportAd ? 'transport' : cargoAd ? 'cargo' : '';
    } else {
        ad = cargoAd || transportAd || null;
        resolvedType = cargoAd ? 'cargo' : transportAd ? 'transport' : '';
    }

    const contextsReady =
        (Array.isArray(cargoAds) || cargoLoading === false) &&
        (Array.isArray(transportAds) || transportLoading === false);

    console.log('[AdPage] adId:', adId, {
        requestedType,
        resolvedType,
        foundCargo: !!cargoAd,
        foundTransport: !!transportAd,
        cargoLen: Array.isArray(cargoAds) ? cargoAds.length : 'n/a',
        transportLen: Array.isArray(transportAds) ? transportAds.length : 'n/a',
        cargoLoading,
        transportLoading,
    });

    if (!ad && !contextsReady) return <p>Загрузка…</p>;
    if (!ad) return <p>Объявление не найдено</p>;

    return <AdProfile adType={resolvedType} ad={ad} />;
};

export default AdPage;
