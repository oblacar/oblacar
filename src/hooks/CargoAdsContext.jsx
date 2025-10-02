// src/hooks/CargoAdsContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import CargoAdService from '../services/CargoAdService';
import UserReviewAdService from '../services/UserReviewAdService';

import AuthContext from './Authorization/AuthContext';
import UserContext from './UserContext';

const CargoAdsContext = createContext(null);

export const CargoAdsProvider = ({ children }) => {
  // --- auth/profile ---
  const auth = useContext(AuthContext) || {};
  const authUserId =
    auth.userId ??
    auth.user?.userId ??
    auth.currentUser?.uid ??
    null;

  const { user: profile } = useContext(UserContext) || {};

  // --- cargo ads list ---
  const [ads, setAds] = useState([]);        // массив нормализованных { adId, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- reviewed (избранные/отобранные) cargo ad ids для текущего пользователя ---
  const [reviewedIds, setReviewedIds] = useState([]);   // string[]
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // ====== загрузка объявлений ======
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
        ownerRating: data?.ownerRating ?? profile?.userRating ?? '',
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
      // если удаляем объявление — уберём его id и из reviewed локально
      setReviewedIds((prev) => prev.filter((id) => String(id) !== String(adId)));
      return true;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  }, []);

  const getById = useCallback(
    (id) => {
      if (id == null) return null;
      return (Array.isArray(ads) ? ads : []).find(a => String(a.adId) === String(id)) || null;
    },
    [ads]
  );

  // Вспомогательная выборка
  const getByOwner = useCallback((ownerId) => {
    const oid = String(ownerId ?? '');
    return ads.filter((ad) => String(ad.ownerId ?? '') === oid);
  }, [ads]);

  // ====== REVIEWED (избранные) для cargo ======

  // начальная загрузка/перезагрузка при смене пользователя
  const loadReviewed = useCallback(async () => {
    if (!authUserId) {
      setReviewedIds([]);
      return;
    }
    try {
      setReviewLoading(true);
      setReviewError(null);
      const ids = await UserReviewAdService.getUserReviewAds(authUserId, 'cargo');
      setReviewedIds(Array.isArray(ids) ? ids : []);
    } catch (e) {
      setReviewError(e?.message || String(e));
    } finally {
      setReviewLoading(false);
    }
  }, [authUserId]);

  useEffect(() => {
    // грузим избранное, когда появляется/меняется юзер
    loadReviewed();
  }, [loadReviewed]);

  // пометить объявление как «в отобранных»
  const addReviewAd = useCallback(async (adId) => {
    if (!authUserId || !adId) return;
    // оптимистично
    setReviewedIds((prev) => (prev.includes(adId) ? prev : [...prev, adId]));
    try {
      await UserReviewAdService.addReviewAd(authUserId, adId, 'cargo');
    } catch (e) {
      // откат при ошибке
      setReviewedIds((prev) => prev.filter((id) => id !== adId));
      throw e;
    }
  }, [authUserId]);

  // убрать из «отобранных»
  const removeReviewAd = useCallback(async (adId) => {
    if (!authUserId || !adId) return;
    // оптимистично
    setReviewedIds((prev) => prev.filter((id) => id !== adId));
    try {
      await UserReviewAdService.removeReviewAd(authUserId, adId, 'cargo');
    } catch (e) {
      // откат при ошибке
      setReviewedIds((prev) => (prev.includes(adId) ? prev : [...prev, adId]));
      throw e;
    }
  }, [authUserId]);

  const toggleReviewAd = useCallback(async (adId) => {
    if (!authUserId || !adId) return;
    const isAdded = reviewedIds.includes(adId);
    return isAdded ? removeReviewAd(adId) : addReviewAd(adId);
  }, [authUserId, reviewedIds, addReviewAd, removeReviewAd]);

  const isReviewed = useCallback((adId) => {
    return reviewedIds.includes(String(adId));
  }, [reviewedIds]);

  // ====== value ======
  const value = useMemo(() => ({
    // объявления
    ads,
    loading,
    error,
    refresh,
    addAd,
    updateAd,
    deleteAd,

    getById,
    getAdById: getById,
    getByOwner,

    // reviewed cargo
    reviewedIds,
    reviewLoading,
    reviewError,
    loadReviewed,
    addReviewAd,
    removeReviewAd,
    toggleReviewAd,
    isReviewed,
  }), [
    ads, loading, error, refresh, addAd, updateAd, deleteAd,
    getById, getByOwner,
    reviewedIds, reviewLoading, reviewError,
    loadReviewed, addReviewAd, removeReviewAd, toggleReviewAd, isReviewed
  ]);

  return (
    <CargoAdsContext.Provider value={value}>
      {children}
    </CargoAdsContext.Provider>
  );
};

export default CargoAdsContext;
