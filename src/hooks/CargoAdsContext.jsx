import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import CargoAdService from '../services/CargoAdService';
import AuthContext from './Authorization/AuthContext'; // у тебя тут лежит userId

const CargoAdsContext = createContext(null);

export const CargoAdsProvider = ({ children }) => {
  const { userId } = useContext(AuthContext) || {};

  const [ads, setAds] = useState([]);        // массив { adId, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // начальная загрузка
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await CargoAdService.getAll();
        if (!mounted) return;
        setAds(list);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // методы
  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await CargoAdService.getAll();
      setAds(list);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const addAd = async (data) => {
    try {
      // подставим ownerId, если не передали
      const payload = data?.ownerId ? data : { ...data, ownerId: userId || null };
      const created = await CargoAdService.create(payload);
      setAds((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  };

  const updateAd = async (adId, patch) => {
    try {
      const saved = await CargoAdService.updateById(adId, patch);
      setAds((prev) => {
        const i = prev.findIndex((x) => String(x.adId) === String(adId));
        if (i === -1) return prev;
        const copy = [...prev];
        copy[i] = saved;
        return copy;
      });
      return saved;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  };

  const deleteAd = async (adId) => {
    try {
      await CargoAdService.deleteById(adId);
      setAds((prev) => prev.filter((x) => String(x.adId) !== String(adId)));
      return true;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  };

  // Вспомогательные выборки (удобно для досок/страниц)
  const getByOwner = (owner) =>
    ads.filter((ad) => String(ad.ownerId || '') === String(owner || ''));

  const value = useMemo(
    () => ({
      ads,
      loading,
      error,
      refresh,
      addAd,
      updateAd,
      deleteAd,
      getByOwner,
    }),
    [ads, loading, error]
  );

  return (
    <CargoAdsContext.Provider value={value}>
      {children}
    </CargoAdsContext.Provider>
  );
};

export default CargoAdsContext;
