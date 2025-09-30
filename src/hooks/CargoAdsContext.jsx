// src/hooks/CargoAdsContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

// ⚠️ проверь путь/имя файла сервиса!
import CargoAdService from '../services/CargoAdService';

import AuthContext from './Authorization/AuthContext'; // даёт userId (или аналог)
import UserContext from './UserContext';               // даёт профиль юзера (name/photo/rating и т.п.)

const CargoAdsContext = createContext(null);

export const CargoAdsProvider = ({ children }) => {
  // из AuthContext обычно берём id авторизованного юзера
  const auth = useContext(AuthContext) || {};
  const authUserId =
    auth.userId ??
    auth.user?.userId ??
    auth.currentUser?.uid ??
    null;

  // из UserContext берём «профиль» (то, что показываем в UI)
  const { user: profile } = useContext(UserContext) || {};

  const [ads, setAds] = useState([]);        // массив нормализованных { adId, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // начальная загрузка
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await CargoAdService.getAll();
        if (!mounted) return;
        setAds(list);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await CargoAdService.getAll();
      setAds(list);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const addAd = useCallback(async (data) => {
    try {
      // мягко подставляем автора из контекстов, если не передали
      const payload = {
        ...data,
        ownerId: data?.ownerId ?? authUserId ?? profile?.userId ?? null,
        ownerName: data?.ownerName ?? profile?.userName ?? profile?.userEmail ?? 'Пользователь',
        ownerPhotoUrl: data?.ownerPhotoUrl ?? profile?.userPhoto ?? '',
        ownerRating: data?.ownerRating ?? profile?.userRating ?? '', // если есть рейтинг в профиле
      };

      const created = await CargoAdService.create(payload);
      setAds((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  }, [authUserId, profile]);

  const updateAd = useCallback(async (adId, patch) => {
    try {
      const saved = await CargoAdService.updateById(adId, patch);
      setAds((prev) => {
        const i = prev.findIndex((x) => String(x.adId) === String(adId));
        if (i === -1) return prev;
        const next = prev.slice();
        next[i] = saved;
        return next;
      });
      return saved;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  }, []);

  const deleteAd = useCallback(async (adId) => {
    try {
      await CargoAdService.deleteById(adId);
      setAds((prev) => prev.filter((x) => String(x.adId) !== String(adId)));
      return true;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  }, []);

  // Вспомогательные выборки
  const getByOwner = useCallback((ownerId) => {
    const oid = String(ownerId ?? '');
    return ads.filter((ad) => String(ad.ownerId ?? '') === oid);
  }, [ads]);

  const value = useMemo(() => ({
    ads,
    loading,
    error,
    refresh,
    addAd,
    updateAd,
    deleteAd,
    getByOwner,
  }), [ads, loading, error, refresh, addAd, updateAd, deleteAd, getByOwner]);

  return (
    <CargoAdsContext.Provider value={value}>
      {children}
    </CargoAdsContext.Provider>
  );
};

export default CargoAdsContext;
